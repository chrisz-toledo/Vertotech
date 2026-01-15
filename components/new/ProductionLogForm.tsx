import React, { useState, useEffect } from 'react';
import type { ProductionLog, Jobsite, Employee, Subcontractor, ProductivityTask } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { useAppStore } from '../../hooks/stores/useAppStore';

interface ProductionLogFormProps {
    onSave: (logData: Omit<ProductionLog, 'id' | 'createdAt' | 'deletedAt'> | ProductionLog) => void;
    onCancel: () => void;
    editingLog: ProductionLog | null;
    jobsites: Jobsite[];
    employees: Employee[];
    subcontractors: Subcontractor[];
    units: string[];
    prefillData?: { date?: string; jobsiteId?: string };
}

const initialFormState: Omit<ProductionLog, 'id' | 'createdAt' | 'deletedAt'> = {
    date: new Date().toISOString().split('T')[0],
    jobsiteId: '',
    responsible: { type: 'employees', ids: [] },
    tasks: [],
};

const ProductionLogForm: React.FC<ProductionLogFormProps> = (props) => {
    const { onSave, onCancel, editingLog, jobsites, employees, subcontractors, units, prefillData } = props;
    const { productionTasks, addProductionTask } = useAppStore();
    const [formData, setFormData] = useState<Omit<ProductionLog, 'id' | 'createdAt' | 'deletedAt'> | ProductionLog>(initialFormState);
    const [isAddingNewTaskForIndex, setIsAddingNewTaskForIndex] = useState<number | null>(null);
    const [newTaskValue, setNewTaskValue] = useState('');
    
    useEffect(() => {
        if (editingLog) {
            setFormData(editingLog);
        } else {
             setFormData({
                ...initialFormState,
                date: prefillData?.date || new Date().toISOString().split('T')[0],
                jobsiteId: prefillData?.jobsiteId || jobsites[0]?.id || ''
            });
        }
    }, [editingLog, jobsites, prefillData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleResponsibleTypeChange = (type: 'employees' | 'subcontractor') => {
        setFormData(prev => ({ ...prev, responsible: { type, ids: [] } }));
    };

    const handleResponsibleIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        if (formData.responsible.type === 'subcontractor') {
            setFormData(prev => ({ ...prev, responsible: { ...prev.responsible, ids: [value] } }));
        }
    };
    
    const handleEmployeeToggle = (id: string) => {
         if (formData.responsible.type === 'employees') {
            const currentIds = formData.responsible.ids;
            const newIds = currentIds.includes(id) ? currentIds.filter(empId => empId !== id) : [...currentIds, id];
            setFormData(prev => ({ ...prev, responsible: { ...prev.responsible, ids: newIds } }));
         }
    };

    const handleTaskChange = (index: number, field: keyof ProductivityTask, value: string | number) => {
        const newTasks = [...formData.tasks];
        (newTasks[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, tasks: newTasks }));
    };

    const handleSaveNewTask = (index: number) => {
        if (newTaskValue.trim()) {
            if (!productionTasks.includes(newTaskValue.trim())) {
                addProductionTask(newTaskValue.trim());
            }
            handleTaskChange(index, 'description', newTaskValue.trim());
            setIsAddingNewTaskForIndex(null);
            setNewTaskValue('');
        } else {
            setIsAddingNewTaskForIndex(null);
        }
    };

    const addTask = () => {
        setFormData(prev => ({
            ...prev,
            tasks: [...prev.tasks, { id: `task-${Date.now()}`, description: '', quantity: 0, unit: units[0] || '' }]
        }));
    };
    
    const removeTask = (index: number) => {
        setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.jobsiteId && formData.responsible.ids.length > 0 && formData.tasks.length > 0 && formData.tasks.every(t => t.description && t.quantity > 0 && t.unit);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required readOnly={!!prefillData?.date} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Sitio de Trabajo</label>
                    <select name="jobsiteId" value={formData.jobsiteId} onChange={handleChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required disabled={!!prefillData?.jobsiteId}>
                        <option value="" disabled>Seleccione un sitio</option>
                        {jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Responsable</label>
                 <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
                    <button type="button" onClick={() => handleResponsibleTypeChange('employees')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${formData.responsible.type === 'employees' ? 'bg-white shadow' : ''}`}>Empleados</button>
                    <button type="button" onClick={() => handleResponsibleTypeChange('subcontractor')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${formData.responsible.type === 'subcontractor' ? 'bg-white shadow' : ''}`}>Subcontratista</button>
                </div>
                {formData.responsible.type === 'employees' ? (
                     <div className="p-3 border rounded-md max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                        {employees.filter(e => e.isActive).map(emp => (
                            <div key={emp.id} className="flex items-center gap-2">
                                <input type="checkbox" id={`emp-${emp.id}`} checked={formData.responsible.ids.includes(emp.id)} onChange={() => handleEmployeeToggle(emp.id)} />
                                <label htmlFor={`emp-${emp.id}`}>{emp.name}</label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <select value={formData.responsible.ids[0] || ''} onChange={handleResponsibleIdChange} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white">
                        <option value="" disabled>Seleccione Subcontratista</option>
                        {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                )}
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium">Tareas Realizadas</label>
                <div className="space-y-2">
                    {formData.tasks.map((task, index) => (
                        <div key={task.id || index} className="grid grid-cols-[1fr,100px,120px,auto] gap-2 items-center">
                             {isAddingNewTaskForIndex === index ? (
                                <div className="flex gap-1 col-span-1">
                                    <input
                                        type="text"
                                        value={newTaskValue}
                                        onChange={e => setNewTaskValue(e.target.value)}
                                        onBlur={() => handleSaveNewTask(index)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewTask(index); } }}
                                        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                                        autoFocus
                                        placeholder="Escriba la nueva tarea"
                                    />
                                    <button type="button" onClick={() => setIsAddingNewTaskForIndex(null)} className="px-2 bg-gray-200 rounded">X</button>
                                </div>
                            ) : (
                                <select
                                    value={task.description}
                                    onChange={e => {
                                        if (e.target.value === '_addNew_') {
                                            setIsAddingNewTaskForIndex(index);
                                            setNewTaskValue('');
                                        } else {
                                            handleTaskChange(index, 'description', e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="" disabled>Seleccione tarea</option>
                                    {productionTasks.map(t => <option key={t} value={t}>{t}</option>)}
                                    <option value="_addNew_">+ Añadir nueva tarea</option>
                                </select>
                            )}
                            <input type="number" placeholder="Cantidad" value={task.quantity || ''} onChange={e => handleTaskChange(index, 'quantity', parseFloat(e.target.value))} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" min="0" required />
                            <select value={task.unit} onChange={e => handleTaskChange(index, 'unit', e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" required>
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <button type="button" onClick={() => removeTask(index)} className="p-2 text-rose-500"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addTask} className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">+ Añadir Tarea</button>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded disabled:bg-gray-400">
                    {editingLog ? 'Guardar Cambios' : 'Guardar Registro'}
                </button>
            </div>
        </form>
    );
};

export default ProductionLogForm;