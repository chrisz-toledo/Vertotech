import React, { useState, useEffect } from 'react';
import type { PriceItem } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface PriceItemFormProps {
    onSave: (data: Omit<PriceItem, 'id' | 'createdAt' | 'deletedAt'> | PriceItem, id?: string) => void;
    onCancel: () => void;
    editingItem: PriceItem | null;
}

const initialFormState: Omit<PriceItem, 'id' | 'createdAt' | 'deletedAt'> = {
    category: '',
    description: '',
    rate: 0,
    unit: '',
};

const PriceItemForm: React.FC<PriceItemFormProps> = ({ onSave, onCancel, editingItem }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(initialFormState);
    
    useEffect(() => {
        if (editingItem) {
            setFormData(editingItem);
        } else {
            setFormData(initialFormState);
        }
    }, [editingItem]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'rate' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, editingItem?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Category</label>
                <input name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" placeholder="e.g., Labor, Finishes" required />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
                <input name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" placeholder="e.g., Helper Rental" required />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Rate ($)</label>
                <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required min="0" step="0.01" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Unit</label>
                <input name="unit" value={formData.unit} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" placeholder="e.g., hour, sq ft" required />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded">{t('cancel')}</button>
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-primary rounded">{editingItem ? t('saveChanges') : t('addRate')}</button>
            </div>
        </form>
    );
};

export default PriceItemForm;