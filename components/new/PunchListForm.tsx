

import React, { useState, useEffect, useRef } from 'react';
import type { PunchList, PunchListItem, Employee } from '../../types';
import * as geminiService from '../../services/geminiService';
import { TrashIcon } from '../icons/TrashIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface PunchListFormProps {
    onSave: (data: PunchList) => void;
    onCancel: () => void;
    editingPunchList: PunchList;
    employees: Employee[];
}

const readFileAsBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => reader.result && typeof reader.result === 'string'
            ? resolve({ mimeType: file.type, data: reader.result.split(',')[1] })
            : reject(new Error('No se pudo leer el archivo.'));
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const PunchListForm: React.FC<PunchListFormProps> = ({ onSave, onCancel, editingPunchList, employees }) => {
    const [formData, setFormData] = useState<PunchList>(editingPunchList);
    const [newItem, setNewItem] = useState<{ description: string, location: string }>({ description: '', location: '' });
    const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
    const [isCooldown, setIsCooldown] = useState(false);
    const cooldownTimerRef = useRef<number | null>(null);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        setFormData(editingPunchList);
        // Ensure refs array is long enough
        fileInputRefs.current = fileInputRefs.current.slice(0, editingPunchList.items.length);
    }, [editingPunchList]);
    
    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, []);

    const handleItemChange = (index: number, field: keyof PunchListItem, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        if (!newItem.description.trim() || !newItem.location.trim()) return;
        const item: PunchListItem = {
            id: `pli-${Date.now()}`,
            ...newItem,
            status: 'abierto',
            createdAt: new Date().toISOString(),
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, item] }));
        setNewItem({ description: '', location: '' });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzingIndex(index);
        setIsCooldown(true);
        try {
            const imageForApi = await readFileAsBase64(file);
            const { description, suggestedAction } = await geminiService.analyzeDefectImage(imageForApi);
            const objectUrl = URL.createObjectURL(file);
            
            const newItems = [...formData.items];
            newItems[index].description = `${description} (Sugerencia: ${suggestedAction})`;
            // FIX: Use objectUrl and name for the photo object to match the updated type definition.
            newItems[index].photo = { mimeType: file.type, objectUrl, name: file.name };
            setFormData(prev => ({ ...prev, items: newItems }));

        } catch (error) {
            console.error("Error analyzing defect image", error);
        } finally {
            setAnalyzingIndex(null);
            cooldownTimerRef.current = window.setTimeout(() => setIsCooldown(false), 5000);
            if (e.target) e.target.value = '';
        }
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium dark:text-gray-300">Nombre de la Lista</label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                    className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold dark:text-gray-200">Tareas</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {formData.items.map((item, index) => (
                        <div key={item.id} className="p-3 border dark:border-gray-600 rounded-lg space-y-2 relative bg-gray-50 dark:bg-gray-700/50">
                            <input type="file" ref={el => { fileInputRefs.current[index] = el }} className="hidden" onChange={(e) => handleFileChange(e, index)} accept="image/*" />
                            <div>
                                <label className="text-xs font-medium dark:text-gray-400">Descripción</label>
                                <textarea value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} rows={2} className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-medium dark:text-gray-400">Ubicación</label>
                                    <input type="text" value={item.location} onChange={e => handleItemChange(index, 'location', e.target.value)} className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium dark:text-gray-400">Estado</label>
                                    <select value={item.status} onChange={e => handleItemChange(index, 'status', e.target.value)} className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white">
                                        <option value="abierto">{t('open')}</option>
                                        <option value="en_progreso">En Progreso</option>
                                        <option value="completado">{t('completed_qc')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-medium dark:text-gray-400">Asignado a</label>
                                    <select value={item.assignedTo || ''} onChange={e => handleItemChange(index, 'assignedTo', e.target.value)} className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white">
                                        <option value="">Nadie</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs font-medium dark:text-gray-400">Foto</label>
                                    <button type="button" onClick={() => fileInputRefs.current[index]?.click()} disabled={isCooldown} className="w-full p-1 border dark:border-gray-600 rounded text-sm flex items-center justify-center gap-2 bg-white dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-900">
                                        <CameraIcon className="w-4 h-4" />
                                        {analyzingIndex === index ? 'Analizando...' : (isCooldown ? 'Espere...' : (item.photo ? 'Cambiar Foto' : 'Añadir Foto'))}
                                    </button>
                                </div>
                            </div>
                             {/* FIX: Access objectUrl property which now exists on the photo object. */}
                            {item.photo && <img src={item.photo.objectUrl} alt="Defecto" className="w-24 h-24 object-cover rounded mt-2" />}
                            <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full" title="Eliminar tarea"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t dark:border-gray-600 space-y-2">
                    <h4 className="font-semibold dark:text-gray-200">Añadir Nueva Tarea</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="text" placeholder="Descripción" value={newItem.description} onChange={e => setNewItem(p => ({...p, description: e.target.value}))} className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"/>
                        <input type="text" placeholder="Ubicación" value={newItem.location} onChange={e => setNewItem(p => ({...p, location: e.target.value}))} className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"/>
                    </div>
                    <button type="button" onClick={handleAddItem} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded">Añadir</button>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg">Guardar Cambios</button>
            </div>
        </form>
    );
};

export default PunchListForm;