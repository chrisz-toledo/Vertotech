import React, { useMemo } from 'react';
import type { Expense, Jobsite, Employee } from '../../types';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { CreditCardIcon } from '../icons/new/CreditCardIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { Popover } from '../shared/Popover';
import { EmployeeQuickView } from '../employees/EmployeeQuickView';

interface ExpenseCardProps {
    expense: Expense;
    jobsite?: Jobsite;
    employee?: Employee;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, jobsite, employee, onEdit, onDelete }) => {
    const association = useMemo(() => {
        if (jobsite) return <>Obra: {jobsite.address}</>;
        if (employee) return (
            <>
                Empleado: {' '}
                <Popover
                    trigger={<span className="underline decoration-dotted cursor-pointer">{employee.name}</span>}
                    content={<EmployeeQuickView employee={employee} />}
                />
            </>
        );
        return 'Gasto general';
    }, [jobsite, employee]);

    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 border-2 border-cyan-200 dark:border-cyan-700">
                <CreditCardIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400"/>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{expense.description}</p>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{expense.category}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-semibold">Fecha:</span> {new Date(expense.date).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                    <p><span className="font-semibold">Proveedor:</span> {expense.vendor || 'N/A'}</p>
                    <p><span className="font-semibold">Asociado a:</span> {association}</p>
                </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => onEdit(expense)} title="Editar Gasto" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(expense)} title="Eliminar Gasto" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const ExpenseList: React.FC = () => {
    const financeStore = useFinanceStore();
    const operationsStore = useOperationsStore();
    const peopleStore = usePeopleStore();
    const appStore = useAppStore();
    const { open: openModal } = useModalManager();

    const { expenses } = financeStore;
    const { jobsites } = operationsStore;
    const { employees } = peopleStore;

    const onEdit = (expense: Expense) => openModal('expense', { expense });
    const onDelete = (expense: Expense) => appStore.confirm({title: 'Eliminar Gasto', message: '¿Mover a la papelera?', onConfirm: () => financeStore.deleteExpense([expense.id])});
    const onAdd = () => openModal('expense');

    const jobsiteMap = useMemo(() => new Map<string, Jobsite>(jobsites.map(j => [j.id, j])), [jobsites]);
    const employeeMap = useMemo(() => new Map<string, Employee>(employees.map(e => [e.id, e])), [employees]);

    const sortedExpenses = useMemo(() => 
        [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gastos</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <CreditCardIcon className="w-5 h-5" />
                    <span>Añadir Gasto</span>
                </button>
            </div>
            {sortedExpenses.length > 0 ? (
                <div className="space-y-6">
                    {sortedExpenses.map(expense => (
                        <ExpenseCard
                            key={expense.id}
                            expense={expense}
                            jobsite={expense.jobsiteId ? jobsiteMap.get(expense.jobsiteId) : undefined}
                            employee={expense.employeeId ? employeeMap.get(expense.employeeId) : undefined}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CreditCardIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Gastos Registrados</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada un nuevo gasto para empezar a llevar un registro.</p>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;