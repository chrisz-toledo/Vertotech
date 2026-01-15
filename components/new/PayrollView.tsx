
import React from 'react';
import type { PayrollRun } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { formatCurrency } from '../../utils/formatters';
import { PencilIcon } from '../icons/PencilIcon';

interface PayrollViewProps {
    payrollRuns: PayrollRun[];
    onRunPayroll: () => void;
    onPrintChecks: (run: PayrollRun) => void;
    onEditPayrollRun: (run: PayrollRun) => void;
}

const PayrollRow: React.FC<{ run: PayrollRun, onPrintChecks: (run: PayrollRun) => void, onEditPayrollRun: (run: PayrollRun) => void }> = ({ run, onPrintChecks, onEditPayrollRun }) => (
    <tr className="bg-white dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
        <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{new Date(run.weekStartDate).toLocaleDateString('es-ES', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(run.processingDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
        <td className="p-4 font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(run.totalAmount)}</td>
        <td className="p-4">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${run.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'}`}>
                {run.status === 'paid' ? 'Pagada' : 'Pendiente de Pago'}
            </span>
        </td>
        <td className="p-4 text-right">
            <div className="flex items-center justify-end gap-2">
                <button 
                    onClick={() => onEditPayrollRun(run)} 
                    title="Editar Nómina" 
                    disabled={run.status === 'paid'}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => onPrintChecks(run)} 
                    className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Imprimir Cheques
                </button>
            </div>
        </td>
    </tr>
);

const PayrollView: React.FC<PayrollViewProps> = ({ payrollRuns, onRunPayroll, onPrintChecks, onEditPayrollRun }) => {
    const { t } = useTranslation();
    const sortedRuns = [...payrollRuns].sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('payroll')}</h2>
                <button onClick={onRunPayroll} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PrinterIcon className="w-5 h-5" />
                    <span>{t('runPayroll')}</span>
                </button>
            </div>
            {sortedRuns.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Semana de Pago</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha de Proceso</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto Total</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {sortedRuns.map(run => (
                                <PayrollRow key={run.id} run={run} onPrintChecks={onPrintChecks} onEditPayrollRun={onEditPayrollRun} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <PrinterIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay nóminas procesadas</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Inicie una nueva nómina para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default PayrollView;
