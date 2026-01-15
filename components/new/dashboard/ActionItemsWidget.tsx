import React, { useMemo } from 'react';
import type { ExtraWorkTicket, Invoice, Payable, Supplier } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { useModalManager } from '../../../hooks/useModalManager';
import { AlertTriangleIcon } from '../../icons/AlertTriangleIcon';
import { TicketIcon } from '../../icons/new/TicketIcon';
import { InvoiceIcon } from '../../icons/new/InvoiceIcon';
import { ReceiptIcon } from '../../icons/new/ReceiptIcon';

interface ActionItemsWidgetProps {
    extraWorkTickets: ExtraWorkTicket[];
    invoices: Invoice[];
    payables: Payable[];
}

const ActionItemsWidget: React.FC<ActionItemsWidgetProps> = ({ extraWorkTickets, invoices, payables }) => {
    const { t } = useTranslation();
    const { suppliers } = usePeopleStore();
    const { open: openModal } = useModalManager();
    const supplierMap = useMemo(() => new Map<string, string>(suppliers.map(s => [s.id, s.name])), [suppliers]);

    const actionItems = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);

        const pendingTickets = extraWorkTickets.filter(t => t.status === 'pending');
        const overdueInvoices = invoices.filter(i => i.status !== 'paid' && new Date(i.dueDate + 'T00:00:00Z') < today);
        const overduePayables = payables.filter(p => p.status !== 'paid' && new Date(p.dueDate + 'T00:00:00Z') < today);
        
        return { pendingTickets, overdueInvoices, overduePayables };
    }, [extraWorkTickets, invoices, payables]);

    const totalItems = actionItems.pendingTickets.length + actionItems.overdueInvoices.length + actionItems.overduePayables.length;

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg flex flex-col h-full">
            <div className="p-4 flex items-center gap-3 border-b border-slate-300/30 dark:border-slate-700/30">
                <AlertTriangleIcon className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('actionItems')}</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {totalItems > 0 ? (
                    <ul className="space-y-2">
                        {actionItems.pendingTickets.map(ticket => (
                            <li key={ticket.id}>
                                <button onClick={() => openModal('extraWorkTicket', { ticket })} className="w-full flex items-center gap-3 text-sm p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                                    <TicketIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <div><span className="font-semibold text-gray-700 dark:text-gray-200">{t('pendingTickets')}:</span> #{ticket.ticketNumber}</div>
                                </button>
                            </li>
                        ))}
                        {actionItems.overdueInvoices.map(invoice => (
                            <li key={invoice.id}>
                                <button onClick={() => openModal('invoiceDetails', { invoice })} className="w-full flex items-center gap-3 text-sm p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                                    <InvoiceIcon className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                    <div><span className="font-semibold text-gray-700 dark:text-gray-200">{t('overdueInvoices')}:</span> #{invoice.invoiceNumber}</div>
                                </button>
                            </li>
                        ))}
                         {actionItems.overduePayables.map(payable => (
                            <li key={payable.id}>
                                 <button onClick={() => openModal('payable', { payable })} className="w-full flex items-center gap-3 text-sm p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                                    <ReceiptIcon className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                    <div><span className="font-semibold text-gray-700 dark:text-gray-200">{t('overduePayables')}:</span> {supplierMap.get(payable.supplierId) || 'N/A'}</div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('noActionItems')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionItemsWidget;