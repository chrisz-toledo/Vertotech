import React, { useState, useEffect } from 'react';
import type { Opportunity, Prospect, CommunicationLog, OpportunityStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { TrashIcon } from '../icons/TrashIcon';

interface OpportunityFormProps {
    onSave: (data: Omit<Opportunity, 'id' | 'createdAt' | 'deletedAt'> | Opportunity, id?: string) => void;
    onCancel: () => void;
    editingOpportunity: Opportunity | null;
    prospects: Prospect[];
}

const initialFormState: Omit<Opportunity, 'id' | 'createdAt' | 'deletedAt'> = {
    title: '',
    prospectId: '',
    estimatedValue: 0,
    status: 'lead',
    source: '',
    communicationLogs: [],
};

const OpportunityForm: React.FC<OpportunityFormProps> = ({ onSave, onCancel, editingOpportunity, prospects }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<Opportunity, 'id' | 'createdAt' | 'deletedAt'> | Opportunity>(initialFormState);
    const [newLog, setNewLog] = useState<{ type: CommunicationLog['type'], notes: string }>({ type: 'call', notes: '' });

    useEffect(() => {
        if (editingOpportunity) {
            setFormData(editingOpportunity);
        } else {
            setFormData({ ...initialFormState, prospectId: prospects[0]?.id || '' });
        }
    }, [editingOpportunity, prospects]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'estimatedValue' ? parseFloat(value) || 0 : value }));
    };

    const addCommunicationLog = () => {
        if (!newLog.notes.trim()) return;
        const log: CommunicationLog = {
            id: `log-${Date.now()}`,
            date: new Date().toISOString(),
            ...newLog
        };
        setFormData(prev => ({ ...prev, communicationLogs: [log, ...prev.communicationLogs] }));
        setNewLog({ type: 'call', notes: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, (editingOpportunity as Opportunity)?.id);
    };

    const isFormValid = formData.title && formData.prospectId;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Opportunity Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Prospect</label>
                    <select name="prospectId" value={formData.prospectId} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required>
                        <option value="" disabled>Select a prospect</option>
                        {prospects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Estimated Value ($)</label>
                    <input type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" min="0" step="100" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white">
                        {(['lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost'] as OpportunityStatus[]).map(s => <option key={s} value={s}>{t(s as any)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Source (Optional)</label>
                    <input name="source" value={formData.source || ''} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" />
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold dark:text-gray-200">Communication History</h3>
                <div className="space-y-2 p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex gap-2">
                        <select value={newLog.type} onChange={e => setNewLog(p => ({...p, type: e.target.value as any}))} className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white">
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="text">Text</option>
                        </select>
                        <input value={newLog.notes} onChange={e => setNewLog(p => ({...p, notes: e.target.value}))} placeholder="Add communication note..." className="flex-grow p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" />
                        <button type="button" onClick={addCommunicationLog} className="px-4 py-2 font-semibold text-white bg-primary rounded-lg">Add</button>
                    </div>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {formData.communicationLogs.map(log => (
                        <div key={log.id} className="p-2 border-b dark:border-gray-700">
                            <p className="text-sm font-medium dark:text-gray-200">{log.notes}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleString()} - {log.type}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded">{t('cancel')}</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-primary rounded disabled:opacity-50">
                    {editingOpportunity ? t('saveChanges') : 'Save Opportunity'}
                </button>
            </div>
        </form>
    );
};

export default OpportunityForm;