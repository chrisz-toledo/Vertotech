import React, { useMemo } from 'react';
import type { Estimate, Client } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { CalculatorIcon } from '../icons/new/CalculatorIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';

interface EstimateCardProps {
    estimate: Estimate;
    client?: Client;
    onEdit: (estimate: Estimate) => void;
    onDelete: (estimate: Estimate) => void;
}

const StatusBadge: React.FC<{ status: Estimate['status'] }> = ({ status }) => {
    const statusInfo = {
        draft: { text: 'Draft', className: 'bg-gray-100 text-gray-800' },
        sent: { text: 'Sent', className: 'bg-blue-100 text-blue-800' },
        approved: { text: 'Approved', className: 'bg-emerald-100 text-emerald-800' },
        rejected: { text: 'Rejected', className: 'bg-rose-100 text-rose-800' },
    };
    const { text, className } = statusInfo[status] || statusInfo.draft;
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
};

const EstimateCard: React.FC<EstimateCardProps> = ({ estimate, client, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Estimate #{estimate.estimateNumber}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Client: {client?.name || 'N/A'}</p>
            </div>
            <StatusBadge status={estimate.status} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(estimate.total)}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(estimate)} title="Edit Estimate" className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(estimate)} title="Delete Estimate" className="p-2 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
);

interface EstimatesViewProps {
    estimates: Estimate[];
    clients: Client[];
    onAdd: () => void;
    onEdit: (estimate: Estimate) => void;
    onDelete: (estimate: Estimate) => void;
}

const EstimatesView: React.FC<EstimatesViewProps> = ({ estimates, clients, onAdd, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const sortedEstimates = useMemo(() => {
        return [...estimates].sort((a, b) => parseInt(b.estimateNumber, 10) - parseInt(a.estimateNumber, 10));
    }, [estimates]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('estimates')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover">
                    <CalculatorIcon className="w-5 h-5" />
                    <span>{t('addEstimate')}</span>
                </button>
            </div>
            {sortedEstimates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedEstimates.map(estimate => (
                        <EstimateCard 
                            key={estimate.id}
                            estimate={estimate}
                            client={clientMap.get(estimate.clientId)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CalculatorIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Estimates Found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Create a new estimate to get started.</p>
                </div>
            )}
        </div>
    );
};

export default EstimatesView;