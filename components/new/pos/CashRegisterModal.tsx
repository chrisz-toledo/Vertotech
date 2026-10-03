import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePOSStore, getSessionExpectedCash, type CashMovementKind } from '../../../hooks/stores/usePOSStore';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { formatMoney } from './posShared';
import { XCircleIcon } from '../../icons/XCircleIcon';
import { CashIcon } from '../../icons/new/CashIcon';
import { PlusIcon } from '../../icons/new/PlusIcon';

interface Props {
    open: boolean;
    onClose: () => void;
    branchId: string;
}

const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

export const CashRegisterModal: React.FC<Props> = ({ open, onClose, branchId }) => {
    const { t } = useTranslation();
    const cashSessions = usePOSStore(s => s.cashSessions);
    const openSession = usePOSStore(s => s.openSession);
    const closeSession = usePOSStore(s => s.closeSession);
    const addCashMovement = usePOSStore(s => s.addCashMovement);
    const employees = usePeopleStore(s => s.employees);

    const [openingAmount, setOpeningAmount] = useState('');
    const [openedBy, setOpenedBy] = useState('');
    const [movKind, setMovKind] = useState<CashMovementKind>('ingreso');
    const [movAmount, setMovAmount] = useState('');
    const [movReason, setMovReason] = useState('');
    const [counted, setCounted] = useState('');

    const session = useMemo(
        () => cashSessions.find(s => s.branchId === branchId && !s.closedAt),
        [cashSessions, branchId]
    );
    const expected = session ? getSessionExpectedCash(session) : 0;
    const countedNum = parseFloat(counted);
    const diff = !isNaN(countedNum) ? Math.round((countedNum - expected) * 100) / 100 : null;

    if (!open) return null;

    const handleOpen = () => {
        const amt = parseFloat(openingAmount);
        if (isNaN(amt) || amt < 0) return;
        openSession(branchId, openedBy || '—', amt);
        setOpeningAmount('');
    };

    const handleAddMovement = () => {
        if (!session) return;
        const amt = parseFloat(movAmount);
        if (isNaN(amt) || amt <= 0 || !movReason.trim()) return;
        addCashMovement(session.id, movKind, amt, movReason.trim());
        setMovAmount('');
        setMovReason('');
    };

    const handleClose = () => {
        if (!session || isNaN(countedNum)) return;
        closeSession(session.id, countedNum);
        setCounted('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CashIcon className="w-6 h-6" /> {t('posCashRegister' as any)}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {!session ? (
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('posNoOpenSession' as any)}</div>
                        <div>
                            <label className={labelClass}>{t('posOpeningAmount' as any)}</label>
                            <input type="number" min="0" step="0.01" value={openingAmount} onChange={(e) => setOpeningAmount(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>{t('posOpenedBy' as any)}</label>
                            <select value={openedBy} onChange={(e) => setOpenedBy(e.target.value)} className={inputClass}>
                                <option value="">—</option>
                                {employees.filter(e => e.isActive).map(e => (
                                    <option key={e.id} value={e.name}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleOpen} className="w-full px-4 py-2.5 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700">
                            {t('posOpenSession' as any)}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('posOpenedBy' as any)}</span><b className="text-gray-900 dark:text-white">{session.openedBy}</b></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('posOpeningAmount' as any)}</span><b className="text-gray-900 dark:text-white">{formatMoney(session.openingAmount)}</b></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('posExpectedCash' as any)}</span><b className="text-blue-600 dark:text-blue-400">{formatMoney(expected)}</b></div>
                        </div>

                        <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t('posMovements' as any)}</div>
                            <ul className="space-y-1 max-h-36 overflow-y-auto text-sm">
                                {session.movements.length === 0 && (
                                    <li className="text-xs text-gray-500 dark:text-gray-400">{t('posNoMovements' as any)}</li>
                                )}
                                {session.movements.map(m => (
                                    <li key={m.id} className="flex justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                                        <span className="text-gray-700 dark:text-gray-300 text-xs">{m.reason}</span>
                                        <span className={`text-xs font-bold ${m.kind === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                            {m.kind === 'ingreso' ? '+' : '-'}{formatMoney(m.amount)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-1 mt-2">
                                <select value={movKind} onChange={(e) => setMovKind(e.target.value as CashMovementKind)} className={`${inputClass} w-28`}>
                                    <option value="ingreso">{t('posIngreso' as any)}</option>
                                    <option value="retiro">{t('posRetiro' as any)}</option>
                                </select>
                                <input type="number" min="0" step="0.01" value={movAmount} onChange={(e) => setMovAmount(e.target.value)} placeholder={t('posAmount' as any)} className={inputClass} />
                                <input value={movReason} onChange={(e) => setMovReason(e.target.value)} placeholder={t('posReason' as any)} className={inputClass} />
                                <button onClick={handleAddMovement} className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-2">
                            <div className="text-sm font-bold text-amber-800 dark:text-amber-200">{t('posCloseSession' as any)} — {t('posCashCount' as any)}</div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <label className={labelClass}>{t('posExpected' as any)}</label>
                                    <div className="font-bold text-gray-900 dark:text-white px-1 py-2">{formatMoney(expected)}</div>
                                </div>
                                <div>
                                    <label className={labelClass}>{t('posCounted' as any)}</label>
                                    <input type="number" min="0" step="0.01" value={counted} onChange={(e) => setCounted(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>{t('posDifference' as any)}</label>
                                    <div className={`px-1 py-2 font-bold ${diff === null ? 'text-gray-400' : diff === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {diff === null ? '—' : formatMoney(diff)}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleClose} disabled={isNaN(countedNum)} className="w-full px-4 py-2.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40">
                                {t('posCloseSession' as any)}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
