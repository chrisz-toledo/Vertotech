import React from 'react';
import type { Alert } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import { BellIcon } from '../../icons/new/BellIcon';
import { AlertCircleIcon } from '../../icons/new/AlertCircleIcon';
import { SparklesIcon } from '../../icons/SparklesIcon';

interface AlertsWidgetProps {
    alerts: Alert[];
    onGenerateAlerts: () => void;
    isLoading: boolean;
}

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
    const severityClasses = {
        info: 'bg-sky-50/70 dark:bg-sky-900/50 border-sky-200/50 dark:border-sky-700/50 text-sky-800 dark:text-sky-200',
        warning: 'bg-amber-50/70 dark:bg-amber-900/50 border-amber-200/50 dark:border-amber-700/50 text-amber-800 dark:text-amber-300',
        critical: 'bg-rose-50/70 dark:bg-rose-900/50 border-rose-200/50 dark:border-rose-700/50 text-rose-800 dark:text-rose-300',
    };
    const iconColor = {
        info: 'text-sky-500',
        warning: 'text-amber-500',
        critical: 'text-rose-500',
    }

    return (
        <div className={`p-3 rounded-lg border flex items-start gap-3 ${severityClasses[alert.severity]}`}>
            <AlertCircleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor[alert.severity]}`} />
            <p className="text-sm">{alert.message}</p>
        </div>
    );
};

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, onGenerateAlerts, isLoading }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('alerts')}</h3>
                </div>
                <button
                    onClick={onGenerateAlerts}
                    disabled={isLoading}
                    className="glass-button !py-2 !px-4 !bg-violet-600/50 hover:!bg-violet-700/70"
                >
                    <SparklesIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? t('generating') : t('generateAlerts')}</span>
                </button>
            </div>
            <div className="mt-4 min-h-[150px] p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 flex flex-col justify-center">
                {isLoading ? (
                     <div className="flex items-center justify-center h-full">
                        <SparklesIcon className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : alerts.length > 0 ? (
                    <div className="space-y-3">
                        {alerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <p className="font-medium">{t('noAlerts')}</p>
                        <p className="text-sm">{t('alertsDescription')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsWidget;