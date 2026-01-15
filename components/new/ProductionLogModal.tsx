import React from 'react';
import type { ProductionLog, Jobsite, Employee, Subcontractor } from '../../types';
import ProductionLogForm from './ProductionLogForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ChartBarIcon } from '../icons/new/ChartBarIcon';

interface ProductionLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (logData: Omit<ProductionLog, 'id' | 'createdAt' | 'deletedAt'> | ProductionLog) => void;
    editingLog: ProductionLog | null;
    jobsites: Jobsite[];
    employees: Employee[];
    subcontractors: Subcontractor[];
    units: string[];
    prefillData?: { date?: string; jobsiteId?: string };
}

export const ProductionLogModal: React.FC<ProductionLogModalProps> = (props) => {
    const { isOpen, onClose, onSave, editingLog, jobsites, employees, subcontractors, units, prefillData } = props;

    if (!isOpen) return null;

    const handleSave = (data: Omit<ProductionLog, 'id' | 'createdAt' | 'deletedAt'> | ProductionLog) => {
        onSave(data);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] max-h-[800px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="w-6 h-6 text-teal-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingLog ? 'Editar Registro de Producción' : 'Añadir Registro de Producción'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <ProductionLogForm
                            onSave={handleSave}
                            onCancel={onClose}
                            editingLog={editingLog}
                            jobsites={jobsites}
                            employees={employees}
                            subcontractors={subcontractors}
                            units={units}
                            prefillData={prefillData}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};