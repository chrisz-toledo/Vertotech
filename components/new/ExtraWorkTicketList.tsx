import React, { useMemo } from 'react';
import type { ExtraWorkTicket, Client, Jobsite } from '../../types';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { TicketIcon } from '../icons/new/TicketIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { InvoiceIcon } from '../icons/new/InvoiceIcon';

interface ExtraWorkTicketCardProps {
    ticket: ExtraWorkTicket;
    client?: Client;
    jobsite?: Jobsite;
    onEdit: (ticket: ExtraWorkTicket) => void;
    onDeleteRequest: (ticket: ExtraWorkTicket) => void;
    onCreateInvoice: (ticket: ExtraWorkTicket) => void;
}

const StatusBadge: React.FC<{ status: 'pending' | 'approved' | 'rejected' }> = ({ status }) => {
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    };
    const statusText = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
    };
    return (
        <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${statusStyles[status]}`}>
            {statusText[status]}
        </span>
    );
};

const ExtraWorkTicketCard: React.FC<ExtraWorkTicketCardProps> = ({ ticket, client, jobsite, onEdit, onDeleteRequest, onCreateInvoice }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700">
                <TicketIcon className="w-8 h-8 text-amber-600 dark:text-amber-400"/>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ticket #{ticket.ticketNumber}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha: {new Date(ticket.date).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{client?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{jobsite?.address}</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{ticket.description}</p>
                    {ticket.requestedBy && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Solicitado por: <span className="font-medium text-gray-700 dark:text-gray-200">{ticket.requestedBy}</span></p>
                    )}
                </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => onEdit(ticket)} title="Editar Ticket" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                 {ticket.status === 'approved' && (
                    <button onClick={() => onCreateInvoice(ticket)} title="Crear Factura desde Ticket" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                        <InvoiceIcon className="w-5 h-5"/>
                    </button>
                )}
                <button onClick={() => onDeleteRequest(ticket)} title="Eliminar Ticket" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const ExtraWorkTicketList: React.FC = () => {
    const { extraWorkTickets, jobsites, deleteExtraWorkTicket } = useOperationsStore();
    const { clients } = usePeopleStore();
    const { confirm } = useAppStore();
    const { open: openModal } = useModalManager();

    const clientMap = useMemo(() => new Map<string, Client>(clients.map(c => [c.id, c])), [clients]);
    const jobsiteMap = useMemo(() => new Map<string, Jobsite>(jobsites.map(j => [j.id, j])), [jobsites]);

    const onEdit = (ticket: ExtraWorkTicket) => openModal('extraWorkTicket', { ticket });
    const onDeleteRequest = (ticket: ExtraWorkTicket) => confirm({ title: 'Eliminar Ticket', message: `¿Mover ticket #${ticket.ticketNumber} a la papelera?`, onConfirm: () => deleteExtraWorkTicket([ticket.id])});
    const onCreateInvoice = (ticket: ExtraWorkTicket) => openModal('invoiceDetails', { isManual: true, prefillData: { fromTicket: ticket }});
    
    return (
        <div>
            {extraWorkTickets.length > 0 ? (
                <div className="space-y-6">
                    {extraWorkTickets.map(ticket => (
                        <ExtraWorkTicketCard 
                            key={ticket.id}
                            ticket={ticket}
                            client={clientMap.get(ticket.clientId)}
                            jobsite={jobsiteMap.get(ticket.jobsiteId)}
                            onEdit={onEdit}
                            onDeleteRequest={onDeleteRequest}
                            onCreateInvoice={onCreateInvoice}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <TicketIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Tickets de Trabajo Extra</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Cree un nuevo ticket para comenzar a registrar el trabajo extra.</p>
                </div>
            )}
        </div>
    );
};

export default ExtraWorkTicketList;