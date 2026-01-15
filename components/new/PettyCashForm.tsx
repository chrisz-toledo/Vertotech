
import React, { useState, useEffect, useRef } from 'react';
import type { PettyCashTransaction, Employee } from '../../types';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { UserIcon } from '../icons/UserIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';

interface PettyCashFormProps {
    onSave: (transactionData: Omit<PettyCashTransaction, 'id' | 'deletedAt'> | PettyCashTransaction) => void;
    onCancel: () => void;
    editingTransaction: PettyCashTransaction | null;
    employees: Employee[];
    categories: string[];
    onAddCategory: (category: string) => void;
}

const initialFormState: Omit<PettyCashTransaction, 'id' | 'deletedAt'> = {
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
};

// FIX: Replaced readFileAsBase64 with readFileAsObjectUrl to align with the Document type definition.
const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};


const PettyCashForm: React.FC<PettyCashFormProps> = ({ onSave, onCancel, editingTransaction, employees, categories, onAddCategory }) => {
    const [formData, setFormData] = useState<Omit<PettyCashTransaction, 'id' | 'deletedAt'> | PettyCashTransaction>(editingTransaction || initialFormState);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const receiptFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(editingTransaction || initialFormState);
    }, [editingTransaction]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === "category" && value === "_addNew_") {
            setIsAddingCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
            return;
        }

        if (name === "type" && value === "income") {
            setFormData(prev => {
                const newState: any = { ...prev, type: 'income' };
                delete newState.category;
                delete newState.employeeId;
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

    // FIX: Use readFileAsObjectUrl and construct the receiptImage object correctly.
    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const receipt = readFileAsObjectUrl(file);
                setFormData(prev => ({ ...prev, receiptImage: receipt }));
            } catch (error) {
                console.error("Error uploading receipt:", error);
                alert("No se pudo cargar el archivo.");
            }
        }
        if(receiptFileRef.current) receiptFileRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.description && formData.amount > 0 && formData.date && (formData.type === 'income' || (formData.type === 'expense' && formData.category));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="file" ref={receiptFileRef} onChange={handleReceiptUpload} className="hidden" accept="image/*"/>
            <div className="space-y-2 pb-4 border-b dark:border-gray-700">
                <label className="text-sm font-medium">Tipo de Transacción</label>
                <div className="flex gap-4">
                    <button type="button" onClick={() => handleChange({ target: { name: 'type', value: 'expense' } } as any)} className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 ${formData.type === 'expense' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-rose-500'}`}>Gasto</button>
                    <button type="button" onClick={() => handleChange({ target: { name: 'type', value: 'income' } } as any)} className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 ${formData.type === 'income' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-500'}`}>Ingreso</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium mb-2">Descripción</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><FileTextIcon className="w-5 h-5"/></span><input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-2">Monto</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><DollarSignIcon className="w-5 h-5"/></span><input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-2">Fecha</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><CalendarIcon className="w-5 h-5"/></span><input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>

                {formData.type === 'expense' && (
                    <>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">Categoría</label>
                        {isAddingCategory ? (
                            <div className="flex gap-2">
                                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Nueva categoría"/>
                                <button type="button" onClick={handleAddCategory} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">OK</button>
                            </div>
                        ) : (
                            <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span><select id="category" name="category" value={formData.category || ''} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="" disabled>Seleccione</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}<option value="_addNew_">+ Añadir Nueva</option></select></div>
                        )}
                    </div>
                     <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium mb-2">Empleado (Opcional)</label>
                        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><UserIcon className="w-5 h-5"/></span><select id="employeeId" name="employeeId" value={formData.employeeId || ''} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="">Ninguno</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Adjuntar Recibo (Opcional)</label>
                        <button type="button" onClick={() => receiptFileRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500">
                            <PaperclipIcon className="w-5 h-5" />
                            <span>{formData.receiptImage ? `Archivo adjunto` : 'Seleccionar archivo...'}</span>
                        </button>
                    </div>
                    </>
                )}
            </div>
             <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingTransaction ? 'Guardar Cambios' : 'Añadir Transacción'}</button>
            </div>
        </form>
    );
};

export default PettyCashForm;