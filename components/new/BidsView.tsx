import React from 'react';
import type { Bid, Client } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { GavelIcon } from '../icons/new/GavelIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';

interface BidCardProps {
    bid: Bid;
    client?: Client;
    onEdit: (bid: Bid) => void;
    onDelete: (bid: Bid) => void;
    onUpdateStatus: (id: string, status: Bid['status']) => void;
}

const StatusBadge: React.FC<{ status: Bid['status'] }> = ({ status }) => {
    const statusInfo = {
        borrador: { text: 'Draft', className: 'bg-gray-100 text-gray-800' },
        enviada: { text: 'Sent', className: 'bg-blue-100 text-blue-800' },
        ganada: { text: 'Won', className: 'bg-emerald-100 text-emerald-800' },
        perdida: { text: 'Lost', className: 'bg-rose-100 text-rose-800' },
    };
    const { text, className } = statusInfo[status] || statusInfo.borrador;
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
};


const BidCard: React.FC<BidCardProps> = ({ bid, client, onEdit, onDelete, onUpdateStatus }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{bid.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bid #{bid.bidNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Client: {client?.name || 'N/A'}</p>
                </div>
                 <select 
                    value={bid.status} 
                    onChange={(e) => onUpdateStatus(bid.id, e.target.value as Bid['status'])}
                    className="p-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 dark:text-white"
                >
                    <option value="borrador">Draft</option>
                    <option value="enviada">Sent</option>
                    <option value="ganada">Won</option>
                    <option value="perdida">Lost</option>
                </select>
            </div>
             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(bid.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(bid)} title="Edit Bid" className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(bid)} title="Delete Bid" className="p-2 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface BidsViewProps {
    bids: Bid[];
    clients: Client[];
    onAdd: () => void;
    onEdit: (bid: Bid) => void;
    onDelete: (bid: Bid) => void;
    onUpdateStatus: (id: string, status: Bid['status']) => void;
}

const BidsView: React.FC<BidsViewProps> = ({ bids, clients, onAdd, onEdit, onDelete, onUpdateStatus }) => {
    const { t } = useTranslation();
    const clientMap = new Map(clients.map(c => [c.id, c]));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('bids')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover">
                    <GavelIcon className="w-5 h-5" />
                    <span>{t('addBid')}</span>
                </button>
            </div>
            {bids.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bids.map(bid => (
                        <BidCard 
                            key={bid.id}
                            bid={bid}
                            client={clientMap.get(bid.clientId)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdateStatus={onUpdateStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <GavelIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Bids Found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Create a new bid to get started.</p>
                </div>
            )}
        </div>
    );
};

export default BidsView;