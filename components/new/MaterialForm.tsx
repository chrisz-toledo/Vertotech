import React, { useState, useEffect, useRef } from 'react';
import type { Material, Jobsite, MaterialLocation } from '../../types';
import { BoxIcon } from '../icons/new/BoxIcon';
import { HashIcon } from '../icons/new/HashIcon';
import { RulerIcon } from '../icons/new/RulerIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';

interface MaterialFormProps {
    onSave: (materialData: Omit<Material, 'id' | 'deletedAt'> | Material) => void;
    onCancel: () => void;
    editingMaterial: Material | null;
    jobsites: Jobsite[];
    materialUnits: string[];
    onAddMaterialUnit: (unit: string) => void;
}

const initialFormState: Omit<Material, 'id' | 'deletedAt'> = {
    name: '',
    sku: '',
    quantity: 0,
    unit: '',
    location: { type: 'warehouse', name: '' },
};

const MaterialForm: React.FC<MaterialFormProps> = ({ onSave, onCancel, editingMaterial, jobsites, materialUnits, onAddMaterialUnit }) => {
    const [formData, setFormData] = useState<Omit<Material, 'id' | 'deletedAt'> | Material>(editingMaterial || initialFormState);
    const [isAddingNewUnit, setIsAddingNewUnit] = useState(false);
    const [newUnitValue, setNewUnitValue] = useState('');
    const newUnitInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(editingMaterial || initialFormState);
    }, [editingMaterial]);

    useEffect(() => {
        if (isAddingNewUnit) {
            newUnitInputRef.current?.focus();
        }
    }, [isAddingNewUnit]);

    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'unit' && value === '_addNew_') {
            setIsAddingNewUnit(true);
            setFormData(prev => ({ ...prev, unit: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseFloat(value) : value }));
        }
    };
    
    const handleSaveNewUnit = () => {
        if (newUnitValue.trim()) {
            onAddMaterialUnit(newUnitValue);
            setFormData(prev => ({ ...prev, unit: newUnitValue.trim() }));
            setIsAddingNewUnit(false);
            setNewUnitValue('');
        }
    };
    
    const handleLocationTypeChange = (type: 'warehouse' | 'jobsite') => {
        if (type === 'warehouse') {
            setFormData(prev => ({ ...prev, location: { type: 'warehouse', name: '' } }));
        } else {
            setFormData(prev => ({ ...prev, location: { type: 'jobsite', jobsiteId: jobsites[0]?.id || '' } }));
        }
    };
    
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, name } = e.target;
        setFormData(prev => {
            const newLocation = { ...prev.location, [name]: value } as MaterialLocation;
            return { ...prev, location: newLocation };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.name && formData.quantity >= 0 && formData.unit && (formData.location.type === 'warehouse' ? !!formData.location.name.trim() : !!formData.location.jobsiteId);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nombre del Material</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><BoxIcon className="w-5 h-5"/></span><input type="text" id="name" name="name" value={formData.name} onChange={handleSimpleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">SKU (Opcional)</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><HashIcon className="w-5 h-5"/></span><input type="text" id="sku" name="sku" value={formData.sku || ''} onChange={handleSimpleChange} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><RulerIcon className="w-5 h-5"/></span><input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleSimpleChange} required min="0" step="any" className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                </div>
                 <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
                    {isAddingNewUnit ? (
                        <div className="flex gap-2">
                            <input ref={newUnitInputRef} type="text" value={newUnitValue} onChange={(e) => setNewUnitValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveNewUnit()} className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Nueva unidad" />
                            <button type="button" onClick={handleSaveNewUnit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">Guardar</button>
                            <button type="button" onClick={() => setIsAddingNewUnit(false)} className="px-4 py-2 text-sm bg-gray-200 rounded-lg">X</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><RulerIcon className="w-5 h-5"/></span>
                            <select id="unit" name="unit" value={formData.unit} onChange={handleSimpleChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 dark:text-white">
                                <option value="" disabled>Seleccione una unidad</option>
                                {materialUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                <option value="_addNew_">+ Añadir Nueva Unidad...</option>
                            </select>
                        </div>
                    )}
                </div>
                <div className="md:col-span-2 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ubicación</label>
                        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
                            <button type="button" onClick={() => handleLocationTypeChange('warehouse')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-all ${formData.location.type === 'warehouse' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Bodega</button>
                            <button type="button" onClick={() => handleLocationTypeChange('jobsite')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-all ${formData.location.type === 'jobsite' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Sitio de Trabajo</button>
                        </div>
                    </div>
                    {formData.location.type === 'warehouse' && (
                        <div>
                             <label htmlFor="warehouseName" className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Bodega</label>
                            <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><LocationMarkerIcon className="w-5 h-5"/></span><input type="text" id="warehouseName" name="name" value={formData.location.name} onChange={handleLocationChange} required className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" /></div>
                        </div>
                    )}
                    {formData.location.type === 'jobsite' && (
                         <div>
                             <label htmlFor="jobsiteId" className="block text-sm font-medium text-gray-700 mb-2">Sitio de Trabajo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><LocationMarkerIcon className="w-5 h-5"/></span>
                                <select id="jobsiteId" name="jobsiteId" value={formData.location.jobsiteId} onChange={handleLocationChange} required disabled={jobsites.length === 0} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg appearance-none disabled:bg-gray-200 bg-white dark:bg-gray-700 dark:text-white">
                                    {jobsites.length > 0 ? (
                                        jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)
                                    ) : (
                                        <option>No hay sitios de trabajo disponibles</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">{editingMaterial ? 'Guardar Cambios' : 'Añadir Material'}</button>
            </div>
        </form>
    );
};

export default MaterialForm;