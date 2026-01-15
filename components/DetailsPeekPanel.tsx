import React, { useState, useEffect } from 'react';
import { usePeekPanel } from '../hooks/usePeekPanel';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useAppStore } from '../hooks/stores/useAppStore';

import EmployeeForm from './EmployeeForm';
import ClientForm from './ClientForm';
import { XCircleIcon } from './icons/XCircleIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { BuildingIcon } from './icons/BuildingIcon';

const DetailsPeekPanel: React.FC = () => {
    const { isOpen, type, props, close } = usePeekPanel();
    const { saveEmployee, deleteEmployee } = usePeopleStore();
    const { saveClient, deleteClient } = usePeopleStore();
    const { jobRoles, addJobRole, confirm } = useAppStore();

    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);


    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            close();
            setIsClosing(false);
        }, 300); // Animation duration
    };
    
    if (!isOpen && !isClosing) return null;

    const isEmployee = type === 'employee';
    const editingData = isEmployee ? props.employee : props.client;
    const title = isEmployee 
        ? (editingData ? 'Editar Empleado' : 'Añadir Nuevo Empleado')
        : (editingData ? 'Editar Cliente' : 'Añadir Nuevo Cliente');
    
    const icon = isEmployee ? <UserPlusIcon className="w-6 h-6 text-blue-600"/> : <BuildingIcon className="w-6 h-6 text-sky-600"/>;
    
    return (
        <div 
            className="fixed inset-0 z-40"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm peek-panel-backdrop" 
                onClick={handleClose} 
            />
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-slate-300/30 dark:border-slate-700/30 shadow-2xl flex flex-col peek-panel-content ${isOpen && !isClosing ? 'open' : 'closed'}`}
            >
                 <header className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-300/30 dark:border-slate-700/30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                    </div>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                 <main className="overflow-y-auto flex-grow">
                    <div className="p-6 sm:p-8">
                        {isEmployee && (
                             <EmployeeForm 
                                onSave={(data, id) => {
                                    saveEmployee(data, id);
                                    handleClose();
                                }} 
                                editingEmployee={props.employee || null} 
                                onCancel={handleClose}
                                jobRoles={jobRoles}
                                onAddJobRole={addJobRole}
                            />
                        )}
                        {!isEmployee && (
                            <ClientForm
                                onSave={(data, id) => {
                                    saveClient(data, id);
                                    handleClose();
                                }}
                                editingClient={props.client || null}
                                onCancel={handleClose}
                                onDeleteRequest={(client) => {
                                    confirm({
                                        title: `Confirmar Eliminación de Cliente`,
                                        message: `¿Está seguro de que desea mover a ${client.name} a la papelera?`,
                                        onConfirm: () => {
                                            deleteClient([client.id]);
                                            handleClose();
                                        },
                                    });
                                }}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DetailsPeekPanel;