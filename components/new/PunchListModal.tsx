import React from 'react';
import type { PunchList, Employee } from '../../types';
import PunchListForm from './PunchListForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ChecklistIcon } from '../icons/new/ChecklistIcon';

interface PunchListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (punchList: PunchList) => void;
    editingPunchList: PunchList | null;
    employees: Employee[];
}

export const PunchListModal: React.FC<PunchListModalProps> = ({ isOpen, onClose, onSave, editingPunchList, employees }) => {
    if (!isOpen) return null;

    const handleSave = (data: PunchList) => {
        onSave(data);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] max-h-[800px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <ChecklistIcon className="w-6 h-6 text-gray-600"/>
                        <h2 className="text-2xl font-bold text-gray-900">
                           Editar Lista de Tareas
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white">
                    <div className="p-6 sm:p-8">
                       {editingPunchList && <PunchListForm onSave={handleSave} onCancel={onClose} editingPunchList={editingPunchList} employees={employees} />}
                    </div>
                </main>
            </div>
        </div>
    );
};