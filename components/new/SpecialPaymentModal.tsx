import React, { useState, useMemo } from 'react';
import type { Employee, Jobsite } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CoinsIcon } from '../icons/new/CoinsIcon';
import { formatCurrency } from '../../utils/formatters';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';

interface SpecialPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

const SpecialPaymentModal: React.FC<SpecialPaymentModalProps> = ({ isOpen, onClose, employee }) => {
    const { t } = useTranslation();
    const { makeBalancePayment } = usePeopleStore();
    const { jobsites } = useOperationsStore();
    const [amount, setAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [jobsiteId, setJobsiteId] = useState(jobsites[0]?.id || '');
    
    const outstandingBalance = useMemo(() => {
        if (!employee?.balanceHistory) return 0;
        return employee.balanceHistory.reduce((acc, entry) => {
            return acc + (entry.type === 'debit' ? entry.amount : -entry.amount);
        }, 0);
    }, [employee]);


    if (!isOpen || !employee) return null;

    const handleSave = () => {
        if (amount <= 0 || amount > outstandingBalance) {
            alert("Amount must be greater than zero and not exceed the outstanding balance.");
            return;
        }
         if (!jobsiteId) {
            alert("Please select a jobsite to charge this expense to.");
            return;
        }
        makeBalancePayment({
            employeeId: employee.id,
            amount,
            notes,
            jobsiteId,
            date: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <CoinsIcon className="w-6 h-6 text-amber-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Special Balance Payment</h2>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('employee')}:</p>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{employee.name}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Current Outstanding Balance:</p>
                        <p className="font-bold text-lg text-amber-700 dark:text-amber-500">{formatCurrency(outstandingBalance)}</p>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Pay</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount || ''}
                            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                            max={outstandingBalance}
                            min="0.01"
                            step="0.01"
                            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="jobsiteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Charge Expense to Jobsite</label>
                        <select id="jobsiteId" value={jobsiteId} onChange={e => setJobsiteId(e.target.value)} required className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white">
                            <option value="" disabled>Select a jobsite</option>
                            {jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                     <button onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                     <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-primary rounded-lg">{t('confirmPayment')}</button>
                </footer>
            </div>
        </div>
    );
};

export default SpecialPaymentModal;