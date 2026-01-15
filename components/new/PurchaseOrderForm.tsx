
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import type { PurchaseOrder, PurchaseOrderLineItem, Jobsite, Payable, Supplier } from '../../types';
import { BuildingIcon } from '../icons/BuildingIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { ReceiptIcon } from '../icons/new/ReceiptIcon';

interface PurchaseOrderFormProps {
    onSave: (poData: Omit<PurchaseOrder, 'id' | 'deletedAt' | 'poNumber'> | PurchaseOrder) => void;
    onCancel: () => void;
    editingPO: PurchaseOrder | null;
    jobsites: Jobsite[];
    onCreatePayable: (payableData: Omit<Payable, 'id' | 'deletedAt'>) => void;
    suppliers: Supplier[];
}

const initialFormState: Omit<PurchaseOrder, 'id' | 'deletedAt' | 'poNumber'> = {
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    lineItems: [{ id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    notes: '',
};

const PurchaseOrderForm = forwardRef((props: PurchaseOrderFormProps, ref) => {
    const { onSave, onCancel, editingPO, jobsites, onCreatePayable, suppliers } = props;
    const [formData, setFormData] = useState<Omit<PurchaseOrder, 'id' | 'deletedAt' | 'poNumber'> | PurchaseOrder>(editingPO || initialFormState);
    const formElementRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
        getFormData: () => formData,
        getFormElement: () => formElementRef.current,
    }));

    useEffect(() => {
        if (editingPO) {
            setFormData(editingPO);
        } else {
            setFormData({ ...initialFormState, supplierId: suppliers[0]?.id || '' });
        }
    }, [editingPO, suppliers]);

    useEffect(() => {
        const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal + formData.tax;
        setFormData(prev => ({ ...prev, subtotal, total }));
    }, [formData.lineItems, formData.tax]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'tax' ? parseFloat(value) || 0 : value }));
    };

    const handleLineItemChange = (index: number, field: keyof PurchaseOrderLineItem, value: string | number) => {
        setFormData(prev => {
            const newItems = [...prev.lineItems];
            const item = { ...newItems[index] };
            (item as any)[field] = value;

            if (field === 'quantity' || field === 'unitPrice') {
                item.total = (item.quantity || 0) * (item.unitPrice || 0);
            }
            newItems[index] = item;
            return { ...prev, lineItems: newItems };
        });
    };

    const addLineItem = () => {
        setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, { id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }]}));
    };

    const removeLineItem = (index: number) => {
        setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
    };

    const handleCreatePayable = () => {
        const newPayable: Omit<Payable, 'id' | 'deletedAt'> = {
            supplierId: formData.supplierId,
            invoiceNumber: '',
            description: `Based on Purchase Order ${'poNumber' in formData ? formData.poNumber : 'N/A'}`,
            amountDue: formData.total,
            amountPaid: 0,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'unpaid',
            category: 'Proveedor de Materiales'
        };
        onCreatePayable(newPayable);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.supplierId && formData.lineItems.length > 0 && formData.lineItems.every(li => li.description && li.quantity > 0 && li.unitPrice >= 0);

    return (
        <form ref={formElementRef} onSubmit={handleSubmit} className="space-y-6 printable-area">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="supplierId" className="block text-sm font-medium mb-2">Proveedor</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><BuildingIcon className="w-5 h-5"/></span>
                        <select id="supplierId" name="supplierId" value={formData.supplierId} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white" disabled={!!editingPO && 'payableId' in editingPO && !!editingPO.payableId}>
                            <option value="" disabled>Seleccione un proveedor</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-2">Fecha</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><CalendarIcon className="w-5 h-5"/></span><input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="jobsiteId" className="block text-sm font-medium mb-2">Sitio de Trabajo (Opcional)</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><LocationMarkerIcon className="w-5 h-5"/></span><select id="jobsiteId" name="jobsiteId" value={formData.jobsiteId || ''} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="">Ninguno</option>{jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}</select></div>
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2">Estado</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span><select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="draft">Borrador</option><option value="sent">Enviada</option><option value="partially_received">Recibido Parcial</option><option value="received">Recibida</option><option value="cancelled">Cancelada</option></select></div>
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium">Artículos</label>
                <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase"><tr className="text-left"><th className="p-2">Descripción</th><th className="p-2 w-24">Cant.</th><th className="p-2 w-32">Precio Unit.</th><th className="p-2 w-32">Total</th><th className="p-2 w-12"></th></tr></thead>
                        <tbody>
                            {formData.lineItems.map((item, index) => (
                                <tr key={item.id} className="border-t dark:border-gray-700">
                                    <td className="p-1"><input type="text" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required /></td>
                                    <td className="p-1"><input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-full p-2 border dark:border-gray-600 rounded text-right bg-white dark:bg-gray-700 dark:text-white" min="0" /></td>
                                    <td className="p-1"><input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full p-2 border dark:border-gray-600 rounded text-right bg-white dark:bg-gray-700 dark:text-white" min="0" step="0.01" /></td>
                                    <td className="p-1"><input type="text" value={formatCurrency(item.total)} readOnly className="w-full p-2 border-0 bg-gray-50 dark:bg-gray-800 rounded text-right font-medium" /></td>
                                    <td className="p-1 text-center"><button type="button" onClick={() => removeLineItem(index)} className="p-1 text-gray-400 hover:text-rose-600"><TrashIcon className="w-5 h-5"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button type="button" onClick={addLineItem} className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">+ Añadir Artículo</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">Notas (Opcional)</label>
                    <div className="relative"><span className="absolute top-3.5 left-0 pl-3.5 text-gray-400"><FileTextIcon className="w-5 h-5"/></span><textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"></textarea></div>
                </div>
                <div className="space-y-3 pt-4">
                    <div className="flex justify-between text-md"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">{formatCurrency(formData.subtotal)}</span></div>
                    <div className="flex justify-between items-center text-md"><span className="text-gray-600">Impuestos:</span><input type="number" name="tax" value={formData.tax} onChange={handleChange} className="w-24 p-1 border dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 dark:text-white" min="0" step="0.01" /></div>
                    <div className="flex justify-between text-2xl font-bold pt-2 border-t mt-2"><span>Total:</span><span>{formatCurrency(formData.total)}</span></div>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-6 border-t no-print">
                <div>
                    {formData.status === 'received' && (
                        <button type="button" onClick={handleCreatePayable} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700">
                            <ReceiptIcon className="w-5 h-5" />
                            Crear Cuenta por Pagar
                        </button>
                    )}
                </div>
                <div className="flex gap-4">
                    <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingPO ? 'Guardar Cambios' : 'Crear OC'}</button>
                </div>
            </div>
        </form>
    );
});

export default PurchaseOrderForm;