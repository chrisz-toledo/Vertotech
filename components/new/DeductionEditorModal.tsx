import React, { useState, useEffect } from 'react';
import type { EmployeePayment, Deduction } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';

interface DeductionEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentsToEdit: EmployeePayment[];
    onSave: (updatedPayments: EmployeePayment[]) => void;
}

const DeductionEditorModal: React.FC<DeductionEditorModalProps> = ({ isOpen, onClose, paymentsToEdit, onSave }) => {
    const { t } = useTranslation();
    const [localPayments, setLocalPayments] = useState<EmployeePayment[]>([]);
    const [newDeduction, setNewDeduction] = useState({ description: '', amount: 0 });
    const [pendingBalanceAmount, setPendingBalanceAmount] = useState(0);

    useEffect(() => {
        // Deep copy to avoid mutating parent state directly
        setLocalPayments(JSON.parse(JSON.stringify(paymentsToEdit)));
        setPendingBalanceAmount(0);
        setNewDeduction({ description: '', amount: 0 });
    }, [paymentsToEdit, isOpen]);
    
    const handleAddDeduction = () => {
        if (!newDeduction.description.trim() || newDeduction.amount <= 0) return;
        
        const updated = localPayments.map(p => {
            const newDeductions = [...p.deductions, { ...newDeduction }];
            const totalDeductions = newDeductions.reduce((sum, d) => sum + d.amount, 0);
            const calculatedNetPay = p.grossPay - totalDeductions;
            return {
                ...p,
                deductions: newDeductions,
                calculatedNetPay: calculatedNetPay,
                paidAmount: calculatedNetPay
            };
        });
        setLocalPayments(updated);
        setNewDeduction({ description: '', amount: 0 });
    };

    const handleAddPendingBalance = () => {
        if (pendingBalanceAmount <= 0) return;

        const newDeductionItem = {
            description: 'Saldo Pendiente (No Pagado)',
            amount: pendingBalanceAmount
        };

        const updated = localPayments.map(p => {
            const newDeductions = [...p.deductions, newDeductionItem];
            const totalDeductions = newDeductions.reduce((sum, d) => sum + d.amount, 0);
            const calculatedNetPay = p.grossPay - totalDeductions;
            return {
                ...p,
                deductions: newDeductions,
                calculatedNetPay: calculatedNetPay,
                paidAmount: calculatedNetPay
            };
        });
        setLocalPayments(updated);
        setPendingBalanceAmount(0);
    };
    
    const handleRemoveDeduction = (employeeId: string, index: number) => {
        const updated = localPayments.map(p => {
            if (p.employeeId === employeeId) {
                const newDeductions = p.deductions.filter((_, i) => i !== index);
                const totalDeductions = newDeductions.reduce((sum, d) => sum + d.amount, 0);
                const calculatedNetPay = p.grossPay - totalDeductions;
                 return {
                    ...p,
                    deductions: newDeductions,
                    calculatedNetPay: calculatedNetPay,
                    paidAmount: calculatedNetPay
                };
            }
            return p;
        });
        setLocalPayments(updated);
    };

    const handleSave = () => {
        onSave(localPayments);
        onClose();
    };

    if (!isOpen) return null;

    const isGroupEdit = paymentsToEdit.length > 1;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {isGroupEdit ? `Editar Deducciones (${paymentsToEdit.length} Empleados)` : `Editar Deducciones para ${paymentsToEdit[0]?.employeeName}`}
                    </h2>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <main className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {!isGroupEdit && localPayments[0] && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Deducciones Actuales:</h4>
                            {localPayments[0].deductions.length > 0 ? (
                                <ul className="space-y-1">
                                {localPayments[0].deductions.map((d, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <span>{d.description}</span>
                                        <div className="flex items-center gap-2">
                                            <span>({formatCurrency(d.amount)})</span>
                                            <button onClick={() => handleRemoveDeduction(localPayments[0].employeeId, i)} className="text-rose-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No hay deducciones.</p>
                            )}
                        </div>
                    )}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold mb-2">Añadir Saldo Pendiente</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Esto deducirá del pago neto y lo agregará al saldo pendiente del empleado.</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Monto pendiente"
                                value={pendingBalanceAmount || ''}
                                onChange={e => setPendingBalanceAmount(parseFloat(e.target.value) || 0)}
                                className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                                min="0.01"
                                step="0.01"
                            />
                            <button onClick={handleAddPendingBalance} className="px-4 py-2 font-semibold text-white bg-amber-600 rounded-lg">Añadir Saldo</button>
                        </div>
                    </div>

                     <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold mb-2">{t('addDeduction')}</h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={t('deductionDescription')}
                                value={newDeduction.description}
                                onChange={e => setNewDeduction(p => ({ ...p, description: e.target.value }))}
                                className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="number"
                                placeholder="Monto"
                                value={newDeduction.amount || ''}
                                onChange={e => setNewDeduction(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                                className="w-28 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                                min="0.01"
                                step="0.01"
                            />
                            <button onClick={handleAddDeduction} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg">Añadir</button>
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                     <button onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                     <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-emerald-600 rounded-lg">Guardar Cambios</button>
                </footer>
            </div>
        </div>
    );
};

export default DeductionEditorModal;