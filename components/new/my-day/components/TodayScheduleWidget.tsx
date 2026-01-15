import React, { useMemo } from 'react';
import { useAppStore } from '../../../../hooks/stores/useAppStore';
import { useOperationsStore } from '../../../../hooks/stores/useOperationsStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { CalendarIcon } from '../../../icons/new/CalendarIcon';
import type { Jobsite } from '../../../../types';

const TodayScheduleWidget: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppStore();
    const { schedule, jobsites } = useOperationsStore();
    const jobsiteMap = useMemo(() => new Map<string, string>(jobsites.map((j : Jobsite) => [j.id, j.address])), [jobsites]);

    const todaySchedule = useMemo(() => {
        if (!currentUser) return [];
        const todayStr = new Date().toISOString().split('T')[0];
        return schedule.filter(s => s.date === todayStr && s.employeeIds.includes(currentUser.id));
    }, [schedule, currentUser]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('todaysSchedule')}</h3>
            </div>
            {todaySchedule.length > 0 ? (
                <ul className="space-y-2">
                    {todaySchedule.map(entry => (
                        <li key={entry.id} className="text-gray-700 dark:text-gray-300">
                           - {jobsiteMap.get(entry.jobsiteId) || 'Sitio Desconocido'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No estás programado para ningún trabajo hoy.</p>
            )}
        </div>
    );
};

export default TodayScheduleWidget;