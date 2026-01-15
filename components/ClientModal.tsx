import React from 'react';
import type { Client } from '../types';
import ClientForm from './ClientForm';
import { XCircleIcon } from './icons/XCircleIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useAppStore } from '../hooks/stores/useAppStore';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingClient: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, editingClient }) => {
    const { saveClient, deleteClient } = usePeopleStore();
    const { confirm } = useAppStore();

    if (!isOpen) return null;

    const handleSave = (clientData: any, id?: string) => {
        saveClient(clientData, id);
        onClose();
    };

    const handleDeleteRequest = (client: Client) => {
        confirm({
            title: `Confirmar Eliminación de Cliente`,
            message: `¿Está seguro de que desea mover a ${client.name} a la papelera?`,
            onConfirm: () => {
                deleteClient([client.id]);
                onClose();
            },
        });
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
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <BuildingIcon className="w-6 h-6 text-sky-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <ClientForm 
                            onSave={handleSave}
                            editingClient={editingClient} 
                            onCancel={onClose}
                            onDeleteRequest={handleDeleteRequest}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};