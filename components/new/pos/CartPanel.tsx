import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { useFinanceStore } from '../../../hooks/stores/useFinanceStore';
import type { CartLine, SaleDiscount, CartTotals } from './posShared';
import { lineNet, lineDiscountAmount, formatMoney, WALK_IN_CLIENT_ID } from './posShared';
import { PlusIcon } from '../../icons/new/PlusIcon';
import { MinusCircleIcon } from '../../icons/new/MinusCircleIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import { UserIcon } from '../../icons/UserIcon';

interface Props {
    lines: CartLine[];
    onUpdateLine: (key: string, patch: Partial<CartLine>) => void;
    onRemoveLine: (key: string) => void;
    onClear: () => void;
    clientId: string;
    onClientChange: (id: string) => void;
    salespersonId: string;
    onSalespersonChange: (id: string) => void;
    saleDiscount: SaleDiscount;
    onSaleDiscountChange: (d: SaleDiscount) => void;
    totals: CartTotals;
    taxRate: number;
    onTaxRateChange: (r: number) => void;
    onCheckout: () => void;
}

const inputClass = "px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

export const CartPanel: React.FC<Props> = (props) => {
    const { t } = useTranslation();
    const clients = usePeopleStore(s => s.clients);
    const employees = usePeopleStore(s => s.employees);
    const invoices = useFinanceStore(s => s.invoices);
    const [showHistory, setShowHistory] = useState(false);

    const { lines, totals } = props;

    const history = useMemo(() => {
        if (!props.clientId || props.clientId === WALK_IN_CLIENT_ID) return [];
        return invoices
            .filter(i => i.clientId === props.clientId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5);
    }, [invoices, props.clientId]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className={labelClass}>{t('posClient' as any)}</label>
                        <select value={props.clientId} onChange={(e) => props.onClientChange(e.target.value)} className={`${inputClass} w-full`}>
                            <option value={WALK_IN_CLIENT_ID}>{t('posWalkIn' as any)}</option>
                            {clients.filter(c => c.isActive).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>{t('posSalesperson' as any)}</label>
                        <select value={props.salespersonId} onChange={(e) => props.onSalespersonChange(e.target.value)} className={`${inputClass} w-full`}>
                            <option value="">{t('posNoSalesperson' as any)}</option>
                            {employees.filter(e => e.isActive).map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {history.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowHistory(v => !v)}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                        >
                            <UserIcon className="w-4 h-4" />
                            {t('posClientHistory' as any)} ({history.length})
                        </button>
                        {showHistory && (
                            <ul className="mt-1 space-y-1 max-h-28 overflow-y-auto text-xs">
                                {history.map(h => (
                                    <li key={h.id} className="flex justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                                        <span className="text-gray-700 dark:text-gray-300">{h.invoiceNumber} · {h.issueDate}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{formatMoney(h.total)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {lines.length === 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
                        {t('posEmptyCart' as any)}
                    </div>
                )}
                {lines.map(l => (
                    <div key={l.key} className="bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl p-2.5">
                        <div className="flex justify-between items-start gap-2">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{l.description}</div>
                            <button onClick={() => props.onRemoveLine(l.key)} className="text-gray-400 hover:text-red-500 shrink-0">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                                <button onClick={() => props.onUpdateLine(l.key, { quantity: Math.max(1, l.quantity - 1) })} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                    <MinusCircleIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="number" min="1" step="1"
                                    value={l.quantity}
                                    onChange={(e) => props.onUpdateLine(l.key, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                    className={`${inputClass} w-14 text-center`}
                                />
                                <button onClick={() => props.onUpdateLine(l.key, { quantity: l.quantity + 1 })} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">× {formatMoney(l.unitPrice)}</div>
                            <div className="flex items-center gap-1 ml-auto">
                                <select
                                    value={l.discountType}
                                    onChange={(e) => props.onUpdateLine(l.key, { discountType: e.target.value as CartLine['discountType'] })}
                                    className={`${inputClass} text-xs`}
                                >
                                    <option value="percent">%</option>
                                    <option value="fixed">$</option>
                                </select>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={l.discountValue || ''}
                                    placeholder={t('posDiscount' as any)}
                                    onChange={(e) => props.onUpdateLine(l.key, { discountValue: Math.max(0, parseFloat(e.target.value) || 0) })}
                                    className={`${inputClass} w-16 text-xs`}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-1.5 text-xs">
                            {lineDiscountAmount(l) > 0 ? (
                                <span className="text-green-600 dark:text-green-400">-{formatMoney(lineDiscountAmount(l))}</span>
                            ) : <span />}
                            <span className="font-bold text-gray-900 dark:text-white">{formatMoney(lineNet(l))}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className={labelClass}>{t('posSaleDiscount' as any)}</label>
                        <div className="flex gap-1">
                            <select
                                value={props.saleDiscount.type}
                                onChange={(e) => props.onSaleDiscountChange({ ...props.saleDiscount, type: e.target.value as SaleDiscount['type'] })}
                                className={inputClass}
                            >
                                <option value="percent">%</option>
                                <option value="fixed">$</option>
                            </select>
                            <input
                                type="number" min="0" step="0.01"
                                value={props.saleDiscount.value || ''}
                                onChange={(e) => props.onSaleDiscountChange({ ...props.saleDiscount, value: Math.max(0, parseFloat(e.target.value) || 0) })}
                                className={`${inputClass} w-full`}
                            />
                        </div>
                    </div>
                    <div className="w-24">
                        <label className={labelClass}>{t('posTaxRate' as any)} %</label>
                        <input
                            type="number" min="0" max="100" step="0.1"
                            value={Math.round(props.taxRate * 1000) / 10}
                            onChange={(e) => props.onTaxRateChange(Math.max(0, (parseFloat(e.target.value) || 0) / 100))}
                            className={`${inputClass} w-full`}
                        />
                    </div>
                </div>

                <div className="text-sm space-y-1">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{t('posSubtotal' as any)}</span><span>{formatMoney(totals.subtotal)}</span>
                    </div>
                    {(totals.lineDiscounts + totals.saleDiscount) > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>{t('posDiscounts' as any)}</span><span>-{formatMoney(totals.lineDiscounts + totals.saleDiscount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{t('posTax' as any)}</span><span>{formatMoney(totals.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                        <span>{t('posTotal' as any)}</span><span>{formatMoney(totals.total)}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={props.onClear}
                        disabled={lines.length === 0}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
                    >
                        {t('posClear' as any)}
                    </button>
                    <button
                        onClick={props.onCheckout}
                        disabled={lines.length === 0}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40"
                    >
                        {t('posCheckout' as any)} · {formatMoney(totals.total)}
                    </button>
                </div>
            </div>
        </div>
    );
};
