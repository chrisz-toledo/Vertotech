
import React, { useRef } from 'react';
import type { Contract, Client, Jobsite } from '../../types';
import ContractForm from './ContractForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { FileSignatureIcon } from '../icons/new/FileSignatureIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { formatCurrency } from '../../utils/formatters';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contractData: Omit<Contract, 'id' | 'createdAt' | 'deletedAt'> | Contract) => void;
    editingContract: Contract | null;
    clients: Client[];
    jobsites: Jobsite[];
}

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSave, editingContract, clients, jobsites }) => {
    const formRef = useRef<{ getFormData: () => Omit<Contract, 'id' | 'createdAt' | 'deletedAt'> | Contract, getFormElement: () => HTMLFormElement | null }>(null);
    if (!isOpen) return null;

    const handleSave = (data: Omit<Contract, 'id' | 'createdAt' | 'deletedAt'> | Contract) => {
        onSave(data);
        onClose();
    };

    const handleShare = async () => {
        const formData = formRef.current?.getFormData();
        const formElement = formRef.current?.getFormElement();
        if (!formData || !formElement) return;

        const pdfFile = await generatePdfFileFromElement(formElement, `Contract-${formData.title.replace(/\s/g, '_')}.pdf`);
        if (!pdfFile) {
            alert('No se pudo generar el PDF para compartir.');
            return;
        }

        const clientName = clients.find(c => c.id === formData.clientId)?.name || 'N/A';
        const shareData = {
            title: `Contrato: ${formData.title}`,
            text: `Aquí está el resumen del contrato para ${clientName}.`,
            files: [pdfFile],
        };
        
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error al compartir el contrato:', error);
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
                id="printable-content"
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[95vh] max-h-[900px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 no-print">
                    <div className="flex items-center gap-3">
                        <FileSignatureIcon className="w-6 h-6 text-pink-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingContract ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <ContractForm
                            ref={formRef}
                            onSave={handleSave}
                            onCancel={onClose}
                            editingContract={editingContract}
                            clients={clients}
                            jobsites={jobsites}
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