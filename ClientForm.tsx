import React, { useState, useEffect, useMemo } from 'react';
import type { Client, ClientRating, Jobsite, Document } from './types';
import { useOperationsStore } from './hooks/stores/useOperationsStore';
import { BuildingIcon } from './components/icons/BuildingIcon';
import { UserIcon } from './components/icons/UserIcon';
import { PhoneIcon } from './components/icons/PhoneIcon';
import { MailIcon } from './components/icons/MailIcon';
import { LocationMarkerIcon } from './components/icons/LocationMarkerIcon';
import { PercentageIcon } from './components/icons/PercentageIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { RatingStars } from './components/shared/RatingStars';
import { PaperclipIcon } from './components/icons/new/PaperclipIcon';
import { FileIcon } from './components/icons/new/FileIcon';
import { BriefcaseIcon } from './components/icons/new/BriefcaseIcon';
import { useTranslation } from './hooks/useTranslation';

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'deletedAt'>;

interface ClientFormProps {
  onSave: (clientData: ClientFormData, id?: string) => void;
  editingClient: Client | null;
  onCancel: () => void;
  onDeleteRequest: (client: Client) => void;
}

const RATING_CRITERIA_LABELS: Record<keyof ClientRating, string> = {
    ppeProvision: 'Proporción de PPE',
    toolProvision: 'Proporción de Herramienta',
    picky: 'Nivel de Exigencia (Picky)',
    payment: 'Pago',
    communication: 'Comunicación',
    problemSolving: 'Solución de Problemas',
};

const initialFormState: ClientFormData = {
  type: 'company', name: '', contactPerson: '', phone1: '', phone2: '', email: '', address: '',
  isActive: true,
  rating: { ppeProvision: 3, toolProvision: 3, picky: 3, payment: 3, communication: 3, problemSolving: 3 },
  retentionPercentage: 0, documents: [],
};

const InputField: React.FC<{id: string, name: string, label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, disabled?: boolean, placeholder?: string, icon: React.ReactNode, optional?: boolean, min?: string, step?: string}> = ({ id, label, icon, optional, ...props }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}{optional && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({t('optional')})</span>}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">{icon}</span>
                <input id={id} {...props} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
        </div>
    );
}

const RatingInput: React.FC<{label: string, value: number, onRate: (value: number) => void}> = ({ label, value, onRate }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <RatingStars rating={value} onRate={onRate} />
    </div>
);

// FIX: Replaced readFileAsBase64 with readFileAsObjectUrl to align with the Document type definition.
const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

