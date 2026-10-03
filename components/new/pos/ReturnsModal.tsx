import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePOSStore, type SaleRecord } from '../../../hooks/stores/usePOSStore';
import { useFinanceStore } from '../../../hooks/stores/useFinanceStore';
import { formatMoney, round2, PAYMENT_METHODS } from './posShared';
import { XCircleIcon } from '../../icons/XCircleIcon';
import { ArrowsRightLeftIcon } from '../../icons/new/ArrowsRightLeftIcon';

export interface ReturnPayload {
    sale: SaleRecord;
    quantities: Record<number, number>; // line index -> qty to return
    method: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (p: ReturnPayload) => void;
}

const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

export const ReturnsModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const sales = usePOSStore(s => s.sales);
    const invoices = useFinanceStore(s => s.invoices);

    const [saleId, setSaleId] = useState('');
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [method, setMethod] = useState('efectivo');

    const recentSales = useMemo(
        () => [...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20),
        [sales]
    );
    const invoiceMap = useMemo(() => new Map(invoices.map(i => [i.id, i])), [invoices]);
    const sale = recentSales.find(s => s.id === saleId);

    const refundAmount = useMemo(() => {
        if (!sale) return 0;
        return round2(sale.lines.reduce((sum, l, idx) => {
            const q = Math.min(quantities[idx] ?? 0, l.quantity);
            return sum + q * l.unitPrice;
        }, 0));
    }, [sale, quantities]);

    if (!open) return null;

    const handleConfirm = () => {
        if (!sale || refundAmount <= 0) return;
        onConfirm({ sale, quantities, method });
        setSaleId('');
        setQuantities({});
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ArrowsRightLeftIcon className="w-6 h-6" /> {t('posReturns' as any)}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-3">
                    <label className={labelClass}>{t('posRecentSales' as any)}</label>
                    <select value={saleId} onChange={(e) => { setSaleId(e.target.value); setQuantities({}); }} className={inputClass}>
                        <option value="">{t('posSelectSale' as any)}</option>
                        {recentSales.map(s => {
                            const inv = invoiceMap.get(s.invoiceId);
                            return (
                                <option key={s.id} value={s.id}>
                                    {inv?.invoiceNumber ?? s.id} · {new Date(s.createdAt).toLocaleDateString('es-MX')} · {formatMoney(inv?.total ?? 0)}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {sale && (
                    <>
                        <div className="space-y-2 mb-3">
                            {sale.lines.map((l, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2">
                                    <div className="flex-1 text-sm text-gray-900 dark:text-white">
                                        <div className="font-semibold line-clamp-1">{l.description}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('posSold' as any)}: {l.quantity} × {formatMoney(l.unitPrice)}
                                        </div>
                                    </div>
                                    <input
                                        type="number" min="0" max={l.quantity} step="1"
                                        value={quantities[idx] ?? 0}
                                        onChange={(e) => setQuantities(q => ({ ...q, [idx]: Math.max(0, Math.min(l.quantity, parseInt(e.target.value) || 0)) }))}
                                        className="w-16 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-center text-gray-900 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className={labelClass}>{t('posRefundMethod' as any)}</label>
                                <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                                    {PAYMENT_METHODS.map(m => (
                                        <option key={m.id} value={m.id}>{t(m.labelKey as any)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>{t('posRefundAmount' as any)}</label>
                                <div className="px-3 py-2 text-lg font-bold text-gray-900 dark:text-white">{formatMoney(refundAmount)}</div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!sale || refundAmount <= 0}
                        className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40"
                    >
                        {t('posProcessReturn' as any)}
                    </button>
                </div>
            </div>
        </div>
    );
};
