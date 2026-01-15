
import React, { useMemo } from 'react';
import type { PettyCashTransaction, Employee } from '../../types';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { CashIcon } from '../icons/new/CashIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';

interface PettyCashCardProps {
    transaction: PettyCashTransaction;
    employee?: Employee;
    onEdit: (transaction: PettyCashTransaction) => void;
    onDelete: (transaction: PettyCashTransaction) => void;
}

const PettyCashCard: React.FC<PettyCashCardProps> = ({ transaction, employee, onEdit, onDelete }) => {
    const isIncome = transaction.type === 'income';

    return (
        <div className={`p-4 rounded-lg border flex gap-4 items-start ${isIncome ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800'}`}>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <p className="font-semibold dark:text-gray-100">{transaction.description}</p>
                    <p className={`font-bold text-lg ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
                    <span>{new Date(transaction.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                    {transaction.category && <span>Category: {transaction.category}</span>}
                    {employee && <span>Employee: {employee.name}</span>}
                </div>
            </div>
             <div className="flex gap-2 flex-shrink-0">
                {transaction.receiptImage && (
                    // FIX: Use objectUrl for the href attribute instead of constructing a data URL with the non-existent 'data' property.
                    <a href={transaction.receiptImage.objectUrl} download={`receipt-${transaction.id}.jpg`} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"><PaperclipIcon className="w-5 h-5"/></a>
                )}
                <button onClick={() => onEdit(transaction)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"><PencilIcon className="w-5 h-5"/></button>
                <button onClick={() => onDelete(transaction)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const PettyCashView: React.FC = () => {
    const { t } = useTranslation();
    const { pettyCashTransactions, deletePettyCashTransaction } = useFinanceStore();
    const { employees } = usePeopleStore();
    const { confirm } = useAppStore();
    const { open: openModal } = useModalManager();

    const onEdit = (transaction: PettyCashTransaction) => openModal('pettyCash', { transaction });
    const onDelete = (transaction: PettyCashTransaction) => confirm({ title: 'Delete Transaction', message: 'Move to trash?', onConfirm: () => deletePettyCashTransaction([transaction.id])});
    const onAdd = () => openModal('pettyCash');

    const employeeMap = useMemo(() => new Map<string, Employee>(employees.map(e => [e.id, e])), [employees]);

    const { balance, sortedTransactions } = useMemo(() => {
        const sorted = [...pettyCashTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const balance = sorted.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        return { balance, sortedTransactions: sorted };
    }, [pettyCashTransactions]);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('pettyCash')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover">
                    <CashIcon className="w-5 h-5" />
                    <span>{t('addTransaction')}</span>
                </button>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('currentBalance')}</h3>
                <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(balance)}
                </p>
            </div>

            {sortedTransactions.length > 0 ? (
                <div className="space-y-4">
                    {sortedTransactions.map(t => (
                        <PettyCashCard 
                            key={t.id} 
                            transaction={t} 
                            employee={t.employeeId ? employeeMap.get(t.employeeId) : undefined}
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CashIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Transacciones</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada una nueva transacción para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default PettyCashView;