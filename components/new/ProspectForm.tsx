import React, { useState, useEffect } from 'react';
import type { Prospect } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { BuildingIcon } from '../icons/BuildingIcon';
import { UserIcon } from '../icons/UserIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { MailIcon } from '../icons/MailIcon';
import { TagIcon } from '../icons/new/TagIcon';

interface ProspectFormProps {
    onSave: (data: Omit<Prospect, 'id' | 'createdAt' | 'deletedAt'> | Prospect, id?: string) => void;
    onCancel: () => void;
    editingProspect: Prospect | null;
}

const initialFormState: Omit<Prospect, 'id' | 'createdAt' | 'deletedAt'> = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    source: '',
};

const ProspectForm: React.FC<ProspectFormProps> = ({ onSave, onCancel, editingProspect }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<Prospect, 'id' | 'createdAt' | 'deletedAt'>>(initialFormState);

    useEffect(() => {
        if (editingProspect) {
            setFormData(editingProspect);
        } else {
            setFormData(initialFormState);
        }
    }, [editingProspect]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, (editingProspect as Prospect)?.id);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Name (Company or Individual)</label>
                <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><BuildingIcon className="w-5 h-5"/></span><input name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" required /></div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Contact Person (Optional)</label>
                <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><UserIcon className="w-5 h-5"/></span><input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Phone (Optional)</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><PhoneIcon className="w-5 h-5"/></span><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email (Optional)</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><MailIcon className="w-5 h-5"/></span><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Source (Optional)</label>
                <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span><input name="source" value={formData.source} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="e.g., Referral, Website" /></div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded">{t('cancel')}</button>
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-primary rounded">{editingProspect ? t('saveChanges') : 'Save Prospect'}</button>
            </div>
        </form>
    );
};

export default ProspectForm;