

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { DocumentReportIcon } from '../icons/new/DocumentReportIcon';
import { FileDownIcon } from '../icons/FileDownIcon';
import { getPayrollAnalysis } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import type { Employee } from '../../types';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const target = new Date(d.setDate(diff));
    return new Date(target.setHours(0,0,0,0));
};
const formatDateToYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];
const formatWeekDisplay = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const startStr = startDate.toLocaleDateString('es-ES', options);
    const endStr = endDate.toLocaleDateString('es-ES', { ...options, year: 'numeric' });
    return `${startStr} - ${endStr}`;
};
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const PayrollReport: React.FC = () => {
    const [currentWeek, setCurrentWeek] = useState(() => getWeekStartDate(new Date()));
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    const { employees } = usePeopleStore();
    const { timeLogs } = useOperationsStore();

    const payrollData = useMemo(() => {
        const weekStartDateStr = formatDateToYYYYMMDD(currentWeek);
        const relevantLogs = timeLogs.filter(log => log.weekStartDate === weekStartDateStr);
        const employeeMap: Map<string, Employee> = new Map(employees.map(e => [e.id, e]));
        const payrollMap = new Map<string, { employee: Employee; regularHours: number; overtimeHours: number; totalPay: number }>();

        for (const log of relevantLogs) {
            for (const [employeeId, weekHours] of Object.entries(log.employeeHours)) {
                const employee = employeeMap.get(employeeId);
                if (!employee || !employee.isActive) continue;

                const reg = Object.values(weekHours).reduce((sum, day) => sum + day.regular, 0);
                const ot = Object.values(weekHours).reduce((sum, day) => sum + day.overtime, 0);

                if (reg > 0 || ot > 0) {
                    const existing = payrollMap.get(employeeId) || { employee, regularHours: 0, overtimeHours: 0, totalPay: 0 };
                    existing.regularHours += reg;
                    existing.overtimeHours += ot;
                    existing.totalPay += (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
                    payrollMap.set(employeeId, existing);
                }
            }
        }
        return Array.from(payrollMap.values()).sort((a, b) => a.employee.name.localeCompare(b.employee.name));
    }, [employees, timeLogs, currentWeek]);
    
    const historicalPayrollData = useMemo(() => {
        if (timeLogs.length === 0) return null;
        const employeeMap: Map<string, Employee> = new Map(employees.map(e => [e.id, e]));
        const weeklyTotals: { [weekStart: string]: number } = {};

        for (const log of timeLogs) {
            let weekTotal = weeklyTotals[log.weekStartDate] || 0;
            for (const [employeeId, weekHours] of Object.entries(log.employeeHours)) {
                const employee = employeeMap.get(employeeId);
                if (employee) {
                    const reg = Object.values(weekHours).reduce((sum, day) => sum + day.regular, 0);
                    const ot = Object.values(weekHours).reduce((sum, day) => sum + day.overtime, 0);
                    weekTotal += (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
                }
            }
            weeklyTotals[log.weekStartDate] = weekTotal;
        }

        const totalsArray = Object.values(weeklyTotals);
        if (totalsArray.length === 0) return null;

        const averageWeeklyPayroll = totalsArray.reduce((sum, total) => sum + total, 0) / totalsArray.length;
        const maxWeeklyPayroll = Math.max(...totalsArray);

        return {
            averageWeeklyPayroll,
            maxWeeklyPayroll,
            numberOfWeeks: totalsArray.length,
        };
    }, [employees, timeLogs]);
    
    const totalPayroll = payrollData.reduce((sum, data) => sum + data.totalPay, 0);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        setAiAnalysis('');
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const handleRunAnalysis = async () => {
        setIsAnalysisLoading(true);
        if (!historicalPayrollData) {
            setAiAnalysis("No hay suficientes datos históricos para un análisis comparativo.");
            setIsAnalysisLoading(false);
            return;
        }
        const analysis = await getPayrollAnalysis(
            { week: formatWeekDisplay(currentWeek), totalPayroll, data: payrollData },
            historicalPayrollData
        );
        setAiAnalysis(analysis);
        setIsAnalysisLoading(false);
    };

    useEffect(() => {
        setAiAnalysis(''); // Clear analysis when data changes
    }, [payrollData]);

    const handleExportCSV = () => {
        if (payrollData.length === 0) return;
        const headers = ["ID Empleado", "Nombre", "Oficio", "Horas Regulares", "Horas Overtime", "Tarifa Regular", "Tarifa Overtime", "Pago Total"];
        const rows = payrollData.map(data => [`"${data.employee.id}"`, `"${data.employee.name}"`, `"${data.employee.job}"`, data.regularHours.toFixed(2), data.overtimeHours.toFixed(2), data.employee.hourlyRate.toFixed(2), data.employee.overtimeRate.toFixed(2), data.totalPay.toFixed(2)].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Payroll_Report_${formatDateToYYYYMMDD(currentWeek)}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShareReport = async () => {
        const printableElement = document.getElementById('printable-content');
        if (payrollData.length === 0 || !printableElement) return;

        const weekLabel = formatWeekDisplay(currentWeek);
        const pdfFile = await generatePdfFileFromElement(printableElement, `Payroll-Report-${weekLabel}.pdf`);

        if (!pdfFile) {
            alert('No se pudo generar el PDF para compartir.');
            return;
        }

        const shareData = {
            title: `Reporte de Nómina - ${weekLabel}`,
            text: `Aquí está el reporte de nómina para la semana de ${weekLabel}. Total: ${formatCurrency(totalPayroll)}`,
            files: [pdfFile],
        };

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error al compartir el reporte:', error);
                }
            }
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfFile);
            link.download = pdfFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            alert('La compartición de archivos no es compatible. En su lugar, se ha descargado el PDF.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 no-print">
                 <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reporte de Nómina</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Calcule el pago semanal y utilice la IA para detectar anomalías.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                        <button onClick={() => handleWeekChange('prev')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6" /></button>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 text-center w-full sm:w-64">{formatWeekDisplay(currentWeek)}</span>
                        <button onClick={() => handleWeekChange('next')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-6 h-6" /></button>
                    </div>
                     <div className="flex items-stretch gap-2">
                        <button onClick={() => window.print()} disabled={payrollData.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-gray-600 rounded-lg shadow-sm hover:bg-gray-700 disabled:bg-gray-300">
                            <PrinterIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleShareReport} disabled={payrollData.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 disabled:bg-sky-300">
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleExportCSV} disabled={payrollData.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300">
                            <FileDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div id="printable-content" className="p-0 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {payrollData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Empleado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Horas Regulares</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Horas Overtime</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pago Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {payrollData.map(data => (
                                <tr key={data.employee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.employee.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{data.employee.job}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">{data.regularHours.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">{data.overtimeHours.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(data.totalPay)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold uppercase text-gray-700 dark:text-gray-200">Total General</td>
                                <td className="px-6 py-4 text-right font-mono font-extrabold text-xl text-emerald-700 dark:text-emerald-300">{formatCurrency(totalPayroll)}</td>
                            </tr>
                        </tfoot>
                    </table>
                ) : (
                     <div className="text-center py-16 px-6">
                        <DocumentReportIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay datos de nómina para esta semana</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Asegúrese de que se hayan registrado las horas para el período seleccionado.</p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm no-print">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Análisis con IA</h3>
                    <button onClick={handleRunAnalysis} disabled={isAnalysisLoading || payrollData.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700 disabled:bg-violet-300">
                        <SparklesIcon className={`w-5 h-5 ${isAnalysisLoading ? 'animate-spin' : ''}`} />
                        <span>{isAnalysisLoading ? 'Analizando...' : 'Ejecutar Análisis'}</span>
                    </button>
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[100px]">
                    {isAnalysisLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <SparklesIcon className="w-8 h-8 text-violet-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />') }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrollReport;
