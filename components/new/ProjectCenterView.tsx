import React, { useState, useMemo, useEffect } from 'react';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { useModalManager } from '../../hooks/useModalManager';
import { useTranslation } from '../../hooks/useTranslation';
import * as geminiService from '../../services/geminiService';
import { TargetIcon } from '../icons/new/TargetIcon';
import { formatCurrency } from '../../utils/formatters';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import type { Jobsite, Employee, ExtraWorkTicket, DailyLog } from '../../types';

const FinancialHealthWidget: React.FC<{ jobsite: Jobsite; financials: { actuals: { total: number } } }> = ({ jobsite, financials }) => {
    const { t } = useTranslation();
    const totalBudget = Object.values(jobsite.budget).reduce((sum, val) => sum + val, 0);
    const progress = totalBudget > 0 ? (financials.actuals.total / totalBudget) * 100 : 0;
    const progressColor = progress > 100 ? 'bg-rose-500' : progress > 85 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold">{t('financialHealth')}</h4>
            <div className="mt-2">
                <div className="flex justify-between text-sm">
                    <span>{t('actual')}</span>
                    <span>{t('budget')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span className={progress > 100 ? 'text-rose-500' : ''}>{formatCurrency(financials.actuals.total)}</span>
                    <span>{formatCurrency(totalBudget)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                    <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const TeamOnSiteWidget: React.FC<{ personnel: Employee[] }> = ({ personnel }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold">{t('teamOnSiteToday')} ({personnel.length})</h4>
            <ul className="text-sm mt-2 space-y-1 max-h-24 overflow-y-auto">
                {personnel.map((p) => <li key={p.id}>{p.name}</li>)}
            </ul>
        </div>
    );
};

const OpenTicketsWidget: React.FC<{ tickets: ExtraWorkTicket[] }> = ({ tickets }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold">{t('openTickets')} ({tickets.length})</h4>
             <ul className="text-sm mt-2 space-y-1 max-h-24 overflow-y-auto">
                {tickets.map((t) => <li key={t.id}>#{t.ticketNumber}: {t.description}</li>)}
            </ul>
        </div>
    );
};

const RecentLogsWidget: React.FC<{ logs: DailyLog[] }> = ({ logs }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold">{t('recentLogs')} ({logs.length})</h4>
            <ul className="text-sm mt-2 space-y-1 max-h-24 overflow-y-auto">
                {logs.map((l) => <li key={l.id}>{new Date(l.date + 'T00:00:00').toLocaleDateString()} - {(l.summary || l.notes).substring(0,30)}...</li>)}
            </ul>
        </div>
    );
};

const ProjectCenterView: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { jobsites, timeLogs, extraWorkTickets, attendanceRecords, dailyLogs } = useOperationsStore();
    const { employees } = usePeopleStore();
    const { expenses } = useFinanceStore();
    const { getOpinions } = useAiStore();

    const [selectedJobsiteId, setSelectedJobsiteId] = useState<string>('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const activeJobsites = useMemo(() => jobsites.filter(j => j.status === 'in_progress'), [jobsites]);

    useEffect(() => {
        if (!selectedJobsiteId && activeJobsites.length > 0) {
            setSelectedJobsiteId(activeJobsites[0].id);
        }
    }, [activeJobsites, selectedJobsiteId]);

    const projectData = useMemo(() => {
        if (!selectedJobsiteId) return null;

        const jobsite = jobsites.find(j => j.id === selectedJobsiteId);
        if (!jobsite) return null;
        
        const employeeMap = new Map<string, Employee>(employees.map(e => [e.id, e]));

        const laborCost = timeLogs.filter(log => log.jobsiteId === selectedJobsiteId).reduce((total, log) => total + Object.entries(log.employeeHours).reduce((logTotal, [empId, week]) => {
            const employee = employeeMap.get(empId);
            if (!employee) return logTotal;
            const reg = Object.values(week).reduce((s, d) => s + d.regular, 0);
            const ot = Object.values(week).reduce((s, d) => s + d.overtime, 0);
            return logTotal + (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
        }, 0), 0);
        
        const expenseCost = expenses.filter(ex => ex.jobsiteId === selectedJobsiteId).reduce((sum, ex) => sum + ex.amount, 0);
        const actuals = { total: laborCost + expenseCost };

        const todayStr = new Date().toISOString().split('T')[0];
        const personnelOnSite = attendanceRecords
            .filter(r => r.jobsiteId === selectedJobsiteId && r.date === todayStr && !r.checkOutTime)
            .map(r => employeeMap.get(r.employeeId)).filter((e): e is Employee => !!e);
            
        const openTickets = extraWorkTickets.filter(t => t.jobsiteId === selectedJobsiteId && t.status !== 'rejected');
        
        const recentLogs = dailyLogs
            .filter(l => l.jobsiteId === selectedJobsiteId)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);

        return { jobsite, financials: { actuals }, personnel: personnelOnSite, openTickets, recentLogs };

    }, [selectedJobsiteId, jobsites, employees, timeLogs, expenses, extraWorkTickets, attendanceRecords, dailyLogs]);
    
    const handleGenerateReport = async () => {
        if (!projectData) return;
        setIsGeneratingReport(true);
        try {
            const report = await geminiService.generateProjectStatusReport({
                jobsiteAddress: projectData.jobsite.address,
                financials: projectData.financials,
                personnel: projectData.personnel,
                openTickets: projectData.openTickets,
                recentLogs: projectData.recentLogs,
            });
            getOpinions(); // Refresh opinions in background
            openModal('aiContent', {
                title: `Reporte Semanal - ${projectData.jobsite.address}`,
                content: report,
                icon: <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
            });
        } catch (error) {
            console.error("Failed to generate report:", error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('project-center')}</h2>
                <select 
                    value={selectedJobsiteId} 
                    onChange={e => setSelectedJobsiteId(e.target.value)}
                    className="w-full sm:w-80 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" disabled>{t('selectProject')}</option>
                    {activeJobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}
                </select>
            </div>
            
            {projectData ? (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700 disabled:bg-violet-400"
                        >
                            <SparklesIcon className={`w-5 h-5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                            <span>{t('generateWeeklyReport')}</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FinancialHealthWidget jobsite={projectData.jobsite} financials={projectData.financials} />
                        <TeamOnSiteWidget personnel={projectData.personnel} />
                        <OpenTicketsWidget tickets={projectData.openTickets} />
                        <RecentLogsWidget logs={projectData.recentLogs} />
                    </div>
                </>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <TargetIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay proyectos activos</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Seleccione un proyecto o vaya a la sección de Sitios para empezar uno nuevo.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectCenterView;