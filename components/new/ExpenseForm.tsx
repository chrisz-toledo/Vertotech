

import React, { useState, useEffect, useRef } from 'react';
import type { Expense, Jobsite, Employee } from '../../types';
import * as geminiService from '../../services/geminiService';
import { CreditCardIcon } from '../icons/new/CreditCardIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { UserIcon } from '../icons/UserIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';

interface ExpenseFormProps {
    onSave: (expenseData: Omit<Expense, 'id' | 'deletedAt'> | Expense) => void;
    onCancel: () => void;
    editingExpense: Expense | null;
    jobsites: Jobsite[];
    employees: Employee[];
    expenseCategories: string[];
    onAddCategory: (category: string) => void;
    prefillData?: { jobsiteId?: string, employeeId?: string };
}

const initialFormState: Omit<Expense, 'id' | 'deletedAt'> = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    vendor: '',
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

const ExpenseForm: React.FC<ExpenseFormProps> = (props) => {
    const { onSave, onCancel, editingExpense, jobsites, employees, expenseCategories, onAddCategory, prefillData } = props;
    const [formData, setFormData] = useState<Omit<Expense, 'id' | 'deletedAt'> | Expense>(editingExpense || initialFormState);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const cooldownTimerRef = useRef<number | null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const receiptFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingExpense) {
            setFormData(editingExpense);
        } else {
            setFormData({ ...initialFormState, ...(prefillData || {}) });
        }
    }, [editingExpense, prefillData]);

    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === "category" && value === "_addNew_") {
            setIsAddingCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
            return;
        }

        if (name === "associationType") {
             setFormData(prev => {
                const newState = { ...prev };
                delete newState.jobsiteId;
                delete newState.employeeId;
                if (value === "jobsite") newState.jobsiteId = jobsites[0]?.id || '';
                if (value === "employee") newState.employeeId = employees[0]?.id || '';
                return newState;
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setFormData(prev => ({ ...prev, category: newCategory.trim() }));
            setNewCategory('');
            setIsAddingCategory(false);
        }
    };
    
    const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setIsCooldown(true);
        try {
            const imageForApi = await readFileAsBase64(file);
            const analysis = await geminiService.analyzeExpenseReceipt(imageForApi);
            const objectUrl = URL.createObjectURL(file);

            setFormData(prev => ({
                ...prev,
                ...analysis,
                receiptImage: { mimeType: file.type, objectUrl, name: file.name },
            }));
        } catch (error) {
            console.error(error);
            alert("No se pudo analizar el recibo. Por favor, introduzca los datos manualmente.");
        } finally {
            setIsAnalyzing(false);
            cooldownTimerRef.current = window.setTimeout(() => setIsCooldown(false), 5000);
            if(receiptFileRef.current) receiptFileRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.description && formData.amount > 0 && formData.date && formData.category;
    const associationType = formData.jobsiteId ? 'jobsite' : formData.employeeId ? 'employee' : 'general';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="file" ref={receiptFileRef} onChange={handleReceiptFileChange} accept="image/*" className="hidden"/>
            <div className="flex justify-end">
                 <button type="button" onClick={() => receiptFileRef.current?.click()} disabled={isAnalyzing || isCooldown} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-violet-400">
                    <SparklesIcon className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analizando...' : (isCooldown ? 'Espere...' : 'Analizar Recibo con IA')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><FileTextIcon className="w-5 h-5"/></span><input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><DollarSignIcon className="w-5 h-5"/></span><input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><CalendarIcon className="w-5 h-5"/></span><input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                    {isAddingCategory ? (
                        <div className="flex gap-2">
                            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Nueva categoría"/>
                            <button type="button" onClick={handleAddCategory} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">OK</button>
                        </div>
                    ) : (
                        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span><select id="category" name="category" value={formData.category} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="" disabled>Seleccione una categoría</option>{expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}<option value="_addNew_">+ Añadir Nueva</option></select></div>
                    )}
                </div>
                <div>
                    <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proveedor (Opcional)</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><BuildingIcon className="w-5 h-5"/></span><input type="text" id="vendor" name="vendor" value={formData.vendor || ''} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <label htmlFor="associationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asociar Gasto A (Opcional)</label>
                    <select id="associationType" name="associationType" value={associationType} onChange={handleChange} className="w-full p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white">
                        <option value="general">Gasto General</option>
                        <option value="jobsite">Sitio de Trabajo</option>
                        <option value="employee">Empleado</option>
                    </select>
                </div>

                {associationType === 'jobsite' && (
                    <div className="md:col-span-2">
                        <label htmlFor="jobsiteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sitio de Trabajo</label>
                        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><LocationMarkerIcon className="w-5 h-5"/></span><select id="jobsiteId" name="jobsiteId" value={formData.jobsiteId} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white" disabled={jobsites.length === 0}>{jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}</select></div>
                    </div>
                )}
                {associationType === 'employee' && (
                     <div className="md:col-span-2">
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Empleado</label>
                        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><UserIcon className="w-5 h-5"/></span><select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white" disabled={employees.length === 0}>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    </div>
                )}

            </div>
             <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingExpense ? 'Guardar Cambios' : 'Añadir Gasto'}</button>
            </div>
        </form>
    );
};

export default ExpenseForm;