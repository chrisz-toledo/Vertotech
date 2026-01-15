
import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import TodayScheduleWidget from './components/TodayScheduleWidget';
import MyTasksWidget from './components/MyTasksWidget';
import QuickActionsWidget from './components/QuickActionsWidget';
import MyToolsWidget from './components/MyToolsWidget';
import AssignTaskWidget from './components/AssignTaskWidget';

const MyDayView: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppStore();

    if (!currentUser) {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cargando...</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Por favor, cargue los datos de demostración para ver esta vista.</p>
            </div>
        );
    }
    
    const isManager = ['Foreman', 'Project Manager', 'Owner'].includes(currentUser.job);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('myDay')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Hola, {currentUser.name.split(' ')[0]}. Aquí está tu resumen para hoy.</p>
            </div>

            {isManager && (
                <AssignTaskWidget />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <TodayScheduleWidget />
                    <QuickActionsWidget />
                </div>
                <div className="space-y-6">
                    <MyTasksWidget />
                    <MyToolsWidget />
                </div>
            </div>
        </div>
    );
};

export default MyDayView;