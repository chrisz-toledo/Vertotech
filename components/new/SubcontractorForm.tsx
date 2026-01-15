import React, { useState, useEffect, useRef } from 'react';
import type { Subcontractor, ComplianceDocument } from '../../types';
import { BuildingIcon } from '../icons/BuildingIcon';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import { UserIcon } from '../icons/UserIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { MailIcon } from '../icons/MailIcon';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface SubcontractorFormProps {
    onSave: (data: Omit<Subcontractor, 'id' | 'deletedAt'> | Subcontractor) => void;
    onCancel: () => void;
    editingSubcontractor: Subcontractor | null;
}

const initialFormState: Omit<Subcontractor, 'id' | 'deletedAt'> = {
    name: '',
    trade: '',
    contactPerson: '',
    phone: '',
    email: '',
    documents: [],
};

const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

const SubcontractorForm: React.FC<SubcontractorFormProps> = ({ onSave, onCancel, editingSubcontractor }) => {
    const [formData, setFormData] = useState<Omit<Subcontractor, 'id' | 'deletedAt'> | Subcontractor>(editingSubcontractor || initialFormState);
    const docFileRef = useRef<HTMLInputElement>(null);
    const [currentDoc, setCurrentDoc] = useState<{ type: ComplianceDocument['type'], expirationDate?: string }>({ type: 'insurance' });
    
    useEffect(() => {
        setFormData(editingSubcontractor || initialFormState);
    }, [editingSubcontractor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const docData = readFileAsObjectUrl(file);
                const newDocument: ComplianceDocument = {
                    id: `doc-sub-${Date.now()}`,
                    name: docData.name,
                    file: { mimeType: docData.mimeType, objectUrl: docData.objectUrl, name: docData.name },
                    uploadedAt: new Date().toISOString(),
                    type: currentDoc.type,
                    expirationDate: currentDoc.expirationDate,
                };
                setFormData(prev => ({ ...prev, documents: [...prev.documents, newDocument] }));
            } catch (error) {
                console.error("Error uploading document:", error);
                alert("No se pudo cargar el archivo.");
            }
        }
        if(docFileRef.current) docFileRef.current.value = '';
    };
    
    const removeDocument = (id: string) => {
        setFormData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.name && formData.trade && formData.contactPerson && formData.phone;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre de la Compañía</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><BuildingIcon className="w-5 h-5"/></span><input name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" required /></div>
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Oficio</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><BriefcaseIcon className="w-5 h-5"/></span><input name="trade" value={formData.trade} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" required /></div>
                </div>
                 <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Persona de Contacto</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><UserIcon className="w-5 h-5"/></span><input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" required /></div>
                </div>
                 <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Teléfono</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><PhoneIcon className="w-5 h-5"/></span><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" required /></div>
                </div>
                 <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                    <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><MailIcon className="w-5 h-5"/></span><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" /></div>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold dark:text-gray-200">Documentos de Cumplimiento</h3>
                <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo de Documento</label>
                            <select value={currentDoc.type} onChange={e => setCurrentDoc(p => ({...p, type: e.target.value as any}))} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                                <option value="insurance">Seguro</option>
                                <option value="license">Licencia</option>
                                <option value="w9">W9</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha de Vencimiento (Opcional)</label>
                            <input type="date" value={currentDoc.expirationDate || ''} onChange={e => setCurrentDoc(p => ({...p, expirationDate: e.target.value}))} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        </div>
                    </div>
                    <button type="button" onClick={() => docFileRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500">
                        <PaperclipIcon className="w-5 h-5" />
                        <span>Adjuntar Documento</span>
                    </button>
                    <input type="file" ref={docFileRef} onChange={handleDocumentUpload} className="hidden" />
                </div>
                
                 {formData.documents.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.documents.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                                <div>
                                    <p className="font-medium dark:text-gray-200">{doc.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{doc.type} {doc.expirationDate ? `- Vence: ${new Date(doc.expirationDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}` : ''}</p>
                                </div>
                                <button type="button" onClick={() => removeDocument(doc.id)} className="text-rose-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">
                    {editingSubcontractor ? 'Guardar Cambios' : 'Añadir Subcontratista'}
                </button>
            </div>
        </form>
    );
};

export default SubcontractorForm;