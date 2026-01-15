import React, { useState, useEffect } from 'react';
import type { QuoteRequest, Supplier } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface QuoteRequestFormProps {
    onSave: (data: Omit<QuoteRequest, 'id' | 'requestNumber' | 'createdAt' | 'deletedAt'> | QuoteRequest, id?: string) => void;
    onCancel: () => void;
    editingRequest: QuoteRequest | null;
    suppliers: Supplier[];
}

const initialFormState: Omit<QuoteRequest, 'id' | 'requestNumber' | 'createdAt' | 'deletedAt'> = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    supplierIds: [],
    lineItems: [],
    status: 'draft',
};

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({ onSave, onCancel, editingRequest, suppliers }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<QuoteRequest, 'id' | 'requestNumber' | 'createdAt' | 'deletedAt'> | QuoteRequest>(initialFormState);

    useEffect(() => {
        setFormData(editingRequest || initialFormState);
    }, [editingRequest]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSupplierToggle = (id: string) => {
        setFormData(prev => {
            const newIds = prev.supplierIds.includes(id) ? prev.supplierIds.filter(sId => sId !== id) : [...prev.supplierIds, id];
            return { ...prev, supplierIds: newIds };
        });
    };

    const handleLineItemChange = (index: number, field: 'description' | 'quantity' | 'unit', value: string | number) => {
        setFormData(prev => {
            const newItems = [...prev.lineItems];
            (newItems[index] as any)[field] = value;
            return { ...prev, lineItems: newItems };
        });
    };
    
    const addLineItem = () => {
        setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, { id: `li-${Date.now()}`, description: '', quantity: 1, unit: '' }] }));
    };
    
    const removeLineItem = (index: number) => {
        setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, (editingRequest as QuoteRequest)?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-200">Request Title</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-200">Issue Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-200">Response Deadline</label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-200">Suppliers to Notify</label>
                <div className="p-3 border dark:border-gray-600 rounded-md max-h-40 overflow-y-auto grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/50">
                    {suppliers.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                            <input type="checkbox" id={`sup-${s.id}`} checked={formData.supplierIds.includes(s.id)} onChange={() => handleSupplierToggle(s.id)} />
                            <label htmlFor={`sup-${s.id}`} className="dark:text-gray-200">{s.name}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-200">Items to Quote</label>
                {formData.lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-[1fr,100px,120px,auto] gap-2 items-center">
                        <input type="text" placeholder="Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                        <input type="number" placeholder="Quantity" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" min="1" required />
                        <input type="text" placeholder="Unit" value={item.unit} onChange={e => handleLineItemChange(index, 'unit', e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                        <button type="button" onClick={() => removeLineItem(index)} className="p-2 text-rose-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
                <button type="button" onClick={addLineItem} className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900">+ Add Item</button>
            </div>
            
             <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded">{t('cancel')}</button>
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-primary rounded">
                    {editingRequest ? t('saveChanges') : 'Save & Send Request'}
                </button>
            </div>
        </form>
    );
};

export default QuoteRequestForm;