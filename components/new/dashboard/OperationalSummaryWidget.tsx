import React, { useState, useMemo } from 'react';
import type { Jobsite, Tool } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import { ClipboardListIcon } from '../../icons/new/ClipboardListIcon';

interface OperationalSummaryWidgetProps {
    jobsites: Jobsite[];
    tools: Tool[];
}

const OperationalSummaryWidget: React.FC<OperationalSummaryWidgetProps> = ({ jobsites, tools }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'projects' | 'inventory'>('projects');

    const summaries = useMemo(() => {
        const projectStatusCounts = {
            in_progress: jobsites.filter(j => j.status === 'in_progress').length,
            on_hold: jobsites.filter(j => j.status === 'on_hold').length,
            completed: jobsites.filter(j => j.status === 'completed').length,
        };

        const toolStatusCounts = {
            in_maintenance: tools.filter(t => t.status === 'in_maintenance'),
            broken: tools.filter(t => t.status === 'broken'),
        };

        return { projectStatusCounts, toolStatusCounts };
    }, [jobsites, tools]);

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg flex flex-col h-full">
            <div className="p-4 flex items-center gap-3 border-b border-slate-300/30 dark:border-slate-700/30">
                <ClipboardListIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('operationalStatus')}</h3>
            </div>
            <div className="p-2 border-b border-slate-300/30 dark:border-slate-700/30">
                <div className="flex bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-1">
                    <button onClick={() => setActiveTab('projects')} className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${activeTab === 'projects' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500 hover:bg-white/50'}`}>{t('projects')}</button>
                    <button onClick={() => setActiveTab('inventory')} className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500 hover:bg-white/50'}`}>{t('inventory')}</button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {activeTab === 'projects' && (
                    <div className="space-y-3">
                        {Object.entries(summaries.projectStatusCounts).map(([status, count]) => (
                            <div key={status} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{t(status as any)}</span>
                                <span className="font-bold text-gray-800 dark:text-gray-100">{count}</span>
                            </div>
                        ))}
                         {Object.values(summaries.projectStatusCounts).every(v => v === 0) && <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">{t('noProjects')}</p>}
                    </div>
                )}
                 {activeTab === 'inventory' && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('toolsAttention')}</p>
                         {summaries.toolStatusCounts.in_maintenance.map(tool => (
                            <div key={tool.id} className="text-sm"><span className="font-medium text-amber-700 dark:text-amber-400">{t('inMaintenance')}:</span> {tool.name}</div>
                         ))}
                         {summaries.toolStatusCounts.broken.map(tool => (
                             <div key={tool.id} className="text-sm"><span className="font-medium text-rose-700 dark:text-rose-400">{t('broken')}:</span> {tool.name}</div>
                         ))}
                         {summaries.toolStatusCounts.in_maintenance.length === 0 && summaries.toolStatusCounts.broken.length === 0 && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">{t('noToolsAttention')}</p>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationalSummaryWidget;