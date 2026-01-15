import React from 'react';
import type { Employee } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CoinsIcon } from '../icons/new/CoinsIcon';
import { formatCurrency } from '../../utils/formatters';

interface BalanceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

export const BalanceHistoryModal: React.FC<BalanceHistoryModalProps> = ({ isOpen, onClose, employee }) => {
    const { t } = useTranslation();

    if (!isOpen || !employee) return null;

    let runningBalance = 0;
    const historyWithBalance = (employee.balanceHistory || [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => {
        runningBalance += (entry.type === 'debit' ? entry.amount : -entry.amount);
        return { ...entry, balance: runningBalance };
    });

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] max-h-[700px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <CoinsIcon className="w-6 h-6 text-amber-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Balance History for {employee.name}</h2>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <main className="p-6 flex-grow overflow-y-auto">
                    {historyWithBalance.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="p-3 text-left text-xs font-medium uppercase">Date</th>
                                    <th className="p-3 text-left text-xs font-medium uppercase">Description</th>
                                    <th className="p-3 text-right text-xs font-medium uppercase">Debit (+)</th>
                                    <th className="p-3 text-right text-xs font-medium uppercase">Credit (-)</th>
                                    <th className="p-3 text-right text-xs font-medium uppercase">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {historyWithBalance.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="p-3 text-sm">{new Date(entry.date + 'T00:00:00').toLocaleDateString()}</td>
                                        <td className="p-3 text-sm">{entry.description}</td>
                                        <td className="p-3 text-right font-mono text-rose-600">{entry.type === 'debit' ? formatCurrency(entry.amount) : ''}</td>
                                        <td className="p-3 text-right font-mono text-emerald-600">{entry.type === 'credit' ? formatCurrency(entry.amount) : ''}</td>
                                        <td className="p-3 text-right font-semibold">{formatCurrency(entry.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500">No balance history found.</p>
                    )}
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                     <button onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">{t('close')}</button>
                </footer>
            </div>
        </div>
    );
};