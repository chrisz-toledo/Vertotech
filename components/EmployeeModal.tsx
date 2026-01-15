import React from 'react';
import type { Employee } from '../types';
import EmployeeForm from './EmployeeForm';
import { XCircleIcon } from './icons/XCircleIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useAppStore } from '../hooks/stores/useAppStore';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEmployee: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, editingEmployee }) => {
    const { saveEmployee } = usePeopleStore();
    const { jobRoles, addJobRole } = useAppStore();

    if (!isOpen) return null;
    
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
                        <UserPlusIcon className="w-6 h-6 text-blue-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingEmployee ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <EmployeeForm 
                            onSave={(data, id) => {
                                saveEmployee(data, id);
                                onClose();
                            }} 
                            editingEmployee={editingEmployee} 
                            onCancel={onClose}
                            jobRoles={jobRoles}
                            onAddJobRole={addJobRole}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};