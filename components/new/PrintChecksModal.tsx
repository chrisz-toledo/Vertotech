
import React, { useMemo } from 'react';
import type { PayrollRun, Employee, CompanyInfo, FinancialSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { formatCurrency } from '../../utils/formatters';
import { numberToWords, numberToWords_EN } from '../../utils/numberToWords';
import { ShareIcon } from '../icons/ShareIcon';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

interface PrintChecksModalProps {
    isOpen: boolean;
    onClose: () => void;
    payrollRun: PayrollRun | null;
    companyInfo: CompanyInfo;
    financialSettings: FinancialSettings;
    employees: Employee[];
    onMarkAsPaid: (id: string) => void;
}

const Check: React.FC<{ 
    payment: PayrollRun['payments'][0], 
    companyInfo: CompanyInfo, 
    financialSettings: FinancialSettings, 
    date: string, 
    employee: Employee | undefined,
    checkNumber: string,
}> = ({ payment, companyInfo, financialSettings, date, employee, checkNumber }) => {
    const { t, language } = useTranslation();
    
    const paidAmountInWords = language === 'en' 
        ? numberToWords_EN(payment.paidAmount) 
        : numberToWords(payment.paidAmount);
        
    const totalDeductions = payment.deductions.reduce((sum, d) => sum + d.amount, 0);
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    
    const regularRate = employee?.hourlyRate || 0;
    const overtimeRate = employee?.overtimeRate || 0;
    
    const securityBg = `url("data:image/svg+xml,%3csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%239ca3af' fill-opacity='0.08' fill-rule='evenodd'%3e%3cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3e%3c/g%3e%3c/svg%3e")`;

    return (
        <div className="bg-gray-100 p-2 my-4 check-container font-sans text-xs">
            {/* Top Check Part */}
            <div className="bg-white text-black p-4 border border-gray-400 relative" style={{ backgroundImage: securityBg }}>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <p className="font-bold text-base">{companyInfo.name}</p>
                        <p>{companyInfo.address}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold">Check No:</span> {checkNumber}</p>
                        <p><span className="font-semibold">Date:</span> {new Date(date).toLocaleDateString(locale)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="col-span-2 flex items-center">
                        <span className="font-semibold text-gray-600">PAY TO THE ORDER OF</span>
                        <p className="ml-2 font-semibold tracking-wide flex-grow border-b border-gray-300 pb-1">{payment.employeeName}</p>
                    </div>
                    <div className="flex items-center border-2 border-gray-500 p-1 bg-gray-100">
                        <span className="text-sm font-semibold">$</span>
                        <span className="font-bold text-lg ml-1 tracking-wider text-right w-full">{formatCurrency(payment.paidAmount).replace('$', '')}</span>
                    </div>
                </div>

                <div className="flex items-center mt-2">
                    <p className="font-semibold tracking-wide border-b border-gray-300 flex-grow pb-1">{paidAmountInWords}</p>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div>
                        <p className="font-bold">{financialSettings.checkPrintingSettings.bankName}</p>
                        <p className="text-gray-600">{financialSettings.checkPrintingSettings.bankAddress}</p>
                        <div className="flex items-center mt-2">
                            <span className="font-semibold text-gray-600">MEMO</span>
                            <p className="ml-2 border-b border-gray-300 flex-grow px-2 pb-1">Payroll</p>
                        </div>
                    </div>
                    <div className="border-b-2 border-gray-400 w-2/5 pb-1">
                        <p className="text-right text-xs text-gray-500">SIGNATURE</p>
                    </div>
                </div>

                <div className="font-mono text-base mt-2 flex justify-between items-center text-gray-700">
                    <span>&#9302;{financialSettings.checkPrintingSettings.routingNumber}&#9302;</span>
                    <span>&#9304;{financialSettings.checkPrintingSettings.accountNumber}&#9304;</span>
                    <span> {checkNumber}&#9303;</span>
                </div>
            </div>

            {/* Stub Part */}
            <div className="border-t-2 border-dashed border-gray-400 mt-2 pt-2 bg-white text-black p-4 border border-gray-400 border-t-0">
                <h4 className="font-bold text-center uppercase">{t('payStub')}</h4>
                <div className="grid grid-cols-2 gap-x-8 mt-2 text-xs">
                    <div>
                        <p><strong>{companyInfo.name}</strong></p>
                        <p><strong>{t('employee')}:</strong> {payment.employeeName}</p>
                    </div>
                    <div className="text-right">
                         <p><strong>{t('payDate')}:</strong> {new Date(date).toLocaleDateString(locale)}</p>
                         <p><strong>Check No:</strong> {checkNumber}</p>
                    </div>
                </div>
                <table className="w-full mt-2 text-xs">
                    <thead>
                        <tr className="border-y border-gray-300">
                            <th className="text-left py-1 font-semibold">Description</th>
                            <th className="text-right py-1 font-semibold">Hours</th>
                            <th className="text-right py-1 font-semibold">Rate</th>
                            <th className="text-right py-1 font-semibold">Earnings</th>
                            <th className="text-right py-1 font-semibold">Deductions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1">{t('regularPay')}</td>
                            <td className="text-right py-1">{payment.regularHours.toFixed(2)}</td>
                            <td className="text-right py-1">{formatCurrency(regularRate)}</td>
                            <td className="text-right py-1">{formatCurrency(payment.regularHours * regularRate)}</td>
                            <td></td>
                        </tr>
                        {payment.overtimeHours > 0 && (
                            <tr>
                                <td className="py-1">{t('overtimePay')}</td>
                                <td className="text-right py-1">{payment.overtimeHours.toFixed(2)}</td>
                                <td className="text-right py-1">{formatCurrency(overtimeRate)}</td>
                                <td className="text-right py-1">{formatCurrency(payment.overtimeHours * overtimeRate)}</td>
                                <td></td>
                            </tr>
                        )}
                         {payment.deductions.map((deduction, index) => (
                             <tr key={index}>
                                <td colSpan={4} className="text-right py-1">{deduction.description}</td>
                                <td className="text-right py-1">({formatCurrency(deduction.amount)})</td>
                            </tr>
                         ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-400">
                        <tr>
                            <td colSpan={3} className="text-right font-bold py-1">GROSS PAY</td>
                            <td className="text-right font-bold py-1">{formatCurrency(payment.grossPay)}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="text-right py-1">Total Deductions</td>
                            <td className="text-right py-1">({formatCurrency(totalDeductions)})</td>
                        </tr>
                        <tr className="border-t border-gray-300">
                             <td colSpan={4} className="text-right font-bold py-1">NET PAY</td>
                            <td className="text-right font-bold py-1">{formatCurrency(payment.calculatedNetPay)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export const PrintChecksModal: React.FC<PrintChecksModalProps> = ({ isOpen, onClose, payrollRun, companyInfo, financialSettings, employees, onMarkAsPaid }) => {
    const { t } = useTranslation();
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

    if (!isOpen || !payrollRun) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleMarkPaid = () => {
        onMarkAsPaid(payrollRun.id);
        onClose();
    };

    const handleShare = async () => {
        const printableElement = document.querySelector('.printable-area');
        if (!payrollRun || !printableElement) return;
        
        const pdfFile = await generatePdfFileFromElement(printableElement as HTMLElement, `Payroll-Checks-${payrollRun.weekStartDate}.pdf`);
        if (!pdfFile) {
            alert('Failed to generate PDF for sharing.');
            return;
        }

        const shareData = {
            title: `Cheques de Nómina - ${payrollRun.weekStartDate}`,
            text: `Aquí están los cheques de la nómina para la semana de ${new Date(payrollRun.weekStartDate + 'T00:00:00Z').toLocaleDateString()}.`,
            files: [pdfFile],
        };
        
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error(error);
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl no-print">
                    <div className="flex items-center gap-3"><PrinterIcon className="w-6 h-6 text-blue-600"/><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('printChecks')}</h2></div>
                    <button onClick={onClose} className="p-1 rounded-full"><XCircleIcon className="w-8 h-8"/></button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto">
                    <div className="printable-area">
                        {payrollRun.payments.map((payment, index) => (
                             <Check 
                                key={payment.employeeId} 
                                payment={payment} 
                                companyInfo={companyInfo} 
                                financialSettings={financialSettings} 
                                date={payrollRun.processingDate} 
                                employee={employeeMap.get(payment.employeeId)}
                                checkNumber={`${payrollRun.id.slice(-4)}-${101 + index}`}
                            />
                        ))}
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-b-2xl no-print">
                    {payrollRun.status === 'pending_payment' && (
                         <button onClick={handleMarkPaid} className="px-6 py-2.5 font-semibold text-white bg-emerald-600 rounded-lg">Marcar como Pagada</button>
                    )}
                    <div className="flex-grow"></div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cerrar</button>
                        <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 font-semibold bg-sky-600 text-white rounded-lg">
                           <ShareIcon className="w-5 h-5"/> Compartir
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg">
                           <PrinterIcon className="w-5 h-5"/> Imprimir
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PrintChecksModal;