
import React from 'react';
import type { ExtraWorkTicket, Client, Jobsite, Employee } from '../../types';
import ExtraWorkTicketForm from './ExtraWorkTicketForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { TicketIcon } from '../icons/new/TicketIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { formatCurrency } from '../../utils/formatters';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

interface ExtraWorkTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingTicket: ExtraWorkTicket | null;
    prefillData?: { clientId?: string, jobsiteId?: string };
    onSave: (data: any, id?: string) => void;
    onAnalyzeReceipt: (image: { mimeType: string; data: string; }) => Promise<string>;
    clients: Client[];
    jobsites: Jobsite[];
    employees: Employee[];
}

export const ExtraWorkTicketModal: React.FC<ExtraWorkTicketModalProps> = ({ isOpen, onClose, editingTicket, prefillData, onSave, onAnalyzeReceipt, clients, jobsites, employees }) => {
    
    if (!isOpen) return null;

    const handleSaveTicket = (data: any, id?: string) => {
        onSave(data, id);
        onClose();
    };

    const handleShare = async () => {
        if (!editingTicket) return;

        const printableElement = document.getElementById('printable-content')?.querySelector('.doc-container');
        if (!printableElement) {
             alert('No se pudo encontrar el contenido para compartir.');
            return;
        }

        const noPrintElements = printableElement.querySelectorAll('.no-print');
        const printOnlyElements = Array.from(printableElement.querySelectorAll('.print\\:block'));

        // Prepare for capture
        noPrintElements.forEach(el => el.classList.add('hidden'));
        printOnlyElements.forEach(el => el.classList.remove('hidden'));

        await new Promise(r => setTimeout(r, 50)); // Allow styles to apply

        const pdfFile = await generatePdfFileFromElement(printableElement as HTMLElement, `Ticket-${editingTicket.ticketNumber}.pdf`);

        // Cleanup DOM
        noPrintElements.forEach(el => el.classList.remove('hidden'));
        printOnlyElements.forEach(el => el.classList.add('hidden'));

        if (!pdfFile) {
            alert('No se pudo generar el PDF para compartir.');
            return;
        }

        const clientName = clients.find(c => c.id === editingTicket.clientId)?.name || 'N/A';
        const shareData = {
            title: `Ticket de Trabajo Extra #${editingTicket.ticketNumber}`,
            text: `Aquí está el ticket de trabajo extra #${editingTicket.ticketNumber} para ${clientName}.`,
            files: [pdfFile],
        };

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error al compartir el ticket:', error);
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
                        <TicketIcon className="w-6 h-6 text-amber-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingTicket ? 'Editar Ticket de Trabajo Extra' : 'Crear Ticket de Trabajo Extra'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main id="printable-content" className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <ExtraWorkTicketForm
                            onSave={handleSaveTicket}
                            onCancel={onClose}
                            editingTicket={editingTicket}
                            clients={clients}
                            jobsites={jobsites}
                            employees={employees}
                            onAnalyzeReceipt={onAnalyzeReceipt}
                            prefillData={prefillData}
                        />
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4 no-print">
                    <button
                        type="button"
                        onClick={handleShare}
                        disabled={!editingTicket}
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
                </footer>
            </div>
        </div>
    );
};