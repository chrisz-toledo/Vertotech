import React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useModalManager } from '../../../../hooks/useModalManager';
import { useAppStore } from '../../../../hooks/stores/useAppStore';
import { SparklesIcon } from '../../../icons/SparklesIcon';
import { ClockIcon } from '../../../icons/ClockIcon';
import { ShieldCheckIcon } from '../../../icons/new/ShieldCheckIcon';

const QuickActionsWidget: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { setCurrentView } = useAppStore();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('quickActions')}</h3>
            </div>
            <div className="space-y-3">
                <button 
                    onClick={() => openModal('timeLog')}
                    className="w-full flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                    <ClockIcon className="w-6 h-6" />
                    <span className="font-semibold">{t('time-tracking')}</span>
                </button>
                <button 
                    onClick={() => setCurrentView('safety')}
                    className="w-full flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                >
                    <ShieldCheckIcon className="w-6 h-6" />
                    <span className="font-semibold">Crear Reporte de Seguridad</span>
                </button>
            </div>
        </div>
    );
};

export default QuickActionsWidget;