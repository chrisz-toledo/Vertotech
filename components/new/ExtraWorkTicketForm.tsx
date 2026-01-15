

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ExtraWorkTicket, Client, Jobsite, Employee } from '../../types';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { UserIcon } from '../icons/UserIcon';
import { SignaturePad } from '../shared/SignaturePad';
import { BuildingIcon } from '../icons/BuildingIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { formatCurrency } from '../../utils/formatters';
import { CommentsSection } from '../shared/CommentsSection';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import * as geminiService from '../../services/geminiService';

interface ExtraWorkTicketFormProps {
    onSave: (ticketData: any) => void;
    onCancel: () => void;
    editingTicket: ExtraWorkTicket | null;
    clients: Client[];
    jobsites: Jobsite[];
    employees: Employee[];
    onAnalyzeReceipt: (image: {mimeType: string, data: string}) => Promise<string>;
    prefillData?: { clientId?: string, jobsiteId?: string };
}

const initialFormState: Omit<ExtraWorkTicket, 'id' | 'createdAt' | 'deletedAt' | 'ticketNumber'> = {
    clientId: '',
    jobsiteId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    employeeIds: [],
    hours: 0,
    materialsUsed: '',
    status: 'pending',
    requestedBy: '',
    signature: '',
    costImpact: 0,
    comments: [],
    category: 'client_request',
};

