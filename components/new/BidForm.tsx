import React, { useState, useEffect } from 'react';
import type { Bid, BidLineItem, BidLineItemCategory, Client } from '../../types';
import * as geminiService from '../../services/geminiService';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { SparklesIcon } from '../icons/SparklesIcon';

interface BidFormProps {
    onSave: (data: Omit<Bid, 'id' | 'bidNumber' | 'createdAt' | 'deletedAt'> | Bid) => void;
    onCancel: () => void;
    editingBid: Bid | null;
    clients: Client[];
}

const initialFormState: Omit<Bid, 'id' | 'bidNumber' | 'createdAt' | 'deletedAt'> = {
    clientId: '',
    title: '',
    projectAddress: '',
    date: new Date().toISOString().split('T')[0],
    status: 'borrador',
    scopeOfWork: '',
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
};

const lineItemCategories: BidLineItemCategory[] = ['Mano de Obra', 'Materiales', 'Equipos', 'Subcontratistas', 'Permisos', 'Misceláneos'];

const BidForm: React.FC<BidFormProps> = ({ onSave, onCancel, editingBid, clients }) => {
    const [formData, setFormData] = useState<Omit<Bid, 'id' | 'bidNumber' | 'createdAt' | 'deletedAt'> | Bid>(editingBid || initialFormState);
    const [rfpText, setRfpText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        setFormData(editingBid || { ...initialFormState, clientId: clients[0]?.id || '' });
    }, [editingBid, clients]);

    useEffect(() => {
        const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal + formData.tax;
        setFormData(prev => ({ ...prev, subtotal, total }));
    }, [formData.lineItems, formData.tax]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'tax' ? parseFloat(value) || 0 : value }));
    };

    const handleLineItemChange = (index: number, field: keyof BidLineItem, value: any) => {
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
        setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, { id: `li-${Date.now()}`, category: 'Mano de Obra', description: '', quantity: 1, unitCost: 0, total: 0 }]}));
    };

    const removeLineItem = (index: number) => {
        setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
    };
    
    const handleAnalyzeRFP = async () => {
        if (!rfpText.trim()) return;
        setIsAnalyzing(true);
        try {
            const result = await geminiService.analyzeRFPForBid(rfpText);
            setFormData(prev => ({
                ...prev,
                title: result.title,
                scopeOfWork: result.scopeOfWork,
                lineItems: [...prev.lineItems, ...result.lineItems],
            }));
        } catch (error) {
            alert('Error analyzing RFP. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isFormValid = formData.clientId && formData.title && formData.projectAddress;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Analyze RFP with AI</label>
                <textarea value={rfpText} onChange={e => setRfpText(e.target.value)} rows={3} placeholder="Paste the Request for Proposal text here..." className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" />
                <button type="button" onClick={handleAnalyzeRFP} disabled={isAnalyzing} className="mt-2 flex items-center gap-2 px-3 py-1 text-sm font-semibold text-white bg-violet-600 rounded-lg disabled:bg-violet-400">
                    <SparklesIcon className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Client</label><select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required><option value="" disabled>Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Bid Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Project Address</label><input type="text" name="projectAddress" value={formData.projectAddress} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></div>
            </div>

            <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Scope of Work</label><textarea name="scopeOfWork" value={formData.scopeOfWork} onChange={handleChange} rows={3} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"></textarea></div>

            <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">Line Items</label>
                {formData.lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-[150px,1fr,100px,120px,120px,auto] gap-2 items-center">
                        <select value={item.category} onChange={e => handleLineItemChange(index, 'category', e.target.value)} className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"><option disabled>Category</option>{lineItemCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <input type="text" placeholder="Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                        <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} className="p-2 border dark:border-gray-600 rounded text-right bg-white dark:bg-gray-700 dark:text-white" min="0" />
                        <input type="number" placeholder="Unit Cost" value={item.unitCost || ''} onChange={e => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value))} className="p-2 border dark:border-gray-600 rounded text-right bg-white dark:bg-gray-700 dark:text-white" min="0" step="0.01" />
                        <input type="text" value={formatCurrency(item.total)} readOnly className="p-2 border-0 bg-gray-50 dark:bg-gray-800 rounded text-right font-medium" />
                        <button type="button" onClick={() => removeLineItem(index)} className="p-2 text-rose-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
                <button type="button" onClick={addLineItem} className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">+ Add Line Item</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"></textarea></div>
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">{formatCurrency(formData.subtotal)}</span></div>
                    <div className="flex justify-between items-center"><span>Tax:</span><input type="number" name="tax" value={formData.tax} onChange={handleChange} className="w-24 p-1 border dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 dark:text-white" /></div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t"><span>Total:</span><span>{formatCurrency(formData.total)}</span></div>
                </div>
            </div>

             <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded disabled:bg-gray-400">
                    {editingBid ? 'Save Changes' : 'Create Bid'}
                </button>
            </div>
        </form>
    );
};

export default BidForm;