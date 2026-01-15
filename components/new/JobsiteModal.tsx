import React, { useState, useEffect } from 'react';
import type { Client, Jobsite, JobsiteStatus, DetailedBudget } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { LocationTargetIcon } from '../icons/LocationTargetIcon';
import * as geminiService from '../../services/geminiService';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useAppStore } from '../../hooks/stores/useAppStore';

interface JobsiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingJobsite: Jobsite | null;
    prefillData?: { clientId: string } | null;
}

const statusOptions: { value: JobsiteStatus, label: string }[] = [
    { value: 'not_started', label: 'Aún sin empezar' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'on_hold', label: 'Suspendido' },
    { value: 'completed', label: 'Terminado' },
    { value: 'cancelled', label: 'Cancelado' },
];

const initialBudget: DetailedBudget = { labor: 0, materials: 0, subcontractors: 0, miscellaneous: 0 };

export const JobsiteModal: React.FC<JobsiteModalProps> = ({ isOpen, onClose, editingJobsite, prefillData }) => {
    
    const { clients } = usePeopleStore();
    const { saveJobsite, deleteJobsite } = useOperationsStore();
    const { confirm } = useAppStore();
    
    const [clientId, setClientId] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState<JobsiteStatus>('not_started');
    const [budget, setBudget] = useState<DetailedBudget>(initialBudget);
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [geofenceRadius, setGeofenceRadius] = useState<number | undefined>(100);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isLocating, setIsLocating] = useState(false);


    useEffect(() => {
        if (isOpen) {
            if (editingJobsite) {
                setClientId(editingJobsite.clientId);
                setAddress(editingJobsite.address);
                setStatus(editingJobsite.status);
                setBudget(editingJobsite.budget || initialBudget);
                setLatitude(editingJobsite.latitude);
                setLongitude(editingJobsite.longitude);
                setGeofenceRadius(editingJobsite.geofenceRadius);
            } else if (prefillData) {
                setClientId(prefillData.clientId);
                setAddress('');
                setStatus('not_started');
                setBudget(initialBudget);
                setLatitude(undefined); setLongitude(undefined); setGeofenceRadius(100);
            } else {
                setClientId(clients.find(c => c.type === 'company')?.id || '');
                setAddress('');
                setStatus('not_started');
                setBudget(initialBudget);
                 setLatitude(undefined); setLongitude(undefined); setGeofenceRadius(100);
            }
        }
    }, [isOpen, editingJobsite, clients, prefillData]);
    
    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBudget(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleGeocode = async () => {
        if (!address) return;
        setIsGeocoding(true);
        try {
            const coords = await geminiService.geocodeAddress(address);
            if (coords) {
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
            } else {
                alert('No se pudieron encontrar las coordenadas para esta dirección.');
            }
        } catch (error) {
            console.error(error);
            alert('Ocurrió un error al detectar las coordenadas.');
        } finally {
            setIsGeocoding(false);
        }
    };
    
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no es compatible con este navegador.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setIsLocating(false);
            },
            () => {
                alert('No se pudo obtener la ubicación actual. Verifique los permisos de su navegador.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim() || !clientId) return;

        saveJobsite({ clientId, address, status, budget, latitude, longitude, geofenceRadius }, editingJobsite?.id);
        onClose();
    };
    
    const handleDelete = () => {
        if (editingJobsite) {
            confirm({
                title: 'Eliminar Sitio',
                message: `¿Mover ${editingJobsite.address} a la papelera?`,
                onConfirm: () => {
                    deleteJobsite([editingJobsite.id]);
                    onClose();
                }
            });
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {editingJobsite ? 'Editar Sitio de Trabajo' : 'Añadir Sitio de Trabajo'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 sm:p-8 bg-white dark:bg-gray-800/50 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400"><BuildingIcon className="w-5 h-5" /></span>
                                <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={!!editingJobsite || !!prefillData || clients.length === 0} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none">
                                    {clients.filter(c => c.type === 'company').length > 0 ? (clients.filter(c => c.type === 'company').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))) : (<option disabled>No hay compañías activas</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dirección del Sitio de Trabajo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400"><LocationMarkerIcon className="w-5 h-5" /></span>
                                <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: 456 Construction Ave, Buildtown" required className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg" />
                            </div>
                        </div>
                         <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Geofencing (Opcional)</h4>
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button" 
                                        onClick={handleUseCurrentLocation}
                                        disabled={isLocating}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-teal-400"
                                    >
                                        <LocationTargetIcon className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                                        {isLocating ? 'Ubicando...' : 'Ubicación Actual'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleGeocode}
                                        disabled={!address || isGeocoding}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
                                    >
                                        <SparklesIcon className={`w-4 h-4 ${isGeocoding ? 'animate-spin' : ''}`} />
                                        {isGeocoding ? 'Detectando...' : 'Desde Dirección'}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="text-sm dark:text-gray-300">Latitud</label><input type="number" value={latitude || ''} onChange={e => setLatitude(parseFloat(e.target.value))} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" step="any" /></div>
                                <div><label className="text-sm dark:text-gray-300">Longitud</label><input type="number" value={longitude || ''} onChange={e => setLongitude(parseFloat(e.target.value))} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" step="any" /></div>
                                <div><label className="text-sm dark:text-gray-300">Radio (m)</label><input type="number" value={geofenceRadius || ''} onChange={e => setGeofenceRadius(parseInt(e.target.value, 10))} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" /></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Presupuesto Detallado</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-600 dark:text-gray-400">Mano de Obra ($)</label><input type="number" name="labor" value={budget.labor} onChange={handleBudgetChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" min="0" step="100" /></div>
                                <div><label className="text-sm text-gray-600 dark:text-gray-400">Materiales ($)</label><input type="number" name="materials" value={budget.materials} onChange={handleBudgetChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" min="0" step="100" /></div>
                                <div><label className="text-sm text-gray-600 dark:text-gray-400">Subcontratistas ($)</label><input type="number" name="subcontractors" value={budget.subcontractors} onChange={handleBudgetChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" min="0" step="100" /></div>
                                <div><label className="text-sm text-gray-600 dark:text-gray-400">Misceláneos ($)</label><input type="number" name="miscellaneous" value={budget.miscellaneous} onChange={handleBudgetChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" min="0" step="100" /></div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado del Sitio de Trabajo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400"><TagIcon className="w-5 h-5" /></span>
                                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as JobsiteStatus)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg appearance-none">
                                    {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                </select>
                            </div>
                        </div>
                    </main>
                    <footer className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={!clientId || !address.trim()} className="glass-button">Guardar</button>
                            <button type="button" onClick={onClose} className="glass-button-secondary">Cancelar</button>
                        </div>
                        {editingJobsite && <button type="button" onClick={handleDelete} className="glass-button-destructive"><TrashIcon className="w-5 h-5" />Eliminar</button>}
                    </footer>
                </form>
            </div>
        </div>
    );
};