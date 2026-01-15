import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { SparklesIcon } from '../../icons/SparklesIcon';
import { formatCurrency } from '../../../utils/formatters';

interface CashFlowForecastWidgetProps {
    forecast: {
        forecasts: {
            period: string;
            inflow: number;
            outflow: number;
            netCashFlow: number;
        }[];
        analysis: string;
    } | null;
    isLoading: boolean;
}

const CashFlowForecastWidget: React.FC<CashFlowForecastWidgetProps> = ({ forecast, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <SparklesIcon className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Generando pronóstico...</p>
                </div>
            </div>
        );
    }

    if (!forecast) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('cashFlowForecast')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">{forecast.analysis}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {forecast.forecasts.map(f => (
                    <div key={f.period} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">{f.period}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Entrada: {formatCurrency(f.inflow)}</p>
                        <p className="text-xs text-rose-600 dark:text-rose-400">Salida: {formatCurrency(f.outflow)}</p>
                        <p className={`text-md font-bold mt-1 ${f.netCashFlow >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-rose-500'}`}>
                            Neto: {formatCurrency(f.netCashFlow)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CashFlowForecastWidget;