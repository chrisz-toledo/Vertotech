import React, { useState, useMemo } from 'react';
import type { Jobsite, DailyLog, ProductionLog } from '../../types';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useModalManager } from '../../hooks/useModalManager';
import { BookOpenIcon } from '../icons/new/BookOpenIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const DailyLogView: React.FC = () => {
    const { jobsites, dailyLogs } = useOperationsStore();
    const { open: openModal } = useModalManager();
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleDateChange = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const dateStr = formatDate(currentDate);
    const logsForDate = useMemo(() => new Map<string, DailyLog>(dailyLogs.filter(log => log.date === dateStr).map(log => [log.jobsiteId, log])), [dailyLogs, dateStr]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bitácora Diaria</h2>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button onClick={() => handleDateChange('prev')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <input 
                        type="date" 
                        value={dateStr}
                        onChange={e => setCurrentDate(new Date(e.target.value + 'T00:00:00'))}
                        className="font-semibold text-gray-700 dark:text-gray-200 text-center bg-transparent border-none focus:ring-0"
                    />
                    <button onClick={() => handleDateChange('next')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
            </div>

            <div className="space-y-4">
                {jobsites.map(jobsite => {
                    const log = logsForDate.get(jobsite.id);
                    return (
                        <div key={jobsite.id} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{jobsite.address}</p>
                                {log ? (
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Bitácora registrada con {log.photos.length} foto(s).</p>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay bitácora para esta fecha.</p>
                                )}
                            </div>
                            <button 
                                onClick={() => openModal('dailyLog', { date: dateStr, jobsiteId: jobsite.id })}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                            >
                                {log ? 'Ver / Editar' : 'Crear Bitácora'}
                            </button>
                        </div>
                    );
                })}
                 {jobsites.length === 0 && (
                     <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Sitios de Trabajo Activos</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Cree un sitio de trabajo para empezar a registrar bitácoras diarias.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default DailyLogView;