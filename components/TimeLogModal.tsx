import React, { useState, useEffect, useMemo } from 'react';
import type { TimeLog, WeekHours } from '../types';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../hooks/stores/useOperationsStore';
import { useAppStore } from '../hooks/stores/useAppStore';

import { XCircleIcon } from './icons/XCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { TrashIcon } from './icons/TrashIcon';

const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const formatDateToYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

const formatWeekDisplay = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const startStr = startDate.toLocaleDateString('es-ES', options);
    const endStr = endDate.toLocaleDateString('es-ES', { ...options, year: 'numeric' });
    return `${startStr} - ${endStr}`;
};

const DAY_KEYS: (keyof WeekHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const createEmptyWeek = (): WeekHours => ({
    mon: { regular: 0, overtime: 0 }, tue: { regular: 0, overtime: 0 },
    wed: { regular: 0, overtime: 0 }, thu: { regular: 0, overtime: 0 },
    fri: { regular: 0, overtime: 0 }, sat: { regular: 0, overtime: 0 },
    sun: { regular: 0, overtime: 0 },
});

interface TimeLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TimeLogModal: React.FC<TimeLogModalProps> = ({ isOpen, onClose }) => {
    const { clients, employees } = usePeopleStore();
    const { timeLogs, jobsites, saveTimeLog, deleteTimeLog } = useOperationsStore();
    const { confirm } = useAppStore();
    
    const [currentWeek, setCurrentWeek] = useState(() => getWeekStartDate(new Date()));
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedJobsiteId, setSelectedJobsiteId] = useState<string | undefined>(undefined);
    const [editedLog, setEditedLog] = useState<TimeLog | null>(null);

    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
    const clientJobsites = useMemo(() => jobsites.filter(j => j.clientId === selectedClientId), [selectedClientId, jobsites]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedClientId('');
            setSelectedJobsiteId(undefined);
            setEditedLog(null);
            setCurrentWeek(getWeekStartDate(new Date()));
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedJobsiteId(undefined);
        setEditedLog(null);
    }, [selectedClientId]);

    useEffect(() => {
        const hasJobsites = clientJobsites.length > 0;
        const canLoadLog = selectedClientId && (!hasJobsites || selectedJobsiteId !== undefined);

        if (canLoadLog) {
            const weekStartDateStr = formatDateToYYYYMMDD(currentWeek);
            const existingLog = timeLogs.find(log => log.clientId === selectedClientId && log.weekStartDate === weekStartDateStr && log.jobsiteId === selectedJobsiteId);
            if (existingLog) {
                 const updatedEmployeeHours = { ...existingLog.employeeHours };
                 employees.forEach(emp => { if (!updatedEmployeeHours[emp.id]) updatedEmployeeHours[emp.id] = createEmptyWeek(); });
                setEditedLog({ ...existingLog, employeeHours: updatedEmployeeHours });
            } else {
                setEditedLog({
                    id: '', clientId: selectedClientId, jobsiteId: selectedJobsiteId, weekStartDate: weekStartDateStr,
                    employeeHours: employees.reduce((acc, emp) => ({...acc, [emp.id]: createEmptyWeek() }), {} as { [id: string]: WeekHours })
                });
            }
        } else {
            setEditedLog(null);
        }
    }, [selectedClientId, selectedJobsiteId, currentWeek, timeLogs, employees, clientJobsites]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const handleHourChange = (employeeId: string, day: keyof WeekHours, type: 'regular' | 'overtime', value: string) => {
        const hours = Math.max(0, parseFloat(value) || 0);
        setEditedLog(prevLog => {
            if (!prevLog) return null;
            const newEmployeeHours = { ...prevLog.employeeHours };
            newEmployeeHours[employeeId] = { ...newEmployeeHours[employeeId], [day]: { ...newEmployeeHours[employeeId][day], [type]: hours } };
            return { ...prevLog, employeeHours: newEmployeeHours };
        });
    };
    
    const employeeTotals = useMemo(() => {
        if (!editedLog) return {};
        return Object.fromEntries(employees.map(emp => [emp.id, DAY_KEYS.reduce((acc, day) => {
            const dayHours = editedLog.employeeHours[emp.id]?.[day];
            if (dayHours) { acc.regular += dayHours.regular; acc.overtime += dayHours.overtime; }
            return acc;
        }, { regular: 0, overtime: 0 })]));
    }, [editedLog, employees]);

    const dailyTotals = useMemo(() => {
        if(!editedLog) return null;
        return DAY_KEYS.map(day => employees.reduce((acc, emp) => {
            const empHours = editedLog.employeeHours[emp.id]?.[day];
            if (empHours) { acc.regular += empHours.regular; acc.overtime += empHours.overtime; }
            return acc;
        }, { regular: 0, overtime: 0 }));
    }, [editedLog, employees]);

    const handleSave = () => {
        if (editedLog) {
            saveTimeLog(editedLog, editedLog.id);
            onClose();
        }
    };
    
    const handleDeleteRequest = (log: TimeLog) => {
        confirm({
            title: 'Confirmar Eliminación de Hoja de Horas',
            message: `¿Está seguro de que desea mover la hoja de horas de la semana del ${log.weekStartDate} a la papelera?`,
            onConfirm: () => {
                deleteTimeLog([log.id]);
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-2 sm:p-4" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3"><ClockIcon className="w-6 h-6 text-indigo-600"/><h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Registrar Horas</h2></div><button onClick={onClose} className="p-1 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50"><XCircleIcon className="w-8 h-8"/></button></header>
                <div className="p-5 flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2"><button onClick={() => handleWeekChange('prev')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6" /></button><span className="font-semibold text-center w-64">{formatWeekDisplay(currentWeek)}</span><button onClick={() => handleWeekChange('next')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRightIcon className="w-6 h-6" /></button></div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full sm:flex-1 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"><option value="" disabled>-- Seleccione Cliente --</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
                        {clientJobsites.length > 0 && selectedClient?.type === 'company' && (<select value={selectedJobsiteId || ''} onChange={(e) => setSelectedJobsiteId(e.target.value || undefined)} className="w-full sm:flex-1 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"><option value="" disabled>-- Seleccione Dirección --</option>{clientJobsites.map(site => <option key={site.id} value={site.id}>{site.address}</option>)}</select>)}
                    </div>
                </div>
                <main className="overflow-auto flex-grow">{editedLog ? (<div className="p-1 sm:p-2"><table className="min-w-full divide-y border-separate" style={{borderSpacing: '0 0.25rem'}}>
                    <thead className="bg-gray-100 dark:bg-gray-900/50 sticky top-0 z-10"><tr><th className="px-3 py-3 text-left text-xs font-bold uppercase rounded-l-lg">Empleado</th>{DAY_LABELS.map(label => <th key={label} className="w-36 px-1 py-3 text-center text-xs font-bold uppercase">{label}</th>)}<th className="px-3 py-3 text-center text-xs font-bold uppercase rounded-r-lg">Totales</th></tr></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">{employees.map(employee => (<tr key={employee.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"><td className="px-3 py-2 font-medium">{employee.name}</td>{DAY_KEYS.map(day => (<td key={day} className="px-1 py-1"><div className="grid grid-cols-2 gap-1"><input type="number" min="0" placeholder="Reg" value={editedLog.employeeHours[employee.id]?.[day]?.regular || ''} onChange={e => handleHourChange(employee.id, day, 'regular', e.target.value)} className="w-full p-1 border dark:border-gray-600 rounded-md text-center bg-white dark:bg-gray-700" /><input type="number" min="0" placeholder="OT" value={editedLog.employeeHours[employee.id]?.[day]?.overtime || ''} onChange={e => handleHourChange(employee.id, day, 'overtime', e.target.value)} className="w-full p-1 border dark:border-gray-600 rounded-md text-center bg-orange-50/50 dark:bg-orange-900/20" /></div></td>))}{<td className="px-3 py-2 text-center"><p className="font-bold text-indigo-700">{employeeTotals[employee.id]?.regular || 0} <span className="font-normal text-xs">reg</span></p><p className="font-bold text-orange-700">{employeeTotals[employee.id]?.overtime || 0} <span className="font-normal text-xs">ot</span></p></td>}</tr>))}</tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-900/50 sticky bottom-0"><tr><th className="px-3 py-2 text-left text-xs font-bold uppercase rounded-l-lg">Totales</th>{dailyTotals?.map((total, i) => (<td key={i} className="px-1 py-2 text-center"><p className="font-bold text-sm text-indigo-800">{total.regular} <span className="text-xs">reg</span></p><p className="font-bold text-sm text-orange-800">{total.overtime} <span className="text-xs">ot</span></p></td>))}<td className="px-3 py-2 text-center rounded-r-lg"><p className="font-extrabold text-lg text-indigo-800">{dailyTotals?.reduce((acc, t) => acc + t.regular, 0)}</p><p className="font-extrabold text-lg text-orange-800">{dailyTotals?.reduce((acc, t) => acc + t.overtime, 0)}</p></td></tr></tfoot>
                </table></div>) : (<div className="text-center p-10 flex flex-col justify-center items-center h-full"><ClockIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />{!selectedClientId ? (<><h3 className="mt-4 text-xl font-semibold">Seleccione un cliente</h3><p className="mt-1">Elija un cliente para empezar.</p></>) : (<><h3 className="mt-4 text-xl font-semibold">Seleccione una Dirección</h3><p className="mt-1 max-w-md">Este cliente tiene múltiples direcciones. Por favor, elija una para continuar.</p></>)}</div>)}</main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"><button onClick={() => editedLog && handleDeleteRequest(editedLog)} disabled={!editedLog || !editedLog.id} className="flex items-center gap-2 px-6 py-2.5 font-semibold text-rose-600 bg-rose-100 dark:bg-rose-900/50 rounded-lg disabled:opacity-50"><TrashIcon className="w-5 h-5"/>Eliminar Hoja de Horas</button><div className="flex gap-4"><button onClick={onClose} className="px-8 py-3 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button><button onClick={handleSave} disabled={!editedLog} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">Guardar Horas</button></div></footer>
            </div>
        </div>
    );
};