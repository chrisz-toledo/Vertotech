import React, { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePOSStore } from '../../../hooks/stores/usePOSStore';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { formatMoney } from './posShared';
import { XCircleIcon } from '../../icons/XCircleIcon';
import { TicketIcon } from '../../icons/new/TicketIcon';
import { PlusIcon } from '../../icons/new/PlusIcon';

interface Props {
    open: boolean;
    onClose: () => void;
}

const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

export const GiftCardsModal: React.FC<Props> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const giftCards = usePOSStore(s => s.giftCards);
    const issueGiftCard = usePOSStore(s => s.issueGiftCard);
    const employees = usePeopleStore(s => s.employees);

    const [amount, setAmount] = useState('');
    const [issuedBy, setIssuedBy] = useState('');
    const [lastCode, setLastCode] = useState<string | null>(null);

    if (!open) return null;

    const handleIssue = () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return;
        const code = issueGiftCard(amt, issuedBy || undefined);
        setLastCode(code);
        setAmount('');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TicketIcon className="w-6 h-6" /> {t('posGiftCards' as any)}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl p-3 mb-4 space-y-2">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{t('posIssueGiftCard' as any)}</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className={labelClass}>{t('posAmount' as any)}</label>
                            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>{t('posIssuedBy' as any)}</label>
                            <select value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} className={inputClass}>
                                <option value="">—</option>
                                {employees.filter(e => e.isActive).map(e => (
                                    <option key={e.id} value={e.name}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleIssue} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <PlusIcon className="w-4 h-4" /> {t('posIssueGiftCard' as any)}
                    </button>
                    {lastCode && (
                        <div className="text-sm text-green-700 dark:text-green-300 font-semibold">
                            {t('posGiftCardIssued' as any)}: <span className="font-mono">{lastCode}</span>
                        </div>
                    )}
                </div>

                <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {giftCards.length === 0 && (
                        <li className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">{t('posNoGiftCards' as any)}</li>
                    )}
                    {[...giftCards].reverse().map(c => (
                        <li key={c.code} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2">
                            <div>
                                <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">{c.code}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(c.issuedAt).toLocaleDateString('es-MX')}
                                    {c.issuedBy ? ` · ${c.issuedBy}` : ''}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatMoney(c.balance)}</div>
                                <div className="text-xs text-gray-400">{t('posInitial' as any)}: {formatMoney(c.initialBalance)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
