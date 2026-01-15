import React from 'react';
import type { Vehicle } from '../../types';
import VehicleForm from './VehicleForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { TruckIcon } from '../icons/new/TruckIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Vehicle, 'id' | 'deletedAt'> | Vehicle) => void;
    editingVehicle: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, onSave, editingVehicle }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const handleSave = (data: Omit<Vehicle, 'id' | 'deletedAt'> | Vehicle) => {
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
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] max-h-[800px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <TruckIcon className="w-6 h-6 text-gray-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingVehicle ? 'Editar Vehículo' : t('addVehicle')}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <VehicleForm
                            onSave={handleSave}
                            onCancel={onClose}
                            editingVehicle={editingVehicle}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};
