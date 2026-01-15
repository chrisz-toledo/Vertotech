import React, { useState, useMemo } from 'react';
import type { ScheduleEntry, Jobsite, Employee } from '../../types';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useModalManager } from '../../hooks/useModalManager';
import { useTranslation } from '../../hooks/useTranslation';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { CalendarPlusIcon } from '../icons/new/CalendarPlusIcon';
import { WandIcon } from '../icons/new/WandIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import * as geminiService from '../../services/geminiService';
import { Popover } from '../shared/Popover';
import { EmployeeQuickView } from '../employees/EmployeeQuickView';

const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

interface DayCardProps {
    date: Date;
    entries: ScheduleEntry[];
    jobsites: Jobsite[];
    employees: Employee[];
    onOpenModal: (entry: ScheduleEntry | null, date?: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ date, entries, jobsites, employees, onOpenModal }) => {
    const jobsiteMap = useMemo(() => new Map(jobsites.map(j => [j.id, j])), [jobsites]);
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <h4 className="font-bold text-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                <span className="text-gray-500 dark:text-gray-400">{date.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                <span className="block text-gray-800 dark:text-gray-200 text-lg">{date.getDate()}</span>
            </h4>
            <div className="p-3 space-y-3 flex-grow overflow-y-auto">
                {entries.map(entry => (
                    <div key={entry.id} className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="font-semibold text-sm text-blue-800 dark:text-blue-300">{jobsiteMap.get(entry.jobsiteId)?.address}</p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 pl-4 list-disc">
                            {entry.employeeIds.map(id => {
                                const employee = employeeMap.get(id);
                                return (
                                    <li key={id}>
                                        {employee ? (
                                            <Popover
                                                trigger={<span className="underline decoration-dotted cursor-pointer">{employee.name}</span>}
                                                content={<EmployeeQuickView employee={employee} />}
                                            />
                                        ) : 'Empleado Desconocido'}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => onOpenModal(null, formatDate(date))} className="w-full text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-1.5 rounded">
                    + Asignar Equipo
                </button>
            </div>
        </div>
    );
};

const PlanningView: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { schedule, jobsites, setSchedule } = useOperationsStore();
    const { employees } = usePeopleStore();

    const [currentWeek, setCurrentWeek] = useState(() => getWeekStartDate(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<{ schedule: ScheduleEntry[], reasoning: string } | null>(null);

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(currentWeek);
            date.setDate(currentWeek.getDate() + i);
            return date;
        });
    }, [currentWeek]);

    const weekSchedule = useMemo(() => {
        const weekMap = new Map<string, ScheduleEntry[]>();
        weekDates.forEach(date => weekMap.set(formatDate(date), []));
        schedule.forEach(entry => {
            if (weekMap.has(entry.date)) {
                weekMap.get(entry.date)!.push(entry);
            }
        });
        return weekMap;
    }, [schedule, weekDates]);
    
    const handleWeekChange = (direction: 'prev' | 'next') => {
        setOptimizationResult(null);
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };
    
    const handleOptimize = async () => {
        setIsLoading(true);
        setOptimizationResult(null);
        try {
            const currentWeekEntries = Array.from(weekSchedule.values()).flat();
            const result = await geminiService.optimizeSchedule(currentWeekEntries, employees, jobsites);
            setOptimizationResult(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApplyOptimization = () => {
        if (!optimizationResult) return;
        
        const otherWeeksSchedule = schedule.filter(entry => !weekSchedule.has(entry.date));
        setSchedule([...otherWeeksSchedule, ...optimizationResult.schedule]);
        setOptimizationResult(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button onClick={() => handleWeekChange('prev')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-center w-full sm:w-64">{currentWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => handleWeekChange('next')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
                 <div className="flex items-stretch gap-2">
                    <button onClick={() => openModal('scheduleEntry')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <CalendarPlusIcon className="w-5 h-5" />
                        <span>{t('addToSchedule')}</span>
                    </button>
                    <button onClick={handleOptimize} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700 disabled:bg-violet-400">
                        <WandIcon className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                        <span>{isLoading ? 'Optimizando...' : t('optimizeSchedule')}</span>
                    </button>
                </div>
            </div>

            {optimizationResult && (
                <div className="p-4 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-lg">
                    <div className="flex justify-between items-start">
                         <div>
                            <h4 className="font-bold text-violet-800 dark:text-violet-200 flex items-center gap-2"><SparklesIcon className="w-5 h-5"/>Sugerencia de Optimización</h4>
                            <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">{optimizationResult.reasoning}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                             <button onClick={() => setOptimizationResult(null)} className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-600 rounded-md">Descartar</button>
                             <button onClick={handleApplyOptimization} className="px-3 py-1 text-sm font-semibold text-white bg-violet-600 rounded-md">Aplicar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {weekDates.map(date => (
                    <DayCard
                        key={date.toISOString()}
                        date={date}
                        entries={weekSchedule.get(formatDate(date)) || []}
                        jobsites={jobsites}
                        employees={employees}
                        onOpenModal={(entry, date) => openModal('scheduleEntry', { date })}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlanningView;