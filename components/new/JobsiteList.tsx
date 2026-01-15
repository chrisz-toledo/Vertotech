import React, { useState, useMemo } from 'react';
import type { Client, Jobsite, JobsiteStatus, Employee, TimeLog, Expense, ExtraWorkTicket } from '../../types';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { formatCurrency } from '../../utils/formatters';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useTranslation } from '../../hooks/useTranslation';
import { TicketIcon } from '../icons/new/TicketIcon';
import { CreditCardIcon } from '../icons/new/CreditCardIcon';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useModalManager } from '../../hooks/useModalManager';
import * as geminiService from '../../services/geminiService';


const JobsiteStatusBadge: React.FC<{ status: JobsiteStatus }> = ({ status }) => {
    const statusInfo = {
        not_started: { text: 'Aún sin empezar', className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' },
        in_progress: { text: 'En Progreso', className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
        on_hold: { text: 'Suspendido', className: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300' },
        completed: { text: 'Terminado', className: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' },
        cancelled: { text: 'Cancelado', className: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300' },
    };
    const { text, className } = statusInfo[status] || statusInfo.not_started;
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
};

const HealthScoreIndicator: React.FC<{ score: number; analysis: string }> = ({ score, analysis }) => {
    const getColor = () => {
        if (score > 80) return 'bg-emerald-500';
        if (score > 60) return 'bg-lime-500';
        if (score > 40) return 'bg-amber-500';
        return 'bg-rose-500';
    };
    return (
        <div className="group relative flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getColor()}`}></div>
            <span className="text-sm font-semibold">{score}/100</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {analysis}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 h-3 bg-gray-800 transform rotate-45 -mb-1.5"></div>
            </div>
        </div>
    );
};

interface JobsiteCardProps {
    jobsite: Jobsite;
    actualCosts: {
        labor: number;
        materials: number;
        subcontractors: number;
        miscellaneous: number;
        changeOrders: number;
        total: number;
    };
}

const BudgetRow: React.FC<{ label: string, budget: number, actual: number }> = ({ label, budget, actual }) => {
    if (budget === 0 && actual === 0) return null;
    const isOver = actual > budget && budget > 0;
    return (
        <div className="flex justify-between items-baseline text-xs">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className={`font-medium ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300'}`}>{formatCurrency(actual)}</span>
                <span className="text-gray-400 dark:text-gray-500">/ {formatCurrency(budget)}</span>
            </div>
        </div>
    )
};

const JobsiteCard: React.FC<JobsiteCardProps> = ({ jobsite, actualCosts }) => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { confirm } = useAppStore(state => ({ confirm: state.confirm }));
    const { getClientProgressSummary } = useAiStore();
    const { deleteJobsite } = useOperationsStore();

    const totalBudget = Object.values(jobsite.budget).reduce((sum, val) => sum + val, 0);
    const budgetProgress = totalBudget > 0 ? (actualCosts.total / totalBudget) * 100 : 0;
    const progressColor = budgetProgress > 100 ? 'bg-rose-500' : budgetProgress > 80 ? 'bg-amber-500' : 'bg-emerald-500';

    const onEdit = () => openModal('jobsite', { jobsite });
    const onDeleteRequest = () => confirm({ title: 'Eliminar Sitio', message: `¿Mover ${jobsite.address} a la papelera?`, onConfirm: () => deleteJobsite([jobsite.id]) });
    const onGenerateClientSummary = () => {
        getClientProgressSummary(jobsite.id);
        openModal('aiContent');
    };

    return (
        <li className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="p-4 flex-grow">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-start gap-3 flex-grow">
                        <LocationMarkerIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <p className="text-gray-800 dark:text-gray-100">{jobsite.address}</p>
                            <div className="mt-2 flex items-center gap-4">
                                <JobsiteStatusBadge status={jobsite.status} />
                                {jobsite.healthScore && <HealthScoreIndicator score={jobsite.healthScore.score} analysis={jobsite.healthScore.analysis} />}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button onClick={onGenerateClientSummary} title="Generar Resumen para Cliente" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-accent dark:hover:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors">
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onEdit} title="Editar Sitio de Trabajo" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onDeleteRequest} title="Eliminar Sitio de Trabajo" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {totalBudget > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto</span>
                            <span className="text-sm">
                                <span className={`font-bold ${budgetProgress > 100 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-800 dark:text-gray-200'}`}>{formatCurrency(actualCosts.total)}</span> / {formatCurrency(totalBudget)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(budgetProgress, 100)}%` }}></div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                            <BudgetRow label="Mano de Obra" budget={jobsite.budget.labor} actual={actualCosts.labor} />
                            <BudgetRow label="Materiales" budget={jobsite.budget.materials} actual={actualCosts.materials} />
                            <BudgetRow label="Subcontratistas" budget={jobsite.budget.subcontractors} actual={actualCosts.subcontractors} />
                            <BudgetRow label="Órdenes de Cambio" budget={0} actual={actualCosts.changeOrders} />
                            <BudgetRow label="Misceláneos" budget={jobsite.budget.miscellaneous} actual={actualCosts.miscellaneous} />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex items-center justify-end gap-2">
                 <button onClick={() => openModal('extraWorkTicket', { prefillData: { clientId: jobsite.clientId, jobsiteId: jobsite.id } })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900">
                    <TicketIcon className="w-4 h-4" /> {t('newTicket')}
                </button>
                 <button onClick={() => openModal('expense', { prefillData: { jobsiteId: jobsite.id } })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/50 rounded-md hover:bg-cyan-200 dark:hover:bg-cyan-900">
                    <CreditCardIcon className="w-4 h-4" /> {t('addExpense')}
                </button>
            </div>
        </li>
    );
};

const JobsiteList: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { jobsites, timeLogs, extraWorkTickets, setJobsites } = useOperationsStore();
    const { expenses } = useFinanceStore();
    const { employees, clients } = usePeopleStore();
    
    const companyClientsExist = useMemo(() => clients.filter(c => c.type === 'company').length > 0, [clients]);
    
    const jobsitesByClient = useMemo(() => {
        const clientMap = new Map<string, Client>(clients.map(c => [c.id, c]));
        const employeeMap = new Map<string, Employee>(employees.map(e => [e.id, e]));
        const groups = new Map<string, { client: Client; jobsitesWithCost: { jobsite: Jobsite; actualCosts: any }[] }>();

        jobsites.forEach(jobsite => {
            const client = clientMap.get(jobsite.clientId);
            if (client && client.type === 'company') {
                if (!groups.has(client.id)) {
                    groups.set(client.id, { client, jobsitesWithCost: [] });
                }
                
                const laborCost = timeLogs
                    .filter(log => log.jobsiteId === jobsite.id)
                    .reduce((total, log) => {
                        return total + Object.entries(log.employeeHours).reduce((logTotal, [empId, week]) => {
                            const employee = employeeMap.get(empId);
                            if (!employee) return logTotal;
                            const reg = Object.values(week).reduce((s, d) => s + d.regular, 0);
                            const ot = Object.values(week).reduce((s, d) => s + d.overtime, 0);
                            return logTotal + (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
                        }, 0);
                    }, 0);
                
                const materialCost = expenses.filter(ex => ex.jobsiteId === jobsite.id && ex.category === 'Materials').reduce((sum, ex) => sum + ex.amount, 0);
                const subcontractorCost = expenses.filter(ex => ex.jobsiteId === jobsite.id && ex.category === 'Subcontractor').reduce((sum, ex) => sum + ex.amount, 0);
                const miscCost = expenses.filter(ex => ex.jobsiteId === jobsite.id && !['Materials', 'Subcontractor'].includes(ex.category)).reduce((sum, ex) => sum + ex.amount, 0);
                const changeOrderCost = extraWorkTickets.filter(t => t.jobsiteId === jobsite.id && t.status === 'approved').reduce((sum, t) => sum + t.costImpact, 0);
                
                const actualCosts = {
                    labor: laborCost,
                    materials: materialCost,
                    subcontractors: subcontractorCost,
                    miscellaneous: miscCost,
                    changeOrders: changeOrderCost,
                    total: laborCost + materialCost + subcontractorCost + miscCost,
                };
                
                groups.get(client.id)!.jobsitesWithCost.push({ jobsite, actualCosts });
            }
        });
        return Array.from(groups.values());
    }, [clients, employees, jobsites, timeLogs, expenses, extraWorkTickets]);

    const handleAnalyzeHealth = async () => {
        setIsAnalyzing(true);
        try {
            const healthData = await geminiService.calculateProjectHealthScores(jobsites, timeLogs, expenses, employees, extraWorkTickets);
            const healthMap = new Map(healthData.map(h => [h.id, h.healthScore]));
            const updated = jobsites.map(j => healthMap.has(j.id) ? { ...j, healthScore: healthMap.get(j.id) } : j);
            setJobsites(updated);
        } catch (error) {
            console.error("Error analyzing project health", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('jobsites')}</h2>
                <button 
                    onClick={() => openModal('jobsite')} 
                    disabled={!companyClientsExist}
                    title={!companyClientsExist ? "Debe crear un cliente de tipo 'Compañía' primero" : t('addJobsite')}
                    className="glass-button !bg-indigo-600/50 hover:!bg-indigo-700/70 disabled:!bg-gray-400/50 disabled:cursor-not-allowed"
                >
                    <LocationMarkerIcon className="w-5 h-5" />
                    <span>{t('addJobsite')}</span>
                </button>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('projectHealth')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Utilice la IA para evaluar el riesgo y el rendimiento de sus proyectos en progreso.</p>
                </div>
                <button onClick={handleAnalyzeHealth} disabled={isAnalyzing} className="glass-button !bg-accent/50 hover:!bg-accent-hover/70 disabled:!bg-cyan-400/50">
                    <SparklesIcon className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? t('analyzing') : t('analyzeHealth')}</span>
                </button>
            </div>

            {jobsitesByClient.length > 0 ? (
                jobsitesByClient.map(({ client, jobsitesWithCost }) => (
                    <div key={client.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <BuildingIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                            <h3 className="text-xl font-bold text-sky-700 dark:text-sky-400">{client.name}</h3>
                        </div>
                        <ul className="space-y-3">
                            {jobsitesWithCost.map(({ jobsite, actualCosts }) => (
                                <JobsiteCard key={jobsite.id} jobsite={jobsite} actualCosts={actualCosts} />
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <LocationMarkerIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Sitios de Trabajo</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada un nuevo sitio de trabajo para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default JobsiteList;