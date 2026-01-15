import React, { useState, useEffect } from 'react';
import type { ScheduleEntry, Jobsite, Employee } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CalendarPlusIcon } from '../icons/new/CalendarPlusIcon';

interface ScheduleEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<ScheduleEntry, 'id'>, id?: string) => void;
    jobsites: Jobsite[];
    employees: Employee[];
    initialDate?: string;
}

const ScheduleEntryModal: React.FC<ScheduleEntryModalProps> = ({ isOpen, onClose, onSave, jobsites, employees, initialDate }) => {
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [jobsiteId, setJobsiteId] = useState('');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setDate(initialDate || new Date().toISOString().split('T')[0]);
            setJobsiteId(jobsites[0]?.id || '');
            setSelectedEmployeeIds([]);
        }
    }, [isOpen, initialDate, jobsites]);

    const handleEmployeeToggle = (id: string) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date && jobsiteId && selectedEmployeeIds.length > 0) {
            onSave({ date, jobsiteId, employeeIds: selectedEmployeeIds });
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <CalendarPlusIcon className="w-6 h-6 text-blue-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Asignar Equipo a Proyecto</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="jobsiteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sitio de Trabajo</label>
                                <select id="jobsiteId" value={jobsiteId} onChange={e => setJobsiteId(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white">
                                    <option value="" disabled>Seleccione un sitio</option>
                                    {jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empleados</label>
                            <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-md max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-700/50">
                                {employees.filter(e => e.isActive).map(emp => (
                                    <div key={emp.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`emp-sched-${emp.id}`}
                                            checked={selectedEmployeeIds.includes(emp.id)}
                                            onChange={() => handleEmployeeToggle(emp.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`emp-sched-${emp.id}`}>{emp.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg">Guardar Asignación</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ScheduleEntryModal;