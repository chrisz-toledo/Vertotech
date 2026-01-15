
import React, { useRef } from 'react';
import type { PurchaseOrder, Jobsite, Payable, Supplier } from '../../types';
import PurchaseOrderForm from './PurchaseOrderForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ShoppingCartIcon } from '../icons/new/ShoppingCartIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { formatCurrency } from '../../utils/formatters';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

interface PurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (poData: Omit<PurchaseOrder, 'id' | 'deletedAt' | 'poNumber'> | PurchaseOrder) => void;
    editingPO: PurchaseOrder | null;
    jobsites: Jobsite[];
    onCreatePayable: (payableData: Omit<Payable, 'id' | 'deletedAt'>) => void;
    suppliers: Supplier[];
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = (props) => {
    const { isOpen, onClose, onSave, editingPO, jobsites, onCreatePayable, suppliers } = props;
    const formRef = useRef<{ getFormData: () => Omit<PurchaseOrder, 'id' | 'deletedAt' | 'poNumber'> | PurchaseOrder, getFormElement: () => HTMLFormElement | null }>(null);

    if (!isOpen) return null;

    const handleSave = (data: Omit<PurchaseOrder, 'id' | 'deletedAt' | 'poNumber'> | PurchaseOrder) => {
        onSave(data);
        onClose();
    };

    const handleShare = async () => {
        const formData = formRef.current?.getFormData();
        const formElement = formRef.current?.getFormElement();
        if (!formData || !formElement) return;

        const pdfFile = await generatePdfFileFromElement(formElement, `PO-${'poNumber' in formData ? formData.poNumber : 'Draft'}.pdf`);
        if (!pdfFile) {
            alert('No se pudo generar el PDF para compartir.');
            return;
        }

        const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || 'N/A';
        const shareData = {
            title: `Orden de Compra #${'poNumber' in formData ? formData.poNumber : 'Borrador'}`,
            text: `Aquí está la orden de compra para ${supplierName}.`,
            files: [pdfFile],
        };
        
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error al compartir:', error);
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
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" 
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
                        <ShoppingCartIcon className="w-6 h-6 text-teal-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingPO ? 'Editar Orden de Compra' : 'Crear Orden de Compra'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main id="printable-content" className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <PurchaseOrderForm
                            ref={formRef}
                            onSave={handleSave}
                            onCancel={onClose}
                            editingPO={editingPO}
                            jobsites={jobsites}
                            onCreatePayable={onCreatePayable}
                            suppliers={suppliers}
                        />
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 border-t flex justify-end items-center gap-4 no-print">
                    <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                        <ShareIcon className="w-5 h-5" />
                        Compartir
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 font-semibold bg-gray-200 rounded-lg"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        Imprimir
                    </button>
                </footer>
            </div>
        </div>
    );
};