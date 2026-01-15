import React, { useMemo } from 'react';
import { useAppStore } from '../../../../hooks/stores/useAppStore';
import { useOperationsStore } from '../../../../hooks/stores/useOperationsStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { ChecklistIcon } from '../../../icons/new/ChecklistIcon';

const MyTasksWidget: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppStore();
    const { punchLists } = useOperationsStore();

    const myOpenTasks = useMemo(() => {
        if (!currentUser) return [];
        return punchLists
            .flatMap(pl => pl.items.map(item => ({ ...item, jobsiteId: pl.jobsiteId })))
            .filter(item => item.assignedTo === currentUser.id && item.status !== 'completado');
    }, [punchLists, currentUser]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <ChecklistIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('myOpenTasks')}</h3>
            </div>
            {myOpenTasks.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {myOpenTasks.map(item => (
                        <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                           <p className="font-medium">{item.description}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{item.location}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">¡No tienes tareas pendientes!</p>
            )}
        </div>
    );
};

export default MyTasksWidget;