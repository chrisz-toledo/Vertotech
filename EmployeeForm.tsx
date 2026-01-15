import React, { useState, useEffect, useRef } from 'react';
import type { Employee, EmployeeRating, ComplianceDocument, EmployeeRole } from './types';
import { useAppStore } from './hooks/stores/useAppStore';
import { usePeopleStore } from './hooks/stores/usePeopleStore';
import { UserIcon } from './components/icons/UserIcon';
import { PhoneIcon } from './components/icons/PhoneIcon';
import { IdCardIcon } from './components/icons/IdCardIcon';
import { DollarSignIcon } from './components/icons/DollarSignIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { CameraModal } from './components/CameraModal';
import { StarIcon } from './components/icons/StarIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { RatingStars } from './components/shared/RatingStars';
import { PaperclipIcon } from './components/icons/new/PaperclipIcon';
import { FileIcon } from './components/icons/new/FileIcon';
import { useTranslation } from './hooks/useTranslation';


export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'deletedAt' | 'hourlyRate' | 'overtimeRate'> & {
    hourlyRate: string;
    overtimeRate: string;
};

interface EmployeeFormProps {
  onSave: (employeeData: EmployeeFormData, id?: string) => void;
  editingEmployee: Employee | null;
  onCancel: () => void;
  jobRoles: string[];
  onAddJobRole: (role: string) => void;
}

const RATING_LABELS: Record<keyof EmployeeRating, string> = {
  quality: 'Calidad',
  speed: 'Velocidad',
  proactivity: 'Proactividad',
  autonomy: 'Autonomía',
  punctuality: 'Puntualidad',
  attendance: 'Asistencia',
  availability: 'Disponibilidad',
  obedience: 'Obediencia',
  problemSolving: 'Solución de Problemas',
  specialty: 'Especialidad',
};

const initialDefaultRating: EmployeeRating = {
    quality: 3, speed: 3, proactivity: 3, autonomy: 3, punctuality: 3, attendance: 3, 
    availability: 3, obedience: 3, problemSolving: 3, specialty: 3,
};

const initialFormState: EmployeeFormData = {
  name: '', phone1: '', phone2: '', photoUrl: '', job: '', ssn: '',
  hourlyRate: '', overtimeRate: '', isActive: true,
  rating: initialDefaultRating,
  specialtyDescription: '',
  documents: [],
  role: 'Labor',
  balanceHistory: [],
};

const InputField: React.FC<{id: string, name: string, label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string, required?: boolean, disabled?: boolean, placeholder?: string, min?: string, step?: string, icon: React.ReactNode, optional?: boolean}> = ({ id, label, icon, optional, ...props }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}{optional && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({t('optional')})</span>}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">{icon}</span>
                <input id={id} {...props} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-200/50 dark:disabled:bg-gray-900/50" />
            </div>
        </div>
    );
};

const RatingInput: React.FC<{label: string, value: number, onRate: (value: number) => void}> = ({ label, value, onRate }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <RatingStars rating={value} onRate={onRate} />
    </div>
);

const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

