
import React, { useState, useMemo, useEffect } from 'react';
import type { Employee, TimeLog, EmployeePayment, PayrollRun, Deduction } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { formatCurrency } from '../../utils/formatters';
import DeductionEditorModal from './DeductionEditorModal';

const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const formatDateToYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

const formatWeekDisplay = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
};

interface RunPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePayrollRun: (run: Omit<PayrollRun, 'id'> | PayrollRun) => void;
    employees: Employee[];
    timeLogs: TimeLog[];
    editingPayrollRun: PayrollRun | null;
}

const DEDUCTION_RATE = 0.15; // 15% flat tax for simplicity

const RunPayrollModal: React.FC<RunPayrollModalProps> = ({ isOpen, onClose, onSavePayrollRun, employees, timeLogs, editingPayrollRun }) => {
    const { t } = useTranslation();
    const [currentWeek, setCurrentWeek] = useState(() => getWeekStartDate(new Date()));
    const [payments, setPayments] = useState<EmployeePayment[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
    const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
    const [editingDeductionFor, setEditingDeductionFor] = useState<EmployeePayment[]>([]);
    
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

    useEffect(() => {
        if (!isOpen) return;

        if (editingPayrollRun) {
            setPayments(editingPayrollRun.payments);
            setCurrentWeek(getWeekStartDate(new Date(editingPayrollRun.weekStartDate + "T00:00:00Z")));
            setSelectedEmployeeIds([]);
            return;
        }

        const weekStartDateStr = formatDateToYYYYMMDD(currentWeek);
        const relevantLogs = timeLogs.filter(log => log.weekStartDate === weekStartDateStr);
        const paymentsMap = new Map<string, Omit<EmployeePayment, 'calculatedNetPay' | 'paidAmount' | 'balancePaid' | 'newBalanceCreated'>>();

        for (const log of relevantLogs) {
            for (const [employeeId, weekHours] of Object.entries(log.employeeHours)) {
                const employee = employeeMap.get(employeeId);
                if (!employee || !employee.isActive) continue;

                const reg = Object.values(weekHours).reduce((sum, day) => sum + day.regular, 0);
                const ot = Object.values(weekHours).reduce((sum, day) => sum + day.overtime, 0);

                if (reg > 0 || ot > 0) {
                    const grossPay = (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
                    const taxDeduction: Deduction = { description: 'Impuestos (Estimado 15%)', amount: grossPay * DEDUCTION_RATE };
                    
                    const existing = paymentsMap.get(employeeId) || { employeeId, employeeName: employee.name, regularHours: 0, overtimeHours: 0, grossPay: 0, deductions: [] };
                    
                    existing.regularHours += reg;
                    existing.overtimeHours += ot;
                    existing.grossPay += grossPay;
                    
                    const existingTaxIndex = existing.deductions.findIndex(d => d.description.includes('Impuestos'));
                    if (existingTaxIndex > -1) {
                         existing.deductions[existingTaxIndex].amount += taxDeduction.amount;
                    } else {
                        existing.deductions.push(taxDeduction);
                    }
                    
                    paymentsMap.set(employeeId, existing);
                }
            }
        }
        
        const initialPayments: EmployeePayment[] = Array.from(paymentsMap.values()).map(p => {
            const employee = employeeMap.get(p.employeeId);
            const outstandingBalance = (employee?.balanceHistory || []).reduce((acc, entry) => {
                return acc + (entry.type === 'debit' ? entry.amount : -entry.amount);
            }, 0);
            
            let balancePaid = 0;
            let deductions = [...p.deductions];
            if (outstandingBalance > 0) {
                const potentialNetPay = p.grossPay - deductions.reduce((sum, d) => sum + d.amount, 0);
                balancePaid = Math.min(Math.max(0, potentialNetPay), outstandingBalance);
                if (balancePaid > 0) {
                    deductions.push({ description: 'Pago de Saldo Pendiente', amount: balancePaid });
                }
            }
            
            const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
            const calculatedNetPay = p.grossPay - totalDeductions;
            
            return {
                ...p,
                deductions,
                calculatedNetPay: calculatedNetPay,
                paidAmount: calculatedNetPay,
                balancePaid: balancePaid,
                newBalanceCreated: 0
            };
        });
        
        setPayments(initialPayments);
        setSelectedEmployeeIds([]);
    }, [currentWeek, timeLogs, employeeMap, isOpen, editingPayrollRun]);

    const totalAmount = useMemo(() => payments.reduce((sum, p) => sum + p.paidAmount, 0), [payments]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const handlePaidAmountChange = (employeeId: string, newAmount: number) => {
        setPayments(prev => prev.map(p => 
            p.employeeId === employeeId ? { ...p, paidAmount: newAmount } : p
        ));
    };

    const handleConfirm = () => {
        if (payments.length > 0) {
             const finalPayments = payments.map(p => ({
                ...p,
                newBalanceCreated: p.calculatedNetPay - p.paidAmount,
            }));

             if (editingPayrollRun) {
                onSavePayrollRun({
                    ...editingPayrollRun,
                    payments: finalPayments,
                    totalAmount
                });
            } else {
                onSavePayrollRun({
                    weekStartDate: formatDateToYYYYMMDD(currentWeek),
                    processingDate: formatDateToYYYYMMDD(new Date()),
                    status: 'pending_payment',
                    payments: finalPayments,
                    totalAmount,
                });
            }
            onClose();
        }
    };
    
    const handleOpenDeductionEditor = (payment: EmployeePayment) => {
        setEditingDeductionFor([payment]);
        setIsDeductionModalOpen(true);
    };

    const handleOpenGroupDeductionEditor = () => {
        const selectedPayments = payments.filter(p => selectedEmployeeIds.includes(p.employeeId));
        if(selectedPayments.length > 0) {
            setEditingDeductionFor(selectedPayments);
            setIsDeductionModalOpen(true);
        }
    };

    const handleSaveDeductions = (updatedPayments: EmployeePayment[]) => {
        setPayments(prev => prev.map(p => {
            const updated = updatedPayments.find(up => up.employeeId === p.employeeId);
            return updated || p;
        }));
        setIsDeductionModalOpen(false);
        setEditingDeductionFor([]);
        setSelectedEmployeeIds([]);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col h-[95vh] max-h-[900px]" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3"><PrinterIcon className="w-6 h-6 text-blue-600"/><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingPayrollRun ? 'Editar Nómina' : t('runPayroll')}</h2></div>
                        <button onClick={onClose} className="p-1 rounded-full"><XCircleIcon className="w-8 h-8"/></button>
                    </header>
                    <div className="p-4 flex justify-center items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button onClick={() => handleWeekChange('prev')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" disabled={!!editingPayrollRun}><ChevronLeftIcon className="w-6 h-6" /></button>
                        <span className="font-semibold text-center w-80 text-gray-800 dark:text-gray-100">{formatWeekDisplay(currentWeek)}</span>
                        <button onClick={() => handleWeekChange('next')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" disabled={!!editingPayrollRun}><ChevronRightIcon className="w-6 h-6" /></button>
                    </div>
                    <main className="flex-grow p-4 overflow-y-auto">
                        {payments.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-3 w-12"><input type="checkbox" onChange={(e) => setSelectedEmployeeIds(e.target.checked ? payments.map(p => p.employeeId) : [])} /></th>
                                        <th className="p-3 text-left text-xs font-medium uppercase">Empleado</th>
                                        <th className="p-3 text-right text-xs font-medium uppercase">{t('grossPay')}</th>
                                        <th className="p-3 text-right text-xs font-medium uppercase">{t('deductions')}</th>
                                        <th className="p-3 text-right text-xs font-medium uppercase">{t('netPay')}</th>
                                        <th className="p-3 text-right text-xs font-medium uppercase">Monto a Pagar</th>
                                        <th className="p-3 text-right text-xs font-medium uppercase">Saldo Pendiente</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {payments.map(p => {
                                        const totalDeductions = p.deductions.reduce((sum, d) => sum + d.amount, 0);
                                        const pendingBalance = p.calculatedNetPay - p.paidAmount;
                                        return (
                                        <tr key={p.employeeId}>
                                            <td className="p-3"><input type="checkbox" checked={selectedEmployeeIds.includes(p.employeeId)} onChange={() => setSelectedEmployeeIds(prev => prev.includes(p.employeeId) ? prev.filter(id => id !== p.employeeId) : [...prev, p.employeeId])} /></td>
                                            <td className="p-3 font-medium">{p.employeeName}</td>
                                            <td className="p-3 text-right font-mono">{formatCurrency(p.grossPay)}</td>
                                            <td className="p-3 text-right font-mono">
                                                <button onClick={() => handleOpenDeductionEditor(p)} className="text-rose-600 hover:underline">{formatCurrency(totalDeductions)}</button>
                                            </td>
                                            <td className="p-3 text-right font-mono font-semibold">{formatCurrency(p.calculatedNetPay)}</td>
                                            <td className="p-3 w-48">
                                                <input 
                                                    type="number" 
                                                    value={p.paidAmount}
                                                    onChange={(e) => handlePaidAmountChange(p.employeeId, parseFloat(e.target.value) || 0)}
                                                    className="w-full p-2 border dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 dark:text-white"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className={`p-3 text-right font-mono font-bold ${pendingBalance > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                {formatCurrency(pendingBalance)}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-500 py-16">No hay horas registradas para esta semana.</p>
                        )}
                    </main>
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="font-bold text-xl text-gray-800 dark:text-gray-100">Total a Pagar: {formatCurrency(totalAmount)}</div>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="px-6 py-2.5 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                            <button onClick={handleConfirm} disabled={payments.length === 0} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingPayrollRun ? 'Guardar Cambios' : 'Procesar Nómina'}</button>
                        </div>
                    </footer>
                </div>
            </div>
             {selectedEmployeeIds.length > 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 p-4 animate-fade-in-up">
                    <div className="bg-gray-800 text-white rounded-xl shadow-2xl flex items-center justify-between p-4">
                        <span className="font-bold">{selectedEmployeeIds.length} seleccionado(s)</span>
                        <button onClick={handleOpenGroupDeductionEditor} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg">{t('addDeduction')}</button>
                    </div>
                </div>
            )}
            <DeductionEditorModal 
                isOpen={isDeductionModalOpen}
                onClose={() => setIsDeductionModalOpen(false)}
                paymentsToEdit={editingDeductionFor}
                onSave={handleSaveDeductions}
            />
        </>
    );
};

export default RunPayrollModal;