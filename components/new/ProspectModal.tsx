import React from 'react';
import type { Prospect } from '../../types';
import ProspectForm from './ProspectForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { BullhornIcon } from '../icons/new/BullhornIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface ProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Prospect, 'id' | 'createdAt' | 'deletedAt'> | Prospect, id?: string) => void;
    editingProspect: Prospect | null;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({ isOpen, onClose, onSave, editingProspect }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const handleSave = (data: Omit<Prospect, 'id' | 'createdAt' | 'deletedAt'> | Prospect, id?: string) => {
        onSave(data, id);
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
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <BullhornIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingProspect ? 'Edit Prospect' : t('addProspect')}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="p-6">
                    <ProspectForm 
                        onSave={handleSave}
                        onCancel={onClose}
                        editingProspect={editingProspect}
                    />
                </main>
            </div>
        </div>
    );
};