const EmployeeForm: React.FC<Omit<EmployeeFormProps, 'onDeleteRequest'>> = ({ onSave, editingEmployee, onCancel, jobRoles, onAddJobRole }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);
  const { deleteEmployee } = usePeopleStore();
  const { confirm } = useAppStore();
  
  const [phone1NotApplicable, setPhone1NotApplicable] = useState(false);
  const [photoNotApplicable, setPhotoNotApplicable] = useState(false);
  const [overtimeNotApplicable, setOvertimeNotApplicable] = useState(false);
  const [ssnNotApplicable, setSsnNotApplicable] = useState(false);
  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [newRoleValue, setNewRoleValue] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [newDocDetails, setNewDocDetails] = useState<{ type: ComplianceDocument['type'], expirationDate?: string }>({ type: 'certification', expirationDate: '' });
  const newRoleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingEmployee) {
      const isPhone1NA = editingEmployee.phone1.toLowerCase() === 'n/a';
      const isPhotoNA = !editingEmployee.photoUrl;
      const isOvertimeNA = editingEmployee.overtimeRate === 0;
      const isSsnNA = !editingEmployee.ssn;
      setFormData({
        name: editingEmployee.name, phone1: isPhone1NA ? '' : editingEmployee.phone1, phone2: editingEmployee.phone2 || '',
        photoUrl: editingEmployee.photoUrl || '', job: editingEmployee.job, ssn: editingEmployee.ssn || '',
        hourlyRate: editingEmployee.hourlyRate.toString(), overtimeRate: isOvertimeNA ? '0' : editingEmployee.overtimeRate.toString(),
        isActive: editingEmployee.isActive, rating: editingEmployee.rating || initialDefaultRating,
        specialtyDescription: editingEmployee.specialtyDescription || '',
        documents: editingEmployee.documents || [],
        role: editingEmployee.role || 'Labor',
        balanceHistory: editingEmployee.balanceHistory || [],
      });
      setPhone1NotApplicable(isPhone1NA);
      setPhotoNotApplicable(isPhotoNA);
      setOvertimeNotApplicable(isOvertimeNA);
      setSsnNotApplicable(isSsnNA);
      setIsAddingNewRole(false);
    } else {
      setFormData(initialFormState);
      setPhone1NotApplicable(false); setPhotoNotApplicable(false); setOvertimeNotApplicable(false); setSsnNotApplicable(false);
    }
  }, [editingEmployee]);
  
  useEffect(() => { if (isAddingNewRole) newRoleInputRef.current?.focus(); }, [isAddingNewRole]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const { objectUrl } = readFileAsObjectUrl(file);
        setFormData(prev => ({ ...prev, photoUrl: objectUrl }));
        // Clean up previous blob URL if it exists to prevent memory leaks
        if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(formData.photoUrl);
        }
    }
  };
  
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            const docData = readFileAsObjectUrl(file);
            const newDocument: ComplianceDocument = {
                id: `doc-emp-${Date.now()}`, name: docData.name,
                file: { mimeType: docData.mimeType, objectUrl: docData.objectUrl, name: docData.name }, 
                uploadedAt: new Date().toISOString(),
                type: newDocDetails.type, expirationDate: newDocDetails.expirationDate || undefined,
            };
            setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), newDocument] }));
        } catch (error) { console.error("Error uploading document:", error); alert("Could not upload file."); }
        e.target.value = '';
    }
  };
  const handleRemoveDocument = (idToRemove: string) => setFormData(prev => ({ ...prev, documents: prev.documents?.filter(d => d.id !== idToRemove) }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'job' && value === '_addNew_') {
      setIsAddingNewRole(true);
      setFormData(prev => ({...prev, job: ''}));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const createToggleHandler = (setter: React.Dispatch<React.SetStateAction<boolean>>, fieldToClear?: keyof EmployeeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      setter(isChecked);
      if (isChecked && fieldToClear) {
          const resetValue = fieldToClear === 'overtimeRate' ? '0' : '';
          setFormData(prev => ({ ...prev, [fieldToClear]: resetValue }));
      }
  };

  const handlePhone1Checkbox = createToggleHandler(setPhone1NotApplicable, 'phone1');
  const handlePhotoCheckbox = createToggleHandler(setPhotoNotApplicable, 'photoUrl');
  const handleOvertimeCheckbox = createToggleHandler(setOvertimeNotApplicable, 'overtimeRate');
  const handleSsnCheckbox = createToggleHandler(setSsnNotApplicable, 'ssn');

  const handleSaveNewRole = () => {
    const trimmedRole = newRoleValue.trim();
    if (trimmedRole) {
        if (!jobRoles.includes(trimmedRole)) onAddJobRole(trimmedRole);
        setFormData(prev => ({ ...prev, job: trimmedRole}));
        setIsAddingNewRole(false);
        setNewRoleValue('');
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const finalFormData = { ...formData };
    if (phone1NotApplicable || !finalFormData.phone1.trim()) finalFormData.phone1 = 'N/A';
    if (!finalFormData.overtimeRate) finalFormData.overtimeRate = '0';
    
    onSave(finalFormData, editingEmployee?.id);
  };
  
  const handleDelete = () => { 
      if (editingEmployee) {
          confirm({
              title: 'Confirm Employee Deletion',
              message: `Are you sure you want to move ${editingEmployee.name} to the trash?`,
              onConfirm: () => {
                  deleteEmployee([editingEmployee.id]);
                  onCancel();
              },
          });
      }
  };

  const isFormValid = formData.name && formData.job && formData.hourlyRate;

  return (
    <>
    {isCameraOpen && <CameraModal onCapture={(imageSrc) => { setFormData(prev => ({ ...prev, photoUrl: imageSrc })); setIsCameraOpen(false); }} onClose={() => setIsCameraOpen(false)} />}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b dark:border-gray-700"><div className="space-y-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('jobStatus')}</label><div className="flex items-center gap-4"><button type="button" onClick={() => setFormData(p => ({...p, isActive: true}))} className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 transition-all ${formData.isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-emerald-500'}`}>{t('active')}</button><button type="button" onClick={() => setFormData(p => ({...p, isActive: false}))} className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 transition-all ${!formData.isActive ? 'bg-gray-500 text-white border-gray-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-500'}`}>{t('inactive')}</button></div></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <InputField id="name" name="name" label={t('fullName')} value={formData.name} onChange={handleChange} required placeholder="e.g., John Doe" icon={<UserIcon className="w-5 h-5" />} />
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 bg-white dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded-lg">
                <option value="Labor">Labor</option>
                <option value="Foreman">Foreman</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Owner">Owner</option>
            </select>
        </div>
        <div><InputField id="phone1" name="phone1" label={t('phone1')} value={formData.phone1} onChange={handleChange} type="tel" icon={<PhoneIcon className="w-5 h-5" />} disabled={phone1NotApplicable} /><div className="flex items-center pt-1"><input id="phone1-na" type="checkbox" checked={phone1NotApplicable} onChange={handlePhone1Checkbox} className="h-4 w-4" /><label htmlFor="phone1-na" className="ml-2 text-sm dark:text-gray-300">{t('notApplicable')}</label></div></div>
        <InputField id="phone2" name="phone2" label={t('phone2')} optional value={formData.phone2} onChange={handleChange} type="tel" icon={<PhoneIcon className="w-5 h-5" />} />
        <div className="space-y-2 md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('employeePhoto')} <span className="text-gray-400 font-normal">({t('optional')})</span></label><div className={`transition-opacity ${photoNotApplicable ? 'opacity-50' : ''}`}><div className="flex items-center gap-4"><div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 border-2 dark:border-gray-600 overflow-hidden">{formData.photoUrl && !photoNotApplicable ? <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400" />}{formData.photoUrl && !photoNotApplicable && <button type="button" onClick={() => setFormData(p => ({...p, photoUrl: ''}))} className="absolute top-0 right-0 p-0.5 bg-white/70 dark:bg-gray-800/70 rounded-full hover:bg-rose-500"><XCircleIcon className="w-5 h-5" /></button>}</div><div className="flex flex-col sm:flex-row gap-3"><input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={photoNotApplicable} /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={photoNotApplicable} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg disabled:opacity-50"><UploadIcon className="w-5 h-5" /><span>{t('upload')}</span></button><button type="button" onClick={() => setIsCameraOpen(true)} disabled={photoNotApplicable} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg disabled:opacity-50"><CameraIcon className="w-5 h-5" /><span>{t('camera')}</span></button></div></div></div><div className="flex items-center pt-1"><input id="photo-na" type="checkbox" checked={photoNotApplicable} onChange={handlePhotoCheckbox} className="h-4 w-4" /><label htmlFor="photo-na" className="ml-2 text-sm dark:text-gray-300">{t('notApplicable')}</label></div></div>
        <div className="space-y-2"><label htmlFor="job" className="text-sm font-medium dark:text-gray-300">{t('jobTitle')}</label>{isAddingNewRole ? <div className="flex gap-2"><input ref={newRoleInputRef} type="text" value={newRoleValue} onChange={(e) => setNewRoleValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewRole(); } }} className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('enterNewJob')} /><button type="button" onClick={handleSaveNewRole} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">{t('save')}</button><button type="button" onClick={() => setIsAddingNewRole(false)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button></div> : <select name="job" id="job" value={formData.job} onChange={handleChange} required className="w-full p-3 bg-white dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded-lg appearance-none" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}><option value="" disabled>{t('selectJob')}</option>{jobRoles.map(o => <option key={o} value={o}>{o}</option>)}<option value="_addNew_" className="text-blue-600 font-semibold">{t('addNewJob')}</option></select>}</div>
        <div className="space-y-2"><InputField id="ssn" name="ssn" label={t('socialSecurity')} optional value={formData.ssn} onChange={handleChange} icon={<IdCardIcon className="w-5 h-5" />} disabled={ssnNotApplicable} /><div className="flex items-center pt-1"><input id="ssn-na" type="checkbox" checked={ssnNotApplicable} onChange={handleSsnCheckbox} className="h-4 w-4" /><label htmlFor="ssn-na" className="ml-2 text-sm dark:text-gray-300">{t('notApplicable')}</label></div></div>
        <InputField id="hourlyRate" name="hourlyRate" label={t('hourlyPay')} value={formData.hourlyRate} onChange={handleChange} required type="number" min="0" step="0.01" icon={<DollarSignIcon className="w-5 h-5" />} />
        <div className="space-y-2"><InputField id="overtimeRate" name="overtimeRate" label={t('overtimePayLabel')} optional value={overtimeNotApplicable ? '0' : formData.overtimeRate} onChange={handleChange} type="number" min="0" step="0.01" icon={<DollarSignIcon className="w-5 h-5" />} disabled={overtimeNotApplicable} /><div className="flex items-center pt-1"><input id="overtime-na" type="checkbox" checked={overtimeNotApplicable} onChange={handleOvertimeCheckbox} className="h-4 w-4" /><label htmlFor="overtime-na" className="ml-2 text-sm dark:text-gray-300">{t('notApplicable')}</label></div></div>
        
        <div className="md:col-span-2 space-y-4 pt-4 mt-4 border-t dark:border-gray-700">
            <h3 className="text-md font-semibold dark:text-gray-300">{t('employeeDocs')}</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {formData.documents?.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                        <div className="flex items-center gap-3">
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="truncate">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{doc.name}</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.type}{doc.expirationDate ? ` - Expires: ${doc.expirationDate}`: ''}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="p-1 rounded-full text-gray-400 hover:bg-rose-100 flex-shrink-0"><XCircleIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">{t('docType')}</label>
                        <select value={newDocDetails.type} onChange={e => setNewDocDetails(p => ({...p, type: e.target.value as any}))} className="w-full p-2 border dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700 dark:text-white">
                            <option value="certification">{t('certification')}</option>
                            <option value="license">{t('license')}</option>
                            <option value="insurance">{t('insurance')}</option>
                            <option value="w9">{t('w9')}</option>
                            <option value="other">{t('other')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">{t('expirationOptional')}</label>
                        <input type="date" value={newDocDetails.expirationDate || ''} onChange={e => setNewDocDetails(p => ({...p, expirationDate: e.target.value}))} className="w-full p-2 border dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                <button type="button" onClick={() => docFileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500">
                    <PaperclipIcon className="w-5 h-5" />
                    <span>{t('attachDocument')}</span>
                </button>
            </div>
            <input id="document-upload" type="file" ref={docFileInputRef} className="hidden" onChange={handleDocumentUpload} />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t dark:border-gray-700"><h3 className="text-lg font-semibold dark:text-gray-200">{t('detailedRating')}</h3><div className="space-y-4"><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(Object.keys(formData.rating) as Array<keyof EmployeeRating>).filter(k => k !== 'specialty').map(key => (
            <RatingInput key={key} label={RATING_LABELS[key]} value={formData.rating[key]} onRate={(v) => setFormData(p => ({...p, rating: {...p.rating, [key]: v}}))} />
        ))}
      </div><div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg"><InputField id="specialtyDescription" name="specialtyDescription" label={t('specialtyArea')} value={formData.specialtyDescription} onChange={handleChange} placeholder={t('specialtyPlaceholder')} icon={<StarIcon className="w-5 h-5" />} optional /><RatingInput label={t('rateSpecialty')} value={formData.rating.specialty} onRate={(v) => setFormData(p => ({...p, rating: {...p.rating, specialty: v}}))} /></div></div></div>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* FIX: Use glass-button classes for consistent styling */}
          <button type="submit" disabled={!isFormValid || isAddingNewRole} className="glass-button">{editingEmployee ? t('saveChanges_btn') : t('addEmployee_btn')}</button>
          <button type="button" onClick={onCancel} className="glass-button-secondary">{t('cancel')}</button>
        </div>
        {/* FIX: Use glass-button-destructive for consistent styling */}
        {editingEmployee && <button type="button" onClick={handleDelete} className="glass-button-destructive"><TrashIcon className="w-5 h-5" />{t('moveToTrash')}</button>}
      </div>
    </form>
    </>
  );
};
export default EmployeeForm;