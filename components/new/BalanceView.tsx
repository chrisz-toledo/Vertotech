import React, { useMemo } from 'react';
import type { Employee } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useModalManager } from '../../hooks/useModalManager';
import { CoinsIcon } from '../icons/new/CoinsIcon';
import { formatCurrency } from '../../utils/formatters';

interface BalanceViewProps {
    employees: Employee[];
    onOpenSpecialPaymentModal: (employee: Employee) => void;
}

const BalanceView: React.FC<BalanceViewProps> = ({ employees, onOpenSpecialPaymentModal }) => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();

    const employeesWithBalance = useMemo(() => {
        return employees
            .map(e => {
                const balance = (e.balanceHistory || []).reduce((acc, entry) => {
                    return acc + (entry.type === 'debit' ? entry.amount : -entry.amount);
                }, 0);
                return { ...e, calculatedBalance: balance };
            })
            .filter(e => e.calculatedBalance > 0.01) // Use a small epsilon for float comparison
            .sort((a, b) => b.calculatedBalance - a.calculatedBalance);
    }, [employees]);

    const totalOutstanding = useMemo(() => {
        return employeesWithBalance.reduce((sum, e) => sum + e.calculatedBalance, 0);
    }, [employeesWithBalance]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employee Outstanding Balances</h2>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Outstanding</h3>
                <p className={`text-4xl font-bold mt-2 text-amber-600 dark:text-amber-400`}>
                    {formatCurrency(totalOutstanding)}
                </p>
            </div>

            {employeesWithBalance.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('employee')}</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('trade')}</th>
                                <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Outstanding Balance</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {employeesWithBalance.map(employee => (
                                <tr key={employee.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{employee.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{employee.job}</td>
                                    <td className="p-4 text-right font-bold text-lg text-amber-700 dark:text-amber-500">
                                        {formatCurrency(employee.calculatedBalance)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openModal('balanceHistory', { employee })}
                                                className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                            >
                                                Ver Historial
                                            </button>
                                            <button 
                                                onClick={() => onOpenSpecialPaymentModal(employee)}
                                                className="px-3 py-1.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover"
                                            >
                                                Pagar Saldo
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CoinsIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No outstanding balances</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">All employees are up to date with their payments.</p>
                </div>
            )}
        </div>
    );
};

export default BalanceView;