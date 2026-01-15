import React from 'react';
import type { LegalDocument } from '../../types';
import LegalDocumentForm from './LegalDocumentForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ScaleIcon } from '../icons/new/ScaleIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<LegalDocument, 'id' | 'createdAt' | 'deletedAt'> | LegalDocument, id?: string) => void;
    editingDocument: LegalDocument | null;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, onSave, editingDocument }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const handleSave = (data: Omit<LegalDocument, 'id' | 'createdAt' | 'deletedAt'> | LegalDocument) => {
        onSave(data, editingDocument?.id);
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
                        <ScaleIcon className="w-6 h-6 text-gray-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingDocument ? 'Edit Legal Document' : t('addLegalDocument')}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Close form">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <LegalDocumentForm
                            onSave={handleSave}
                            onCancel={onClose}
                            editingDocument={editingDocument}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};