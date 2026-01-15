
import React, { useState, useEffect } from 'react';
import type { Invoice, Client, InvoiceLineItem } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';
import { InvoiceIcon } from '../icons/new/InvoiceIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    isManual?: boolean;
    prefillData?: any;
    clients: Client[];
    onSaveInvoice: (invoiceData: any) => void;
}

const toLocalDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice, isManual, prefillData, clients, onSaveInvoice }) => {
    
    const [editableInvoice, setEditableInvoice] = useState<Invoice | null>(null);
    const { companyInfo, documentSettings } = useAppStore();

    useEffect(() => {
        if (invoice) {
            setEditableInvoice(JSON.parse(JSON.stringify(invoice)));
        } else if (isManual) {
             const today = new Date();
             const dueDate = new Date();
             dueDate.setDate(today.getDate() + 30);

            setEditableInvoice({
                id: `manual-${Date.now()}`,
                invoiceNumber: '',
                clientId: prefillData?.fromTicket?.clientId || prefillData?.clientId || clients[0]?.id || '',
                status: 'draft',
                issueDate: today.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                lineItems: prefillData?.fromTicket ? [{
                    id: `li-from-${prefillData.fromTicket.id}`,
                    description: `Trabajo Extra Ticket #${prefillData.fromTicket.ticketNumber}: ${prefillData.fromTicket.description}`,
                    quantity: 1,
                    unitPrice: prefillData.fromTicket.costImpact,
                    amount: prefillData.fromTicket.costImpact,
                }] : [],
                subtotal: 0,
                taxRate: 0,
                taxAmount: 0,
                total: 0,
                notes: '',
                createdAt: new Date().toISOString()
            })
        }
        else {
            setEditableInvoice(null);
        }
    }, [invoice, isOpen, isManual, clients, prefillData]);

    const recalculateTotals = (items: InvoiceLineItem[], taxRate: number) => {
        const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    };

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
        setEditableInvoice(prev => {
            if (!prev) return null;
            const newItems = prev.lineItems.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === 'quantity' || field === 'unitPrice') {
                        const quantity = field === 'quantity' ? Number(value) : updatedItem.quantity;
                        const unitPrice = field === 'unitPrice' ? Number(value) : updatedItem.unitPrice;
                        updatedItem.amount = (quantity || 0) * (unitPrice || 0);
                    }
                    return updatedItem;
                }
                return item;
            });

            const { subtotal, taxAmount, total } = recalculateTotals(newItems, prev.taxRate);
            return { ...prev, lineItems: newItems, subtotal, taxAmount, total };
        });
    };
    
    const handleTaxRateChange = (newRate: number) => {
        setEditableInvoice(prev => {
            if (!prev) return null;
            const { subtotal, taxAmount, total } = recalculateTotals(prev.lineItems, newRate / 100);
            return { ...prev, taxRate: newRate / 100, subtotal, taxAmount, total };
        });
    };

    const addLineItem = () => setEditableInvoice(prev => prev ? { ...prev, lineItems: [...prev.lineItems, { id: `new-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, amount: 0 }] } : null);
    const removeLineItem = (idToRemove: string) => setEditableInvoice(prev => {
        if (!prev) return null;
        const newItems = prev.lineItems.filter(item => item.id !== idToRemove);
        const { subtotal, taxAmount, total } = recalculateTotals(newItems, prev.taxRate);
        return { ...prev, lineItems: newItems, subtotal, taxAmount, total };
    });
    
    const handleShare = async () => {
        if (!editableInvoice) return;
        const printableElement = document.querySelector('.printable-area') as HTMLElement;
        if (!printableElement) {
            alert('No se pudo encontrar el contenido para compartir.');
            return;
        }

        const pdfFile = await generatePdfFileFromElement(printableElement, `Invoice-${editableInvoice.invoiceNumber}.pdf`);
        if (!pdfFile) {
            alert('No se pudo generar el PDF para compartir.');
            return;
        }

        const clientName = client?.name || 'N/A';
        const shareData = {
            title: `Factura #${editableInvoice.invoiceNumber}`,
            text: `Aquí está la factura #${editableInvoice.invoiceNumber} para ${clientName}.`,
            files: [pdfFile],
        };

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error al compartir la factura:', error);
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

    if (!isOpen || !editableInvoice) return null;
    const isCreateMode = editableInvoice.id.startsWith('manual-');
    const isEditable = editableInvoice.status === 'draft';
    const client = clients.find(c => c.id === editableInvoice.clientId);

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4 printable-modal-container" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[95vh] max-h-[900px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 no-print">
                    <div className="flex items-center gap-3">
                        <InvoiceIcon className="w-6 h-6 text-emerald-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                           {isCreateMode ? 'Crear Factura' : `Factura #${editableInvoice.invoiceNumber}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50 p-6 sm:p-8 printable-area doc-container">
                    <header className={`doc-header doc-header-logo-${documentSettings.logoPosition}`}>
                         {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Company Logo" className="doc-logo" />}
                        {documentSettings.showCompanyInfo && (
                            <div className="doc-company-info">
                                <p className="font-bold">{companyInfo.name}</p>
                                <p>{companyInfo.address}</p>
                                <p>{companyInfo.phone}</p>
                            </div>
                        )}
                    </header>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="doc-title">FACTURA</h1>
                            <p className="text-gray-500">No. {editableInvoice.invoiceNumber || '(Borrador)'}</p>
                        </div>
                        <div className="text-right">
                             <p><span className="font-semibold">Fecha de Emisión:</span> {toLocalDate(editableInvoice.issueDate)}</p>
                             <p><span className="font-semibold">Fecha de Vencimiento:</span> {toLocalDate(editableInvoice.dueDate)}</p>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <p className="font-semibold">Facturar A:</p>
                        <p>{client?.name}</p>
                        <p>{client?.address}</p>
                    </div>

                    <table className="w-full mt-8 doc-table">
                        <thead>
                            <tr>
                                <th className="text-left">Descripción</th>
                                <th className="text-right">Cantidad</th>
                                <th className="text-right">Precio Unitario</th>
                                <th className="text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                             {editableInvoice.lineItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>
                                        {isEditable ? <input type="text" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="w-full"/> : item.description}
                                    </td>
                                    <td className="text-right">
                                         {isEditable ? <input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="w-20 text-right"/> : item.quantity.toFixed(2)}
                                    </td>
                                    <td className="text-right">
                                         {isEditable ? <input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="w-24 text-right"/> : formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="text-right font-semibold">{formatCurrency(item.amount)}</td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                     {isEditable && <button onClick={addLineItem} className="mt-2 text-sm font-semibold text-blue-600 no-print">+ Añadir Artículo</button>}
                    
                    <div className="mt-8 flex justify-end">
                        <div className="w-full max-w-xs space-y-2 doc-totals">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">{formatCurrency(editableInvoice.subtotal)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600">Impuestos (%):</span>
                                {isEditable ? <input type="number" value={editableInvoice.taxRate * 100} onChange={e => handleTaxRateChange(parseFloat(e.target.value))} className="w-20 text-right"/> : (editableInvoice.taxRate * 100).toFixed(2)}
                            </div>
                            <div className="flex justify-between border-t pt-2"><span className="font-bold text-lg">Total:</span><span className="font-bold text-lg doc-accent-text">{formatCurrency(editableInvoice.total)}</span></div>
                        </div>
                    </div>

                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4 no-print">
                     <button
                        type="button"
                        onClick={handleShare}
                        disabled={isCreateMode}
                        className="flex items-center gap-2 px-4 py-2 font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-sky-300"
                    >
                        <ShareIcon className="w-5 h-5" />
                        Compartir
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        Imprimir
                    </button>
                    {isEditable && (
                         <button
                            type="button"
                            onClick={() => onSaveInvoice(editableInvoice)}
                            className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg"
                        >
                            {isCreateMode ? 'Guardar Factura' : 'Guardar Cambios'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};
