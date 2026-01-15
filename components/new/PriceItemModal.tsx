import React from 'react';
import type { PriceItem } from '../../types';
import PriceItemForm from './PriceItemForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PriceTagIcon } from '../icons/new/PriceTagIcon';

interface PriceItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<PriceItem, 'id' | 'createdAt' | 'deletedAt'> | PriceItem, id?: string) => void;
    editingItem: PriceItem | null;
}

export const PriceItemModal: React.FC<PriceItemModalProps> = ({ isOpen, onClose, onSave, editingItem }) => {
    if (!isOpen) return null;

    const handleSave = (data: Omit<PriceItem, 'id' | 'createdAt' | 'deletedAt'> | PriceItem, id?: string) => {
        onSave(data, id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <PriceTagIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingItem ? 'Edit Rate' : 'Add New Rate'}</h2>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <main className="p-6">
                    <PriceItemForm 
                        onSave={handleSave}
                        onCancel={onClose}
                        editingItem={editingItem}
                    />
                </main>
            </div>
        </div>
    );
};