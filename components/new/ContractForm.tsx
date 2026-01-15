
import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import type { Contract, Client, Jobsite, ContractStatus, Signature } from '../../types';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { SignaturePad } from '../shared/SignaturePad';
import { BuildingIcon } from '../icons/BuildingIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface ContractFormProps {
    onSave: (data: Omit<Contract, 'id' | 'createdAt' | 'deletedAt'> | Contract) => void;
    onCancel: () => void;
    editingContract: Contract | null;
    clients: Client[];
    jobsites: Jobsite[];
}

const initialFormState: Omit<Contract, 'id' | 'createdAt' | 'deletedAt'> = {
    clientId: '',
    jobsiteId: '',
    title: '',
    scopeOfWork: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    totalAmount: 0,
    status: 'draft',
};

// FIX: Replaced readFileAsBase64 with readFileAsObjectUrl to align with the Document type definition.
const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

const ContractForm = forwardRef((props: ContractFormProps, ref) => {
    const { onSave, onCancel, editingContract, clients, jobsites } = props;
    const { t } = useTranslation();
    const aiStore = useAiStore();
    const [formData, setFormData] = useState<Omit<Contract, 'id' | 'createdAt' | 'deletedAt'> | Contract>(editingContract || initialFormState);
    const [isGeneratingScope, setIsGeneratingScope] = useState(false);
    const formElementRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
        getFormData: () => formData,
        getFormElement: () => formElementRef.current,
    }));

    useEffect(() => {
        setFormData(editingContract || initialFormState);
    }, [editingContract]);

    const availableJobsites = useMemo(() => {
        return jobsites.filter(j => j.clientId === formData.clientId);
    }, [formData.clientId, jobsites]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'totalAmount' ? parseFloat(value) : value }));
    };

    // FIX: Use readFileAsObjectUrl and construct the Document object correctly.
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const doc = readFileAsObjectUrl(file);
            setFormData(prev => ({...prev, document: doc }));
        }
    };
    
    const handleSignatureChange = (type: 'company' | 'client', dataUrl: string) => {
        const signature: Signature = { dataUrl, signedAt: new Date().toISOString() };
        if (type === 'company') {
            setFormData(prev => ({...prev, companySignature: signature }));
        } else {
            setFormData(prev => ({...prev, clientSignature: signature }));
        }
    };

    const handleGenerateScope = async () => {
        if (!formData.title || !formData.clientId) {
            alert("Por favor, ingrese un título y seleccione un cliente primero.");
            return;
        }
        setIsGeneratingScope(true);
        try {
            const clientName = clients.find(c => c.id === formData.clientId)?.name || '';
            const suggestion = await aiStore.getContractScopeSuggestion(formData.title, clientName);
            setFormData(prev => ({ ...prev, scopeOfWork: suggestion }));
        } catch (error) {
            console.error("Error generating scope:", error);
            alert("No se pudo generar el alcance del trabajo.");
        } finally {
            setIsGeneratingScope(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.clientId && formData.jobsiteId && formData.title && formData.totalAmount > 0;

    return (
        <form ref={formElementRef} onSubmit={handleSubmit} className="space-y-6 printable-area">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Cliente</label>
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="" disabled>Seleccione un cliente</option>
                        {clients.filter(c => c.type === 'company').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Sitio de Trabajo</label>
                    <select name="jobsiteId" value={formData.jobsiteId} onChange={handleChange} className="w-full p-2 border rounded" required disabled={!formData.clientId}>
                        <option value="" disabled>Seleccione un sitio</option>
                        {availableJobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Título del Contrato</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required/>
                </div>
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium">Alcance del Trabajo</label>
                        <button type="button" onClick={handleGenerateScope} disabled={isGeneratingScope} className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-white bg-violet-600 rounded-lg disabled:bg-violet-400 no-print">
                             <SparklesIcon className={`w-4 h-4 ${isGeneratingScope ? 'animate-spin' : ''}`} />
                             {isGeneratingScope ? 'Generando...' : t('generateWithAI')}
                        </button>
                    </div>
                    <textarea name="scopeOfWork" value={formData.scopeOfWork} onChange={handleChange} rows={4} className="w-full p-2 border rounded"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Inicio</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Finalización</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Monto Total</label>
                    <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="w-full p-2 border rounded" required min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="draft">Borrador</option>
                        <option value="sent">Enviado</option>
                        <option value="signed">Firmado</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Documento del Contrato</label>
                    <input type="file" onChange={handleFileUpload} className="w-full p-2 border rounded" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                    <label className="block text-sm font-medium mb-2 text-center">Firma de la Compañía</label>
                    <SignaturePad value={formData.companySignature?.dataUrl || ''} onChange={(dataUrl) => handleSignatureChange('company', dataUrl)} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-center">Firma del Cliente</label>
                     <SignaturePad value={formData.clientSignature?.dataUrl || ''} onChange={(dataUrl) => handleSignatureChange('client', dataUrl)} />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t no-print">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded disabled:bg-gray-400">
                    {editingContract ? 'Guardar Cambios' : 'Crear Contrato'}
                </button>
            </div>
        </form>
    );
});

export default ContractForm;