const ClientForm: React.FC<ClientFormProps> = ({ onSave, editingClient, onCancel, onDeleteRequest }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ClientFormData>(initialFormState);
  const { jobsites } = useOperationsStore();

  const clientJobsites = useMemo(() => {
    if (!editingClient?.id) return [];
    return jobsites.filter(jobsite => jobsite.clientId === editingClient.id);
  }, [jobsites, editingClient]);

  useEffect(() => {
    if (editingClient) {
      setFormData({
        type: editingClient.type || 'company', name: editingClient.name, contactPerson: editingClient.contactPerson || '',
        phone1: editingClient.phone1 || '', phone2: editingClient.phone2 || '', email: editingClient.email || '',
        address: editingClient.address || '', isActive: editingClient.isActive,
        rating: editingClient.rating || initialFormState.rating,
        retentionPercentage: editingClient.retentionPercentage || 0,
        documents: editingClient.documents || [],
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.name === 'retentionPercentage' ? parseFloat(e.target.value) || 0 : e.target.value }));
  const handleRatingChange = (criterion: keyof ClientRating, value: number) => setFormData(prev => ({ ...prev, rating: { ...prev.rating, [criterion]: value } }));
  
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            // FIX: Use readFileAsObjectUrl and construct the Document object correctly.
            const docData = readFileAsObjectUrl(file);
            const newDocument: Document = {
                id: `doc-${Date.now()}`, name: docData.name,
                file: { mimeType: docData.mimeType, objectUrl: docData.objectUrl, name: docData.name },
                uploadedAt: new Date().toISOString(),
            };
            setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), newDocument] }));
        } catch (error) {
            console.error("Error uploading document:", error);
            alert("Could not upload file.");
        }
        e.target.value = ''; // Reset file input
    }
  };
  const handleRemoveDocument = (idToRemove: string) => setFormData(prev => ({ ...prev, documents: prev.documents?.filter(d => d.id !== idToRemove) }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const finalFormData = {...formData};
    
    if (finalFormData.type === 'individual') {
        finalFormData.contactPerson = ''; finalFormData.retentionPercentage = 0;
    }
    
    onSave(finalFormData, editingClient?.id);
    setFormData(initialFormState);
  };
  
  const handleDelete = () => { if (editingClient && onDeleteRequest) { onDeleteRequest(editingClient); } };
  const isFormValid = formData.name.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 pb-4 border-b dark:border-gray-700"><label className="text-sm font-medium dark:text-gray-300">{t('clientStatus')}</label><div className="flex gap-4"><button type="button" onClick={() => setFormData(p => ({...p, isActive: true}))} className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 ${formData.isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-500'}`}>{t('active')}</button><button type="button" onClick={() => setFormData(p => ({...p, isActive: false}))} className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 ${!formData.isActive ? 'bg-gray-500 text-white border-gray-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-500'}`}>{t('inactive')}</button></div></div>
      <div className="space-y-2 pb-4 border-b dark:border-gray-700"><label className="text-sm font-medium dark:text-gray-300">{t('clientType')}</label><div className="flex gap-4"><button type="button" onClick={() => setFormData(p => ({...p, type: 'company'}))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg border-2 ${formData.type === 'company' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-gray-700 hover:border-sky-500'}`}><BuildingIcon className="w-5 h-5"/>{t('company')}</button><button type="button" onClick={() => setFormData(p => ({...p, type: 'individual'}))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg border-2 ${formData.type === 'individual' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-gray-700 hover:border-sky-500'}`}><UserIcon className="w-5 h-5"/>{t('individual')}</button></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {formData.type === 'company' ? (<><div className="md:col-span-2"><InputField id="name" name="name" label={t('companyName')} value={formData.name} onChange={handleChange} required icon={<BuildingIcon className="w-5 h-5" />} /></div><InputField id="contactPerson" name="contactPerson" label={t('contactPerson')} optional value={formData.contactPerson} onChange={handleChange} icon={<UserIcon className="w-5 h-5" />} /></>) : (<div className="md:col-span-2"><InputField id="name" name="name" label={t('fullName')} value={formData.name} onChange={handleChange} required icon={<UserIcon className="w-5 h-5" />} /></div>)}
        <InputField id="phone1" name="phone1" label={t('phone1')} optional value={formData.phone1} onChange={handleChange} type="tel" icon={<PhoneIcon className="w-5 h-5" />} />
        <InputField id="phone2" name="phone2" label={t('phone2')} optional value={formData.phone2} onChange={handleChange} type="tel" icon={<PhoneIcon className="w-5 h-5" />} />
        <div className="md:col-span-2"><InputField id="email" name="email" label={t('email')} optional value={formData.email} onChange={handleChange} type="email" icon={<MailIcon className="w-5 h-5" />} /></div>
        <div className="md:col-span-2"><InputField id="address" name="address" label={t('mainAddress')} optional value={formData.address} onChange={handleChange} icon={<LocationMarkerIcon className="w-5 h-5" />} /></div>
        
        {formData.type === 'company' && (<div className="md:col-span-2"><InputField id="retentionPercentage" name="retentionPercentage" label={t('retentionPercentage')} value={formData.retentionPercentage} onChange={handleChange} type="number" min="0" step="0.1" icon={<PercentageIcon className="w-5 h-5" />} optional /></div>)}

        {formData.type === 'company' && editingClient && (<div className="md:col-span-2 space-y-4 pt-4 mt-4 border-t dark:border-gray-700"><h3 className="text-md font-semibold dark:text-gray-300">{t('jobsites')}</h3><div className="space-y-3 max-h-48 overflow-y-auto pr-2">{clientJobsites.map(j => (<div key={j.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600"><p>{j.address}</p></div>))}</div></div>)}
        
        {formData.type === 'company' && (
          <div className="md:col-span-2 space-y-4 pt-4 mt-4 border-t dark:border-gray-700">
              <h3 className="text-md font-semibold dark:text-gray-300">{t('clientDocs')}</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {formData.documents?.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                          <div className="flex items-center gap-3">
                              <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{doc.name}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="p-1 rounded-full text-gray-400 hover:bg-rose-100 flex-shrink-0"><XCircleIcon className="w-5 h-5"/></button>
                      </div>
                  ))}
              </div>
              <div>
                  <label htmlFor="document-upload" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500">
                      <PaperclipIcon className="w-5 h-5" />
                      <span>{t('attachDocument')}</span>
                  </label>
                  <input id="document-upload" type="file" className="hidden" onChange={handleDocumentUpload} />
              </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t dark:border-gray-700"><h3 className="text-lg font-semibold dark:text-gray-200">{t('clientRating')}</h3><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(Object.keys(initialFormState.rating) as Array<keyof ClientRating>).map(key => (
              <RatingInput key={key} label={RATING_CRITERIA_LABELS[key]} value={formData.rating[key]} onRate={(v) => handleRatingChange(key, v)} />
          ))}
      </div></div>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t dark:border-gray-700">
        <div className="flex gap-4">
          <button type="submit" name="save" disabled={!isFormValid} className="glass-button">{editingClient ? t('saveChanges_btn') : t('addClient')}</button>
          <button type="button" onClick={onCancel} className="glass-button-secondary">{t('cancel')}</button>
        </div>
        {editingClient && onDeleteRequest && (<button type="button" onClick={handleDelete} className="glass-button-destructive"><TrashIcon className="w-5 h-5" />{t('moveToTrash')}</button>)}
      </div>
    </form>
  );
};
export default ClientForm;