import React, { useState, useEffect } from 'react';
import type { Tool, Employee, Jobsite, ToolStatus, ToolAssignment, MaintenanceDetails } from '../../types';
import { ToolboxIconSimple } from '../icons/new/ToolboxIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { HashIcon } from '../icons/new/HashIcon';
import { UserIcon } from '../icons/UserIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { BuildingIcon } from '../icons/BuildingIcon';

interface ToolFormProps {
    onSave: (toolData: Omit<Tool, 'id' | 'deletedAt'> | Tool) => void;
    onCancel: () => void;
    editingTool: Tool | null;
    employees: Employee[];
    jobsites: Jobsite[];
}

const initialFormState: Omit<Tool, 'id' | 'deletedAt'> = {
    name: '',
    type: '',
    status: 'available',
    assignment: { type: 'unassigned' },
    purchaseDate: new Date().toISOString().split('T')[0],
    value: 0,
    serialNumber: '',
};

const InputField: React.FC<any> = ({ id, label, icon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">{icon}</span>
            <input id={id} {...props} className="w-full pl-11 p-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
    </div>
);

const ToolForm: React.FC<ToolFormProps> = ({ onSave, onCancel, editingTool, employees, jobsites }) => {
    const [formData, setFormData] = useState<Omit<Tool, 'id' | 'deletedAt'> | Tool>(editingTool || initialFormState);

    useEffect(() => {
        setFormData(editingTool || initialFormState);
    }, [editingTool]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'value' || name === 'cost' ? parseFloat(value) || 0 : value }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as ToolStatus;
        setFormData(prev => {
            const newState = { ...prev, status: newStatus };
            if (newStatus !== 'in_maintenance') {
                delete newState.maintenanceDetails;
            } else {
                 newState.maintenanceDetails = newState.maintenanceDetails || { startDate: new Date().toISOString().split('T')[0], estimatedReturnDate: '', shopName: '' };
            }
            if (newStatus !== 'in_use') {
                newState.assignment = { type: 'unassigned' };
            }
            return newState;
        });
    };
    
    const handleAssignmentTypeChange = (type: ToolAssignment['type']) => {
        const assignedAt = new Date().toISOString();
        if (type === 'employee') {
            setFormData(prev => ({ ...prev, assignment: { type: 'employee', employeeId: '', assignedAt } }));
        } else if (type === 'jobsite') {
            setFormData(prev => ({ ...prev, assignment: { type: 'jobsite', jobsiteId: jobsites[0]?.id || '', assignedAt } }));
        } else if (type === 'warehouse') {
            setFormData(prev => ({ ...prev, assignment: { type: 'warehouse', warehouseName: '', assignedAt } }));
        } else {
            setFormData(prev => ({ ...prev, assignment: { type: 'unassigned' } }));
        }
    };
    
    const handleAssignmentDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (prev.assignment.type !== 'unassigned') {
                 return { ...prev, assignment: { ...prev.assignment, [name]: value, assignedAt: new Date().toISOString() } as any };
            }
            return prev;
        });
    };
    
    const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            maintenanceDetails: {
                ...(prev.maintenanceDetails || {} as MaintenanceDetails),
                [name]: name === 'cost' ? parseFloat(value) || 0 : value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.name && formData.type && formData.purchaseDate && formData.value >= 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><InputField id="name" name="name" label="Nombre de la Herramienta" value={formData.name} onChange={handleChange} required icon={<ToolboxIconSimple className="w-5 h-5"/>} /></div>
                <div><InputField id="type" name="type" label="Tipo" value={formData.type} onChange={handleChange} required placeholder="Ej: Herramienta Eléctrica" icon={<BriefcaseIcon className="w-5 h-5"/>} /></div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span><select id="status" name="status" value={formData.status} onChange={handleStatusChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="available">Disponible</option><option value="in_use">En Uso</option><option value="in_maintenance">Mantenimiento</option><option value="broken">Dañada</option></select></div>
                </div>
                <div><InputField type="date" id="purchaseDate" name="purchaseDate" label="Fecha de Compra" value={formData.purchaseDate} onChange={handleChange} required icon={<CalendarIcon className="w-5 h-5"/>} /></div>
                <div><InputField type="number" id="value" name="value" label="Valor ($)" value={formData.value} onChange={handleChange} required min="0" step="0.01" icon={<DollarSignIcon className="w-5 h-5"/>} /></div>
                <div className="md:col-span-2"><InputField id="serialNumber" name="serialNumber" label="Número de Serie (Opcional)" value={formData.serialNumber || ''} onChange={handleChange} icon={<HashIcon className="w-5 h-5"/>} /></div>
            </div>

            {formData.status === 'in_use' && (
                <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold">Asignación</h3>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Asignación</label>
                        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
                            <button type="button" onClick={() => handleAssignmentTypeChange('unassigned')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${formData.assignment.type === 'unassigned' ? 'bg-white shadow' : ''}`}>No Asignada</button>
                            <button type="button" onClick={() => handleAssignmentTypeChange('employee')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${formData.assignment.type === 'employee' ? 'bg-white shadow' : ''}`}>Empleado</button>
                            <button type="button" onClick={() => handleAssignmentTypeChange('jobsite')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${formData.assignment.type === 'jobsite' ? 'bg-white shadow' : ''}`}>Sitio</button>
                            <button type="button" onClick={() => handleAssignmentTypeChange('warehouse')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${formData.assignment.type === 'warehouse' ? 'bg-white shadow' : ''}`}>Bodega</button>
                        </div>
                    </div>
                    {formData.assignment.type === 'employee' && (
                         <div><label htmlFor="employeeId" className="block text-sm font-medium mb-2">Empleado</label><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><UserIcon className="w-5 h-5"/></span><select id="employeeId" name="employeeId" value={formData.assignment.employeeId} onChange={handleAssignmentDetailChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="" disabled>Seleccione empleado</option>{employees.filter(e => e.isActive).map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}</select></div></div>
                    )}
                    {formData.assignment.type === 'jobsite' && (
                        <div><label htmlFor="jobsiteId" className="block text-sm font-medium mb-2">Sitio de Trabajo</label><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><LocationMarkerIcon className="w-5 h-5"/></span><select id="jobsiteId" name="jobsiteId" value={formData.assignment.jobsiteId} onChange={handleAssignmentDetailChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white"><option value="" disabled>Seleccione sitio</option>{jobsites.map(j => (<option key={j.id} value={j.id}>{j.address}</option>))}</select></div></div>
                    )}
                     {formData.assignment.type === 'warehouse' && (
                        <InputField id="warehouseName" name="warehouseName" label="Nombre de Bodega" value={formData.assignment.warehouseName} onChange={handleAssignmentDetailChange} icon={<BuildingIcon className="w-5 h-5"/>} />
                    )}
                </div>
            )}
            
            {formData.status === 'in_maintenance' && (
                 <div className="space-y-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold">Detalles de Mantenimiento</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField type="date" id="startDate" name="startDate" label="Fecha de Inicio" value={formData.maintenanceDetails?.startDate || ''} onChange={handleMaintenanceChange} icon={<CalendarIcon className="w-5 h-5"/>} />
                        <InputField type="date" id="estimatedReturnDate" name="estimatedReturnDate" label="Fecha de Retorno Estimada" value={formData.maintenanceDetails?.estimatedReturnDate || ''} onChange={handleMaintenanceChange} icon={<CalendarIcon className="w-5 h-5"/>} />
                        <InputField id="shopName" name="shopName" label="Taller de Reparación" value={formData.maintenanceDetails?.shopName || ''} onChange={handleMaintenanceChange} icon={<BuildingIcon className="w-5 h-5"/>} />
                        <InputField id="cost" name="cost" label="Costo de Reparación ($)" type="number" min="0" value={formData.maintenanceDetails?.cost || ''} onChange={handleMaintenanceChange} icon={<DollarSignIcon className="w-5 h-5"/>} />
                        <InputField id="requestedBy" name="requestedBy" label="Solicitado Por" value={formData.maintenanceDetails?.requestedBy || ''} onChange={handleMaintenanceChange} icon={<UserIcon className="w-5 h-5"/>} />
                        <InputField id="sentBy" name="sentBy" label="Enviado Por" value={formData.maintenanceDetails?.sentBy || ''} onChange={handleMaintenanceChange} icon={<UserIcon className="w-5 h-5"/>} />
                        <InputField id="shopAddress" name="shopAddress" label="Dirección del Taller" value={formData.maintenanceDetails?.shopAddress || ''} onChange={handleMaintenanceChange} icon={<LocationMarkerIcon className="w-5 h-5"/>} />
                        <InputField id="shopContact" name="shopContact" label="Contacto del Taller" value={formData.maintenanceDetails?.shopContact || ''} onChange={handleMaintenanceChange} icon={<UserIcon className="w-5 h-5"/>} />
                        <InputField id="trackingNumber" name="trackingNumber" label="Número de Seguimiento" value={formData.maintenanceDetails?.trackingNumber || ''} onChange={handleMaintenanceChange} icon={<HashIcon className="w-5 h-5"/>} />
                        <InputField id="pickupInfo" name="pickupInfo" label="Información de Recogida" value={formData.maintenanceDetails?.pickupInfo || ''} onChange={handleMaintenanceChange} icon={<UserIcon className="w-5 h-5"/>} />
                    </div>
                 </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingTool ? 'Guardar Cambios' : 'Añadir Herramienta'}</button>
            </div>
        </form>
    );
};

export default ToolForm;