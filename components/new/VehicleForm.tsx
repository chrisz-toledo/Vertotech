import React, { useState, useEffect } from 'react';
import type { Vehicle, VehicleStatus } from '../../types';
import { TruckIcon } from '../icons/new/TruckIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { HashIcon } from '../icons/new/HashIcon';
import { CalendarIcon } from '../icons/new/CalendarIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';

interface VehicleFormProps {
    onSave: (data: Omit<Vehicle, 'id' | 'deletedAt'> | Vehicle) => void;
    onCancel: () => void;
    editingVehicle: Vehicle | null;
}

const initialFormState: Omit<Vehicle, 'id' | 'deletedAt'> = {
    name: '',
    type: '',
    licensePlate: '',
    vin: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    initialCost: 0,
    status: 'operational',
};

const VehicleForm: React.FC<VehicleFormProps> = ({ onSave, onCancel, editingVehicle }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'deletedAt'> | Vehicle>(editingVehicle || initialFormState);

    useEffect(() => {
        setFormData(editingVehicle || initialFormState);
    }, [editingVehicle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'initialCost' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isFormValid = formData.name && formData.type && formData.purchaseDate;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Nombre / Identificador</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><TruckIcon className="w-5 h-5"/></span>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg" required placeholder="Ej: Ford F-150 #3" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Vehículo</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span>
                        <input name="type" value={formData.type} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg" required placeholder="Ej: Camioneta, Excavadora" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><TagIcon className="w-5 h-5"/></span>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg appearance-none" required>
                            <option value="operational">Operacional</option>
                            <option value="in_repair">En Reparación</option>
                            <option value="out_of_service">Fuera de Servicio</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Placa (Opcional)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><HashIcon className="w-5 h-5"/></span>
                        <input name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">VIN (Opcional)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><HashIcon className="w-5 h-5"/></span>
                        <input name="vin" value={formData.vin || ''} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Compra</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><CalendarIcon className="w-5 h-5"/></span>
                        <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Costo Inicial</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400"><DollarSignIcon className="w-5 h-5"/></span>
                        <input type="number" name="initialCost" value={formData.initialCost} onChange={handleChange} className="w-full pl-11 p-3 border rounded-lg" min="0" step="0.01" required />
                    </div>
                </div>
            </div>
             <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={!isFormValid} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded disabled:bg-gray-400">
                    {editingVehicle ? 'Guardar Cambios' : 'Añadir Vehículo'}
                </button>
            </div>
        </form>
    );
};

export default VehicleForm;
