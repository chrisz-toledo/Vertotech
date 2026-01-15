import React, { useState, useEffect } from 'react';
import type { Estimate, EstimateLineItem, Client } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';

interface EstimateFormProps {
    onSave: (data: Omit<Estimate, 'id' | 'estimateNumber' | 'createdAt' | 'deletedAt'> | Estimate, id?: string) => void;
    onCancel: () => void;
    editingEstimate: Estimate | null;
    clients: Client[];
    defaultTaxRate: number;
}

const initialFormState: Omit<Estimate, 'id' | 'estimateNumber' | 'createdAt' | 'deletedAt'> = {
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    lineItems: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    notes: '',
};

const lineItemCategories = ['Labor', 'Materials', 'Permits', 'Equipment', 'Subcontractors', 'Miscellaneous'];

const EstimateForm: React.FC<EstimateFormProps> = ({ onSave, onCancel, editingEstimate, clients, defaultTaxRate }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<Estimate, 'id' | 'estimateNumber' | 'createdAt' | 'deletedAt'> | Estimate>(initialFormState);

    useEffect(() => {
        if (editingEstimate) {
            setFormData(editingEstimate);
        } else {
            setFormData({ 
                ...initialFormState, 
                clientId: clients[0]?.id || '',
                taxRate: defaultTaxRate / 100,
            });
        }
    }, [editingEstimate, clients, defaultTaxRate]);

    useEffect(() => {
        const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * formData.taxRate;
        const total = subtotal + taxAmount;
        setFormData(prev => ({ ...prev, subtotal, taxAmount, total }));
    }, [formData.lineItems, formData.taxRate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'taxRate' ? parseFloat(value) / 100 || 0 : value }));
    };

    const handleLineItemChange = (index: number, field: keyof EstimateLineItem, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.lineItems];
            const item = { ...newItems[index] };
            (item as any)[field] = value;
            if (field === 'quantity' || field === 'unitCost') {
                item.total = (item.quantity || 0) * (item.unitCost || 0);
            }
            newItems[index] = item;
            return { ...prev, lineItems: newItems };
        });
    };

    const addLineItem = () => {
        setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, { id: `li-${Date.now()}`, category: 'Labor', description: '', quantity: 1, unitCost: 0, total: 0 }]}));
    };

    const removeLineItem = (index: number) => {
        setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isFormValid = formData.clientId && formData.lineItems.length > 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Client</label><select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required><option value="" disabled>Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required /></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"><option value="draft">Draft</option><option value="sent">Sent</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">Line Items</label>
                <div className="overflow-x-auto border dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/50">
                    {formData.lineItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-[150px,1fr,100px,120px,120px,auto] gap-2 items-center mb-2">
                            <select value={item.category} onChange={e => handleLineItemChange(index, 'category', e.target.value)} className="p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"><option disabled>Category</option>{lineItemCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                            <input type="text" placeholder="Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required />
                            <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} className="p-2 border dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 dark:text-white" min="0" />
                            <input type="number" placeholder="Unit Cost" value={item.unitCost || ''} onChange={e => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value))} className="p-2 border dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 dark:text-white" min="0" step="0.01" />
                            <input type="text" value={formatCurrency(item.total)} readOnly className="p-2 border-0 bg-gray-100 dark:bg-gray-800 rounded-md text-right font-medium" />
                            <button type="button" onClick={() => removeLineItem(index)} className="p-2 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addLineItem} className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900">+ Add Line Item</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"></textarea></div>
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between items-center text-md"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span><span className="font-semibold dark:text-gray-200">{formatCurrency(formData.subtotal)}</span></div>
                    <div className="flex justify-between items-center text-md"><span className="text-gray-600 dark:text-gray-400">Tax (%):</span><input type="number" name="taxRate" value={formData.taxRate * 100} onChange={handleChange} className="w-24 p-1 border dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 dark:text-white" /></div>
                    <div className="flex justify-between items-center text-md"><span className="text-gray-600 dark:text-gray-400">Tax Amount:</span><span className="font-semibold dark:text-gray-200">{formatCurrency(formData.taxAmount)}</span></div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t dark:border-gray-600 mt-2"><span>Total:</span><span>{formatCurrency(formData.total)}</span></div>
                </div>
            </div>

             <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-primary rounded-lg disabled:opacity-50">
                    {editingEstimate ? t('saveChanges') : 'Create Estimate'}
                </button>
            </div>
        </form>
    );
};

export default EstimateForm;