import React, { useState, useMemo } from 'react';
import type { ProductionLog, Jobsite, Employee, Subcontractor } from '../../types';
import { ChartBarIcon } from '../icons/new/ChartBarIcon';
import BarChart from '../charts/BarChart';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ProductivityViewProps {
    productionLogs: ProductionLog[];
    jobsites: Jobsite[];
    employees: Employee[];
    subcontractors: Subcontractor[];
    onAdd: () => void;
    onEdit: (log: ProductionLog) => void;
    onDelete: (log: ProductionLog) => void;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const ProductivityView: React.FC<ProductivityViewProps> = ({ productionLogs, jobsites, employees, subcontractors, onAdd, onEdit, onDelete }) => {
    const [period, setPeriod] = useState<Period>('weekly');

    const jobsiteMap = useMemo(() => new Map(jobsites.map(j => [j.id, j.address])), [jobsites]);
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.name])), [employees]);
    const subcontractorMap = useMemo(() => new Map(subcontractors.map(s => [s.id, s.name])), [subcontractors]);

    const getResponsibleName = (log: ProductionLog) => {
        if (log.responsible.type === 'subcontractor') {
            return subcontractorMap.get(log.responsible.ids[0]) || 'Subcontratista Desconocido';
        }
        return log.responsible.ids.map(id => employeeMap.get(id)).filter(Boolean).join(', ');
    };

    const sortedLogs = useMemo(() => {
        return [...productionLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [productionLogs]);
    
    // NOTE: Chart data is simplified to sum quantities regardless of unit for demonstration.
    // A real-world scenario would require more complex logic to handle different units.
    const chartData = useMemo(() => {
        const dataMap = new Map<string, number>();
        
        sortedLogs.forEach(log => {
            let key = '';
            const date = new Date(log.date + 'T00:00:00');
            if (period === 'daily') {
                key = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            } else if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay() + 1);
                key = `Sem ${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
            } else if (period === 'monthly') {
                key = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
            } else { // yearly
                key = date.getFullYear().toString();
            }

            const totalQuantity = log.tasks.reduce((sum, task) => sum + task.quantity, 0);
            dataMap.set(key, (dataMap.get(key) || 0) + totalQuantity);
        });

        return Array.from(dataMap.entries()).map(([name, value]) => ({ name, value })).reverse();
    }, [sortedLogs, period]);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Productividad</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Añadir Registro</span>
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Tendencia de Producción</h3>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-sm font-semibold rounded-md ${period === p ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-64">
                    {chartData.length > 0 ? <BarChart data={chartData} /> : <p className="text-center text-gray-500 pt-20">No hay datos para mostrar.</p>}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">Registros de Producción</h3>
                <div className="space-y-4">
                    {sortedLogs.length > 0 ? sortedLogs.map(log => (
                        <div key={log.id} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{new Date(log.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{jobsiteMap.get(log.jobsiteId)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Equipo: {getResponsibleName(log)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(log)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(log)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <ul className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                                {log.tasks.map(task => (
                                    <li key={task.id} className="text-sm flex justify-between">
                                        <span>- {task.description}</span>
                                        <span className="font-semibold">{task.quantity} {task.unit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )) : (
                         <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay registros de productividad</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Añada un nuevo registro para empezar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductivityView;
