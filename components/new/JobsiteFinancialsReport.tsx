
import React, { useState, useMemo } from 'react';
import * as geminiService from '../../services/geminiService';
import { formatCurrency } from '../../utils/formatters';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import { AIGeneratedContentModal } from './AIGeneratedContentModal';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import type { Employee, ExtraWorkTicket, DailyLog, WeekHours, DailyHours, Jobsite } from '../../types';


const JobsiteFinancialsReport: React.FC = () => {
    const [aiContent, setAIContent] = useState<{ isOpen: boolean, isLoading: boolean, title: string, content: string }>({ isOpen: false, isLoading: false, title: '', content: '' });

    const { employees } = usePeopleStore();
    const { expenses } = useFinanceStore();
    const { jobsites, timeLogs, extraWorkTickets } = useOperationsStore();

    const financialsData = useMemo(() => {
        const employeeMap = new Map<string, Employee>(employees.map(e => [e.id, e]));

        return jobsites.map(jobsite => {
            const { labor = 0, materials = 0, subcontractors = 0, miscellaneous = 0 } = jobsite.budget || {};
            const totalBudget = labor + materials + subcontractors + miscellaneous;

            const laborCost = timeLogs
                .filter(log => log.jobsiteId === jobsite.id)
                .reduce((total: number, log) => total + Object.entries(log.employeeHours).reduce((logTotal: number, [empId, week]) => {
                    const employee = employeeMap.get(empId);
                    if (!employee) return logTotal;
                    const reg = Object.values(week).reduce((s: number, d: DailyHours) => s + d.regular, 0);
                    const ot = Object.values(week).reduce((s: number, d: DailyHours) => s + d.overtime, 0);
                    return logTotal + (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
                }, 0), 0);
            
            const materialCost = expenses.filter(ex => ex.jobsiteId === jobsite.id && ex.category.toLowerCase().includes('material')).reduce((sum: number, ex) => sum + ex.amount, 0);
            const subcontractorCost = expenses.filter(ex => ex.jobsiteId === jobsite.id && ex.category.toLowerCase().includes('subcontractor')).reduce((sum: number, ex) => sum + ex.amount, 0);
            const otherCost = expenses.filter(ex => ex.jobsiteId === jobsite.id && !ex.category.toLowerCase().includes('material') && !ex.category.toLowerCase().includes('subcontractor')).reduce((sum: number, ex) => sum + ex.amount, 0);
            
            const actuals = {
                labor: laborCost,
                materials: materialCost,
                subcontractors: subcontractorCost,
                other: otherCost,
                total: laborCost + materialCost + subcontractorCost + otherCost,
            };
            
            const extraRevenue = extraWorkTickets
                .filter(t => t.jobsiteId === jobsite.id && t.status === 'approved')
                .reduce((sum: number, t) => sum + t.costImpact, 0);
            
            const variance = totalBudget - actuals.total;

            return {
                jobsite,
                budget: totalBudget,
                actuals,
                variance,
                extraRevenue,
            };
        }).filter(data => data.budget > 0 || data.actuals.total > 0);
    }, [employees, expenses, jobsites, timeLogs, extraWorkTickets]);
    
    const handleGenerateSummary = async (data: any) => {
        setAIContent({ isOpen: true, isLoading: true, title: `Financial Summary for ${data.jobsiteAddress}`, content: '' });
        try {
            const summary = await geminiService.generateProfitabilityAnalysis(data);
            setAIContent(prev => ({ ...prev, isLoading: false, content: summary }));
        } catch (error) {
            setAIContent(prev => ({ ...prev, isLoading: false, content: 'Error generating summary.' }));
        }
    };

    return (
        <>
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Jobsite Financial Analysis</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Compare actual costs against budget and analyze the financial health of each project.</p>
            </div>
             <div className="overflow-x-auto bg-white dark:bg-gray-800 p-0 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {financialsData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Jobsite</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actual Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Variance</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Extra Revenue</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {financialsData.map(data => (
                                <tr key={data.jobsite.id}>
                                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{data.jobsite.address}</td>
                                    <td className="px-4 py-4 text-right font-mono">{formatCurrency(data.budget)}</td>
                                    <td className="px-4 py-4 text-right font-mono">{formatCurrency(data.actuals.total)}</td>
                                    <td className={`px-4 py-4 text-right font-mono font-semibold ${data.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(data.variance)}</td>
                                    <td className="px-4 py-4 text-right font-mono text-blue-600">{formatCurrency(data.extraRevenue)}</td>
                                    <td className="px-4 py-4 text-center">
                                        <button 
                                            onClick={() => handleGenerateSummary({
                                                jobsiteAddress: data.jobsite.address,
                                                budget: data.budget,
                                                actuals: data.actuals,
                                                variance: data.variance,
                                                extraRevenue: data.extraRevenue
                                            })}
                                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                                            title="Generate AI Summary"
                                        >
                                            <SparklesIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16 px-6">
                        <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Jobsite Data</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Ensure you have jobsites with budgets and associated costs.</p>
                    </div>
                )}
            </div>
        </div>
        <AIGeneratedContentModal 
            {...aiContent} 
            icon={<BrainCircuitIcon className="w-6 h-6 text-purple-600"/>} 
            onClose={() => setAIContent(prev => ({...prev, isOpen: false}))} 
        />
        </>
    );
};

export default JobsiteFinancialsReport;
