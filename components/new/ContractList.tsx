import React from 'react';
import type { Contract, Client, Jobsite } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { FileSignatureIcon } from '../icons/new/FileSignatureIcon';
import { formatCurrency } from '../../utils/formatters';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ContractCardProps {
    contract: Contract;
    client?: Client;
    jobsite?: Jobsite;
    onEdit: (contract: Contract) => void;
    onDelete: (contract: Contract) => void;
}

const StatusBadge: React.FC<{ status: Contract['status'] }> = ({ status }) => {
    const statusInfo = {
        draft: { text: 'Borrador', className: 'bg-gray-100 text-gray-800' },
        sent: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
        signed: { text: 'Firmado', className: 'bg-yellow-100 text-yellow-800' },
        in_progress: { text: 'En Progreso', className: 'bg-indigo-100 text-indigo-800' },
        completed: { text: 'Completado', className: 'bg-emerald-100 text-emerald-800' },
        cancelled: { text: 'Cancelado', className: 'bg-rose-100 text-rose-800' },
    };
    const { text, className } = statusInfo[status] || statusInfo.draft;
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
};

const ContractCard: React.FC<ContractCardProps> = ({ contract, client, jobsite, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{contract.title}</h3>
                    <p className="text-sm text-gray-500">Cliente: {client?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Sitio: {jobsite?.address || 'N/A'}</p>
                </div>
                <StatusBadge status={contract.status} />
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-600">Monto Total</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(contract.totalAmount)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(contract)} title="Editar Contrato" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(contract)} title="Eliminar Contrato" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ContractListProps {
    contracts: Contract[];
    clients: Client[];
    jobsites: Jobsite[];
    onAdd: () => void;
    onEdit: (contract: Contract) => void;
    onDelete: (contract: Contract) => void;
}

const ContractList: React.FC<ContractListProps> = ({ contracts, clients, jobsites, onAdd, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const jobsiteMap = new Map(jobsites.map(j => [j.id, j]));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Contratos</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <FileSignatureIcon className="w-5 h-5" />
                    <span>Añadir Contrato</span>
                </button>
            </div>

            {contracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contracts.map(contract => (
                        <ContractCard
                            key={contract.id}
                            contract={contract}
                            client={clientMap.get(contract.clientId)}
                            jobsite={jobsiteMap.get(contract.jobsiteId)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white border border-dashed border-gray-300 rounded-lg">
                    <FileSignatureIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No hay Contratos</h3>
                    <p className="mt-2 text-gray-500">Cree un nuevo contrato para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default ContractList;