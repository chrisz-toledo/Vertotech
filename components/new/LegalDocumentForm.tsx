
import React, { useState, useEffect, useRef } from 'react';
import type { LegalDocument } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';

interface LegalDocumentFormProps {
    onSave: (data: Omit<LegalDocument, 'id' | 'createdAt' | 'deletedAt'> | LegalDocument) => void;
    onCancel: () => void;
    editingDocument: LegalDocument | null;
}

// FIX: Aligned initialFormState with the LegalDocument type, which uses objectUrl.
const initialFormState: Omit<LegalDocument, 'id' | 'createdAt' | 'deletedAt'> = {
    name: '',
    type: 'insurance',
    issuer: '',
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    file: { mimeType: '', objectUrl: '', name: '' },
};

// FIX: Replaced readFileAsBase64 with readFileAsObjectUrl to align with the Document type definition.
const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

const LegalDocumentForm: React.FC<LegalDocumentFormProps> = ({ onSave, onCancel, editingDocument }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<LegalDocument, 'id' | 'createdAt' | 'deletedAt'> | LegalDocument>(initialFormState);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (editingDocument) {
            setFormData(editingDocument);
            // FIX: Use file.name for existing documents.
            setFileName(editingDocument.file.name);
        } else {
            setFormData(initialFormState);
            setFileName('');
        }
    }, [editingDocument]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // FIX: Use readFileAsObjectUrl and construct the file object correctly for the state.
                const doc = readFileAsObjectUrl(file);
                setFormData(prev => ({ ...prev, name: prev.name || doc.name, file: { mimeType: doc.mimeType, objectUrl: doc.objectUrl, name: doc.name } }));
                setFileName(doc.name);
            } catch (error) {
                alert('Error loading file.');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    // FIX: Changed validation to check for objectUrl instead of data.
    const isFormValid = formData.name && formData.issuer && formData.issueDate && formData.file.objectUrl;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Document Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Document Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white">
                        <option value="insurance">Insurance</option>
                        <option value="license">License</option>
                        <option value="permit">Permit</option>
                        <option value="corporate">Corporate</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Issuer</label>
                    <input type="text" name="issuer" value={formData.issuer} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Issue Date</label>
                    <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Expiration Date (Optional)</label>
                    <input type="date" name="expirationDate" value={formData.expirationDate || ''} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Document File</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500">
                        <PaperclipIcon className="w-5 h-5" />
                        <span>{fileName || 'Select file...'}</span>
                    </button>
                </div>
            </div>
             <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded">{t('cancel')}</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-primary rounded disabled:opacity-50">
                    {editingDocument ? t('saveChanges') : 'Save Document'}
                </button>
            </div>
        </form>
    );
};

export default LegalDocumentForm;