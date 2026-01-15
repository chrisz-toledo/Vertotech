import React, { useState } from 'react';
import { generateDailySummary } from '../../../services/geminiService';
import { SparklesIcon } from '../../icons/SparklesIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import { WandIcon } from '../../icons/new/WandIcon';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../../hooks/stores/useOperationsStore';
import { useFinanceStore } from '../../../hooks/stores/useFinanceStore';

const parseMarkdownList = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
        .replace(/^\* (.*$)/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/(<li>.*<\/li>)+/gm, (match) => `<ul class="space-y-1">${match}</ul>`);
};

const MorningBriefingWidget: React.FC = () => {
    const { t } = useTranslation();
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { employees } = usePeopleStore();
    const { attendanceRecords, extraWorkTickets, tools, timeLogs } = useOperationsStore();
    const { invoices } = useFinanceStore();

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setSummary(null);
        try {
            const openTickets = extraWorkTickets.filter(t => t.status === 'pending');
            const toolsInMaintenance = tools.filter(t => t.status === 'in_maintenance');
            const result = await generateDailySummary(employees, attendanceRecords, openTickets, toolsInMaintenance, invoices, timeLogs, new Date());
            setSummary(result);
        } catch (error) {
            console.error(error);
            setSummary("No se pudo generar el resumen. Inténtelo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('morningBriefing')}</h3>
                <button
                    onClick={handleGenerateSummary}
                    disabled={isLoading}
                    className="glass-button !bg-violet-600/50 hover:!bg-violet-700/70"
                >
                    <WandIcon className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                    <span>{isLoading ? 'Generando...' : t('getSummary')}</span>
                </button>
            </div>
            <div className="mt-4 min-h-[100px] p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <SparklesIcon className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : summary ? (
                    <div
                        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2"
                        dangerouslySetInnerHTML={{ __html: parseMarkdownList(summary) }}
                    />
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 pt-6">El resumen de Rachy para el día aparecerá aquí.</p>
                )}
            </div>
        </div>
    );
};
export default MorningBriefingWidget;