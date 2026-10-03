import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePOSStore, getOpenCashSession, type SalePayment, type POSPaymentMethod } from '../../../hooks/stores/usePOSStore';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { formatMoney, round2, PAYMENT_METHODS } from './posShared';
import { XCircleIcon } from '../../icons/XCircleIcon';
import { PlusIcon } from '../../icons/new/PlusIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import { TicketIcon } from '../../icons/new/TicketIcon';

export interface CheckoutPayload {
    payments: SalePayment[];
    newSessionId?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    total: number;
    branchId: string;
    onConfirm: (p: CheckoutPayload) => void;
}

const inputClass = "px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

interface DraftPayment {
    key: string;
    method: POSPaymentMethod;
    amount: string;
    giftCardCode: string;
}

let draftSeq = 0;

export const CheckoutModal: React.FC<Props> = ({ open, onClose, total, branchId, onConfirm }) => {
    const { t } = useTranslation();
    const giftCards = usePOSStore(s => s.giftCards);
    const openSession = usePOSStore(s => s.openSession);
    const employees = usePeopleStore(s => s.employees);

    const [drafts, setDrafts] = useState<DraftPayment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [needSession, setNeedSession] = useState(false);
    const [openingAmount, setOpeningAmount] = useState('');
    const [openedBy, setOpenedBy] = useState('');

    useEffect(() => {
        if (open) {
            setDrafts([{ key: `d-${++draftSeq}`, method: 'efectivo', amount: String(total), giftCardCode: '' }]);
            setError(null);
            setNeedSession(false);
            setOpeningAmount('');
            setOpenedBy('');
        }
    }, [open, total]);

    if (!open) return null;

    const paid = round2(drafts.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0));
    const remaining = round2(total - paid);

    const giftCardBalance = (code: string): number | null => {
        const c = giftCards.find(g => g.code === code.trim().toUpperCase());
        return c ? c.balance : null;
    };

    const addDraft = () => {
        const rem = Math.max(0, remaining);
        setDrafts(ds => [...ds, { key: `d-${++draftSeq}`, method: 'tarjeta', amount: rem > 0 ? String(rem) : '', giftCardCode: '' }]);
    };

    const updateDraft = (key: string, patch: Partial<DraftPayment>) =>
        setDrafts(ds => ds.map(d => d.key === key ? { ...d, ...patch } : d));

    const removeDraft = (key: string) => setDrafts(ds => ds.filter(d => d.key !== key));

    const validate = (): SalePayment[] | null => {
        if (drafts.length === 0) { setError(t('posAddPaymentFirst' as any)); return null; }
        const payments: SalePayment[] = [];
        for (const d of drafts) {
            const amount = round2(parseFloat(d.amount) || 0);
            if (amount <= 0) { setError(t('posInvalidAmount' as any)); return null; }
            if (d.method === 'giftcard') {
                const code = d.giftCardCode.trim().toUpperCase();
                const bal = giftCardBalance(code);
                if (bal === null) { setError(t('posGiftCardNotFound' as any)); return null; }
                if (bal < amount) { setError(t('posInsufficientBalance' as any)); return null; }
                payments.push({ method: 'giftcard', amount, giftCardCode: code });
            } else {
                payments.push({ method: d.method, amount });
            }
        }
        if (Math.abs(round2(payments.reduce((s, p) => s + p.amount, 0)) - total) > 0.011) {
            setError(t('posPaymentMismatch' as any));
            return null;
        }
        return payments;
    };

    const handleConfirm = () => {
        setError(null);
        const payments = validate();
        if (!payments) return;
        const needsCash = payments.some(p => p.method === 'efectivo');
        if (needsCash && !getOpenCashSession(branchId)) {
            if (!needSession) { setNeedSession(true); return; }
            const amt = parseFloat(openingAmount);
            if (isNaN(amt) || amt < 0) { setError(t('posInvalidAmount' as any)); return; }
            const sessionId = openSession(branchId, openedBy || '—', amt);
            onConfirm({ payments, newSessionId: sessionId });
            return;
        }
        onConfirm({ payments });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('posCheckout' as any)}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 mb-4">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('posTotal' as any)}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(total)}</span>
                </div>

                <div className="space-y-2 mb-3">
                    {drafts.map(d => (
                        <div key={d.key} className="flex gap-2 items-end bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl p-2">
                            <div className="w-36">
                                <label className={labelClass}>{t('posMethod' as any)}</label>
                                <select value={d.method} onChange={(e) => updateDraft(d.key, { method: e.target.value as POSPaymentMethod })} className={`${inputClass} w-full`}>
                                    {PAYMENT_METHODS.map(m => (
                                        <option key={m.id} value={m.id}>{t(m.labelKey as any)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className={labelClass}>{t('posAmount' as any)}</label>
                                <input type="number" min="0" step="0.01" value={d.amount} onChange={(e) => updateDraft(d.key, { amount: e.target.value })} className={`${inputClass} w-full`} />
                            </div>
                            <button onClick={() => removeDraft(d.key)} className="p-2 text-gray-400 hover:text-red-500">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                            {d.method === 'giftcard' && (
                                <div className="w-full basis-full">
                                    <label className={labelClass}>{t('posGiftCardCode' as any)}</label>
                                    <div className="flex gap-2 items-center">
                                        <TicketIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                        <input
                                            value={d.giftCardCode}
                                            onChange={(e) => updateDraft(d.key, { giftCardCode: e.target.value.toUpperCase() })}
                                            placeholder="GC-XXXXXXXX"
                                            className={`${inputClass} w-full font-mono`}
                                        />
                                        {d.giftCardCode.trim() && (
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {giftCardBalance(d.giftCardCode) === null
                                                    ? t('posGiftCardNotFound' as any)
                                                    : `${t('posGiftCardBalance' as any)}: ${formatMoney(giftCardBalance(d.giftCardCode)!)}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={addDraft} className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                    <PlusIcon className="w-4 h-4" /> {t('posAddPayment' as any)}
                </button>

                <div className="flex justify-between text-sm mb-4">
                    <span className="text-gray-600 dark:text-gray-400">{t('posPaid' as any)}: <b className="text-gray-900 dark:text-white">{formatMoney(paid)}</b></span>
                    <span className={remaining > 0.009 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {t('posRemaining' as any)}: {formatMoney(Math.max(0, remaining))}
                    </span>
                </div>

                {needSession && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-3 space-y-2">
                        <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">{t('posOpenSessionNeeded' as any)}</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelClass}>{t('posOpeningAmount' as any)}</label>
                                <input type="number" min="0" step="0.01" value={openingAmount} onChange={(e) => setOpeningAmount(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t('posOpenedBy' as any)}</label>
                                <select value={openedBy} onChange={(e) => setOpenedBy(e.target.value)} className={`${inputClass} w-full`}>
                                    <option value="">—</option>
                                    {employees.filter(e => e.isActive).map(e => (
                                        <option key={e.id} value={e.name}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">{error}</div>}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                        {t('cancel')}
                    </button>
                    <button onClick={handleConfirm} className="px-5 py-2.5 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                        {t('posConfirmSale' as any)}
                    </button>
                </div>
            </div>
        </div>
    );
};
