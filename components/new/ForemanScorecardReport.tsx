import React, { useMemo } from 'react';
import type { Employee } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useModalManager } from '../../hooks/useModalManager';
import { UsersGroupIcon } from '../icons/UsersGroupIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useAiStore } from '../../hooks/stores/useAiStore';


const ForemanScorecardReport: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { getForemanPerformanceAnalysis } = useAiStore();

    const { employees } = usePeopleStore();
    const { productionLogs, timeLogs, extraWorkTickets } = useOperationsStore();

    const foremanData = useMemo(() => {
        const foremen = employees.filter(e => e.job === 'Foreman' && e.isActive);
    
        return foremen.map(foreman => {
            const logsWithForeman = productionLogs.filter(log => log.responsible.type === 'employees' && log.responsible.ids.includes(foreman.id));
            
            const relevantJobsiteIds = new Set(logsWithForeman.map(l => l.jobsiteId));

            const relevantTimeLogs = timeLogs.filter(tl => tl.jobsiteId && relevantJobsiteIds.has(tl.jobsiteId));

            let totalHours = 0;
            let totalOvertimeHours = 0;
            let totalUnits = 0;

            relevantTimeLogs.forEach(log => {
                Object.values(log.employeeHours).forEach(week => {
                    Object.values(week).forEach(day => {
                        totalHours += day.regular + day.overtime;
                        totalOvertimeHours += day.overtime;
                    });
                });
            });

            logsWithForeman.forEach(log => {
                log.tasks.forEach(task => {
                    totalUnits += task.quantity;
                });
            });

            const reworkTickets = extraWorkTickets.filter(t => t.category === 'rework' && t.employeeIds.includes(foreman.id)).length;

            const kpis = {
                efficiency: totalHours > 0 ? totalUnits / totalHours : 0,
                overtimeRatio: totalHours > 0 ? totalOvertimeHours / totalHours : 0,
                reworkTickets,
            };

            return { foreman, kpis };
        });
    }, [employees, productionLogs, timeLogs, extraWorkTickets]);

    const handleGenerateAnalysis = (foreman: Employee, kpis: any) => {
        getForemanPerformanceAnalysis(foreman, kpis);
        openModal('aiContent');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('foremanPerformance')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Analyze key KPIs for your team leaders.</p>
            </div>
            
            {foremanData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foremanData.map(({ foreman, kpis }) => (
                        <div key={foreman.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                            <div className="flex items-center gap-4">
                                <img src={foreman.photoUrl} alt={foreman.name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md"/>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{foreman.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{foreman.job}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-grow space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('efficiency')}</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{kpis.efficiency.toFixed(2)} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{t('unitsPerHour')}</span></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('quality')}</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{kpis.reworkTickets} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{t('reworkTickets')}</span></span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overtimeRatio')}</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{(kpis.overtimeRatio * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handleGenerateAnalysis(foreman, kpis)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>Generate AI Analysis</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <UsersGroupIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Foremen to Analyze</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Ensure you have employees with the "Foreman" job title and associated production data.</p>
                </div>
            )}
        </div>
    );
};

export default ForemanScorecardReport;