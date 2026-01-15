import React from 'react';
import type { Client } from '../../types';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ClientRowProps {
    client: Client;
    jobsiteCount: number;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onDeleteRequest: (client: Client) => void;
    onNavigate: (client: Client) => void;
}

export const ClientRow: React.FC<ClientRowProps> = ({ client, jobsiteCount, isSelected, onToggleSelection, onDeleteRequest, onNavigate }) => {
    return (
        <tr 
            onClick={() => onNavigate(client)}
            className={`border-b dark:border-gray-700 cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
        >
            <td className="p-4" onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={isSelected} onChange={() => onToggleSelection(client.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
            </td>
            <td className="px-4 py-2 font-medium">{client.name}</td>
            <td className="px-4 py-2">{client.contactPerson || 'N/A'}</td>
            <td className="px-4 py-2">{client.phone1 || 'N/A'}</td>
            <td className="px-4 py-2">{jobsiteCount}</td>
            <td className="px-4 py-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${client.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {client.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td className="px-4 py-2 text-right" onClick={e => e.stopPropagation()}>
                <button onClick={() => onNavigate(client)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Editar">
                    <PencilIcon className="w-4 h-4"/>
                </button>
                <button onClick={() => onDeleteRequest(client)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Eliminar">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </td>
        </tr>
    );
};