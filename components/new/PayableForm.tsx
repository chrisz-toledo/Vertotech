
import React, { useState, useEffect, useRef } from 'react';
import type { Payable, Supplier, PurchaseOrder } from '../../types';
import { BuildingIcon } from '../icons/BuildingIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';
import { HashIcon } from '../icons/new/HashIcon';

interface PayableFormProps {
    onSave: (payableData: Omit<Payable, 'id' | 'deletedAt'> | Payable) => void;
    onCancel: () => void;
    editingPayable: Payable | null;
    categories: string[];
    onAddCategory: (category: string) => void;
    suppliers: Supplier[];
    prefillData?: { fromPO?: PurchaseOrder };
}

const initialFormState: Omit<Payable, 'id' | 'deletedAt'> = {
    supplierId: '',
    invoiceNumber: '',
    description: '',
    amountDue: 0,
    amountPaid: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'unpaid',
    category: '',
    purchaseOrderId: undefined,
};

// FIX: Replaced readFileAsBase64 with readFileAsObjectUrl to align with the Document type definition.
const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

const PayableForm: React.FC<PayableFormProps> = ({ onSave, onCancel, editingPayable, categories, onAddCategory, suppliers, prefillData }) => {
    const [formData, setFormData] = useState<Omit<Payable, 'id' | 'deletedAt'> | Payable>(initialFormState);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const docFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingPayable) {
            setFormData(editingPayable);
        } else if (prefillData?.fromPO) {
            const po = prefillData.fromPO;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            setFormData({
                ...initialFormState,
                supplierId: po.supplierId,
                description: `Factura para Orden de Compra #${po.poNumber}`,
                amountDue: po.total,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                category: categories.find(c => c.toLowerCase().includes('material')) || categories[0] || '',
                purchaseOrderId: po.id,
            });
        } else {
            const initialStateWithSupplier = { ...initialFormState, supplierId: suppliers[0]?.id || '' };
            setFormData(initialStateWithSupplier);
        }
    }, [editingPayable, suppliers, prefillData, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "category" && value === "_addNew_") {
            setIsAddingCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
            return;
        }

        const newFormData: any = { ...formData, [name]: (name === 'amountDue' || name === 'amountPaid') ? parseFloat(value) || 0 : value };
        
        if (name === 'amountDue' || name === 'amountPaid') {
            const due = name === 'amountDue' ? parseFloat(value) || 0 : newFormData.amountDue;
            const paid = name === 'amountPaid' ? parseFloat(value) || 0 : newFormData.amountPaid;

            if (paid <= 0) newFormData.status = 'unpaid';
            else if (paid >= due) newFormData.status = 'paid';
            else newFormData.status = 'partially_paid';
        }

        setFormData(newFormData);
    };
    
    const handleAddCategory = () => {
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setFormData(prev => ({ ...prev, category: newCategory.trim() }));
            setNewCategory('');
            setIsAddingCategory(false);
        }
    };

    // FIX: Use readFileAsObjectUrl and construct the Document object correctly.
    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const doc = readFileAsObjectUrl(file);
                setFormData(prev => ({ ...prev, document: doc }));
            } catch (error) {
                console.error("Error uploading document:", error);
                alert("No se pudo cargar el archivo.");
            }
        }
        if(docFileRef.current) docFileRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.supplierId && formData.description && formData.amountDue > 0 && formData.dueDate && formData.category;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="file" ref={docFileRef} onChange={handleDocumentUpload} className="hidden" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="supplierId" className="block text-sm font-medium mb-2">Proveedor</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><BuildingIcon className="w-5 h-5"/></span>
                        <select id="supplierId" name="supplierId" value={formData.supplierId || ''} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white" disabled={!!prefillData?.fromPO}>
                            <option value="" disabled>Seleccione un proveedor</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-2"># de Factura (Opcional)</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><HashIcon className="w-5 h-5"/></span><input type="text" id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">Categoría</label>
                    {isAddingCategory ? (
                        <div className="flex gap-2">
                            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Nueva categoría"/>
                            <button type="button" onClick={handleAddCategory} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">OK</button>
                        </div>
                    ) : (
                        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span><select id="category" name="category" value={formData.category} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="" disabled>Seleccione una categoría</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}<option value="_addNew_">+ Añadir Nueva</option></select></div>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium mb-2">Descripción</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><FileTextIcon className="w-5 h-5"/></span><textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={2} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div>
                    <label htmlFor="amountDue" className="block text-sm font-medium mb-2">Monto Adeudado</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><DollarSignIcon className="w-5 h-5"/></span><input type="number" id="amountDue" name="amountDue" value={formData.amountDue} onChange={handleChange} required min="0.01" step="0.01" className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" readOnly={!!prefillData?.fromPO} /></div>
                </div>
                 <div>
                    <label htmlFor="amountPaid" className="block text-sm font-medium mb-2">Monto Pagado</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><DollarSignIcon className="w-5 h-5"/></span><input type="number" id="amountPaid" name="amountPaid" value={formData.amountPaid} onChange={handleChange} required min="0" step="0.01" className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium mb-2">Fecha de Emisión</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><CalendarIcon className="w-5 h-5"/></span><input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><CalendarIcon className="w-5 h-5"/></span><input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Adjuntar Factura (Opcional)</label>
                    <button type="button" onClick={() => docFileRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500">
                        <PaperclipIcon className="w-5 h-5" />
                        <span>{formData.document ? `Archivo adjunto: ${formData.document.name}` : 'Seleccionar archivo...'}</span>
                    </button>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingPayable ? 'Guardar Cambios' : 'Añadir Cuenta'}</button>
            </div>
        </form>
    );
};

export default PayableForm;