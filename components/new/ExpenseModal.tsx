import React from 'react';
import type { Expense, Jobsite, Employee } from '../../types';
import ExpenseForm from './ExpenseForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CreditCardIcon } from '../icons/new/CreditCardIcon';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expenseData: Omit<Expense, 'id' | 'deletedAt'> | Expense) => void;
    editingExpense: Expense | null;
    jobsites: Jobsite[];
    employees: Employee[];
    expenseCategories: string[];
    onAddCategory: (category: string) => void;
    prefillData?: { jobsiteId?: string, employeeId?: string };
}

export const ExpenseModal: React.FC<ExpenseModalProps> = (props) => {
    const { isOpen, onClose, onSave, editingExpense, jobsites, employees, expenseCategories, onAddCategory, prefillData } = props;

    if (!isOpen) return null;

    const handleSave = (data: Omit<Expense, 'id' | 'deletedAt'> | Expense) => {
        onSave(data);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] max-h-[800px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-6 h-6 text-cyan-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingExpense ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <ExpenseForm
                            onSave={handleSave}
                            onCancel={onClose}
                            editingExpense={editingExpense}
                            jobsites={jobsites}
                            employees={employees}
                            expenseCategories={expenseCategories}
                            onAddCategory={onAddCategory}
                            prefillData={prefillData}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};