const readFileAsBase64 = (file: File): Promise<{ mimeType: string; data: string; name: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => reader.result && typeof reader.result === 'string'
            ? resolve({ mimeType: file.type, data: reader.result.split(',')[1], name: file.name })
            : reject(new Error('No se pudo leer el archivo.'));
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const ExtraWorkTicketForm: React.FC<ExtraWorkTicketFormProps> = ({ onSave, onCancel, editingTicket, clients, jobsites, employees, onAnalyzeReceipt, prefillData }) => {
    const operationsStore = useOperationsStore();
    const { companyInfo, documentSettings } = useAppStore();
    const [formData, setFormData] = useState<Omit<ExtraWorkTicket, 'id' | 'createdAt' | 'deletedAt' | 'ticketNumber'> | ExtraWorkTicket>(editingTicket || initialFormState);
    const receiptFileRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalyzingCooldown, setIsAnalyzingCooldown] = useState(false);
    const cooldownTimerRef = useRef<number | null>(null);
    const [suggestions, setSuggestions] = useState<{ employee: Employee; reason: string; }[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);
    const client = useMemo(() => clients.find(c => c.id === formData.clientId), [formData.clientId, clients]);
    const jobsite = useMemo(() => jobsites.find(j => j.id === formData.jobsiteId), [formData.jobsiteId, jobsites]);

    useEffect(() => {
        if (editingTicket) setFormData(editingTicket);
        else setFormData({ ...initialFormState, ...(prefillData || {}) });
    }, [editingTicket, prefillData]);
    
    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: name === 'hours' || name === 'costImpact' ? parseFloat(value) || 0 : value }));
    };

    const handleEmployeeToggle = (id: string) => {
        setFormData(p => ({ ...p, employeeIds: p.employeeIds.includes(id) ? p.employeeIds.filter(eid => eid !== id) : [...p.employeeIds, id] }));
    };

    const handleAnalyze = async () => {
        const file = receiptFileRef.current?.files?.[0];
        if (!file) return;
        setIsAnalyzing(true);
        setIsAnalyzingCooldown(true);
        try {
            const image = await readFileAsBase64(file);
            const analysis = await onAnalyzeReceipt(image);
            setFormData(p => ({ ...p, description: `${p.description}\n\n--- Analizado del Recibo ---\n${analysis}`.trim() }));
        } catch (err) { console.error(err); } finally { 
            setIsAnalyzing(false); 
            cooldownTimerRef.current = window.setTimeout(() => setIsAnalyzingCooldown(false), 5000);
        }
    };
    
    const handleSuggestEmployees = async () => {
        if (!formData.description) return;
        setIsSuggesting(true);
        try {
            const results = await geminiService.suggestEmployeesForTicket(formData.description, employees);
            setSuggestions(results.map(r => ({ employee: employeeMap.get(r.employeeId)!, reason: r.reason })).filter(i => i.employee));
        } finally { setIsSuggesting(false); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.clientId && formData.jobsiteId && formData.description && formData.employeeIds.length > 0 && formData.hours > 0 && formData.requestedBy;

    return (
        <div className="doc-container printable-area">
             <header className={`doc-header doc-header-logo-${documentSettings.logoPosition}`}>
                {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Company Logo" className="doc-logo" />}
                {documentSettings.showCompanyInfo && (
                    <div className="doc-company-info">
                        <p className="font-bold">{companyInfo.name}</p>
                        <p>{companyInfo.address}</p>
                        <p>{companyInfo.phone}</p>
                    </div>
                )}
            </header>
            <h1 className="doc-title">Ticket de Trabajo Extra</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-1">Cliente</label><select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border rounded" required><option value="" disabled>Seleccione un cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><span className="doc-display-value hidden">{client?.name}</span></div>
                    <div><label className="block text-sm font-medium mb-1">Sitio</label><select name="jobsiteId" value={formData.jobsiteId} onChange={handleChange} className="w-full p-2 border rounded" required disabled={!formData.clientId}><option value="" disabled>Seleccione un sitio</option>{jobsites.filter(j => j.clientId === formData.clientId).map(j => <option key={j.id} value={j.id}>{j.address}</option>)}</select><span className="doc-display-value hidden">{jobsite?.address}</span></div>
                    <div><label className="block text-sm font-medium mb-1">Fecha</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" required /><span className="doc-display-value hidden">{new Date(formData.date + 'T00:00:00Z').toLocaleDateString()}</span></div>
                    <div><label className="block text-sm font-medium mb-1">Solicitado por</label><input type="text" name="requestedBy" value={formData.requestedBy} onChange={handleChange} className="w-full p-2 border rounded" required /><span className="doc-display-value hidden">{formData.requestedBy}</span></div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium">Descripción del Trabajo</label>
                        <div className="flex items-center gap-2 no-print">
                            <input type="file" ref={receiptFileRef} className="hidden"/><button type="button" onClick={() => receiptFileRef.current?.click()} className="text-xs font-semibold">Adjuntar Recibo</button>
                            <button type="button" onClick={handleAnalyze} disabled={isAnalyzing || isAnalyzingCooldown} className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-violet-600 rounded disabled:bg-violet-300"><SparklesIcon className="w-3 h-3"/>{isAnalyzing ? "Analizando..." : (isAnalyzingCooldown ? "Espere..." : "Analizar")}</button>
                        </div>
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-2 border rounded" required />
                    <div className="doc-display-value hidden whitespace-pre-wrap">{formData.description}</div>
                </div>
                 <div>
                    <label className="text-sm font-medium">Materiales Usados (Opcional)</label>
                    <textarea name="materialsUsed" value={formData.materialsUsed || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded" />
                     <div className="doc-display-value hidden whitespace-pre-wrap">{formData.materialsUsed}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium">Equipo</label>
                            <button type="button" onClick={handleSuggestEmployees} disabled={isSuggesting} className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-violet-600 rounded no-print"><SparklesIcon className="w-3 h-3"/>{isSuggesting ? "Buscando..." : "Sugerir"}</button>
                        </div>
                        <div className="p-2 border rounded max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
                            {employees.filter(e => e.isActive).map(e => (<div key={e.id}><input type="checkbox" id={`emp-${e.id}`} checked={formData.employeeIds.includes(e.id)} onChange={() => handleEmployeeToggle(e.id)} className="mr-2"/><label htmlFor={`emp-${e.id}`}>{e.name}</label></div>))}
                        </div>
                         <ul className="doc-display-value hidden list-disc pl-5">{formData.employeeIds.map(id => <li key={id}>{employeeMap.get(id)?.name}</li>)}</ul>
                        {suggestions.length > 0 && <div className="mt-2 p-2 border-violet-200 bg-violet-50 rounded no-print"><h4>Sugerencias:</h4>{suggestions.map(s => <p key={s.employee.id} className="text-xs"><strong>{s.employee.name}:</strong> {s.reason}</p>)}</div>}
                    </div>
                     <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Horas Totales</label><input type="number" name="hours" value={formData.hours} onChange={handleChange} className="w-full p-2 border rounded" min="0" required /><span className="doc-display-value hidden">{formData.hours}</span></div>
                        <div><label className="block text-sm font-medium mb-1">Costo Estimado</label><input type="number" name="costImpact" value={formData.costImpact} onChange={handleChange} className="w-full p-2 border rounded" min="0" /><span className="doc-display-value hidden">{formatCurrency(formData.costImpact)}</span></div>
                        <div><label className="block text-sm font-medium mb-1">Estado</label><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded"><option value="pending">Pendiente</option><option value="approved">Aprobado</option><option value="rejected">Rechazado</option></select><span className="doc-display-value hidden">{formData.status}</span></div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-center">Firma de Aprobación</label>
                    <SignaturePad value={formData.signature} onChange={(sig) => setFormData(p => ({ ...p, signature: sig }))} />
                </div>
                 <div className="flex justify-end gap-4 pt-6 border-t no-print">
                    <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">
                        {editingTicket ? 'Guardar Cambios' : 'Crear Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExtraWorkTicketForm;