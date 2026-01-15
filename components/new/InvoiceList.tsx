import React, { useMemo } from 'react';
import type { Invoice, Client } from '../../types';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { InvoiceIcon } from '../icons/new/InvoiceIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface InvoiceRowProps {
    invoice: Invoice;
    client?: Client;
    onOpenDetails: (invoice: Invoice) => void;
    onDeleteRequest: (invoice: Invoice) => void;
}

const StatusBadge: React.FC<{ status: 'draft' | 'sent' | 'paid' | 'overdue' }> = ({ status }) => {
    const statusStyles = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
        overdue: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
    };
    const statusText = {
        draft: 'Borrador',
        sent: 'Enviada',
        paid: 'Pagada',
        overdue: 'Vencida',
    };
    const effectiveStatus = status;
    
    return (
        <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${statusStyles[effectiveStatus]}`}>
            {statusText[effectiveStatus]}
        </span>
    );
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice, client, onOpenDetails, onDeleteRequest }) => {
    const isOverdue = invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
    const statusToRender = isOverdue ? 'overdue' : invoice.status;
    
    return (
        <tr className="bg-white dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">{client?.name || 'N/A'}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(invoice.issueDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
            <td className="p-4 font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.total)}</td>
            <td className="p-4"><StatusBadge status={statusToRender} /></td>
            <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onOpenDetails(invoice)} title="Ver Detalles" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        <SearchIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onDeleteRequest(invoice)} title="Eliminar Factura" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </td>
        </tr>
    );
};


const InvoiceList: React.FC = () => {
    const financeStore = useFinanceStore();
    const peopleStore = usePeopleStore();
    const appStore = useAppStore();
    const { open: openModal } = useModalManager();
    const { invoices } = financeStore;
    const { clients } = peopleStore;

    const clientMap = useMemo(() => new Map<string, Client>(clients.map(c => [c.id, c])), [clients]);

    const onOpenDetails = (invoice: Invoice) => openModal('invoiceDetails', { invoice });
    const onDeleteRequest = (invoice: Invoice) => appStore.confirm({ title: 'Eliminar Factura', message: `¿Mover factura #${invoice.invoiceNumber} a la papelera?`, onConfirm: () => financeStore.deleteInvoice([invoice.id])});
    const onAddManual = () => openModal('invoiceDetails', { isManual: true });
    const onAddGenerated = () => openModal('invoiceGenerator');
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Facturas</h2>
                <div className="flex items-center gap-2">
                     <button onClick={onAddGenerated} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700">
                        <SparklesIcon className="w-5 h-5" />
                        <span>Generar con IA</span>
                    </button>
                    <button onClick={onAddManual} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <InvoiceIcon className="w-5 h-5" />
                        <span>Factura Manual</span>
                    </button>
                </div>
            </div>
            {invoices.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Factura #</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Emisión</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Vencimiento</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {invoices.map(invoice => (
                                <InvoiceRow
                                    key={invoice.id}
                                    invoice={invoice}
                                    client={clientMap.get(invoice.clientId)}
                                    onOpenDetails={onOpenDetails}
                                    onDeleteRequest={onDeleteRequest}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <InvoiceIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Facturas</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Genere una nueva factura para comenzar.</p>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;