import React from 'react';
import type { QuoteRequest, Supplier } from '../../types';
import QuoteRequestForm from './QuoteRequestForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { MegaphoneIcon } from '../icons/new/MegaphoneIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface QuoteRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<QuoteRequest, 'id' | 'requestNumber' | 'createdAt' | 'deletedAt'> | QuoteRequest, id?: string) => void;
    editingRequest: QuoteRequest | null;
    suppliers: Supplier[];
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = (props) => {
    const { isOpen, onClose, onSave, editingRequest, suppliers } = props;
    const { t } = useTranslation();
    if (!isOpen) return null;

    const handleSave = (data: Omit<QuoteRequest, 'id' | 'requestNumber' | 'createdAt' | 'deletedAt'> | QuoteRequest, id?: string) => {
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
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[95vh] max-h-[850px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <MegaphoneIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingRequest ? 'Edit Request for Quote' : t('addQuoteRequest')}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Close form">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <QuoteRequestForm
                            onSave={handleSave}
                            onCancel={onClose}
                            editingRequest={editingRequest}
                            suppliers={suppliers}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};