import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import BulkEditEmployeeForm from './BulkEditEmployeeForm';

interface BulkEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemType: 'employee' | string;
    ids: string[];
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({ isOpen, onClose, itemType, ids }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const renderForm = () => {
        switch (itemType) {
            case 'employee':
                return <BulkEditEmployeeForm ids={ids} onComplete={onClose} />;
            default:
                return <p>No bulk edit form is available for this item type.</p>;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="w-6 h-6 text-blue-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('bulkEdit')} ({ids.length})</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600">
                        <XCircleIcon className="w-7 h-7"/>
                    </button>
                </header>
                <main className="p-6">
                    {renderForm()}
                </main>
            </div>
        </div>
    );
};