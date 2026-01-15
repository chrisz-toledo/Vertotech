import React, { useMemo } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatCurrency } from '../../../utils/formatters';
import { ChartPieIcon } from '../../icons/new/ChartPieIcon';
import { useFinanceStore } from '../../../hooks/stores/useFinanceStore';
import { useAppStore, DashboardDateRange } from '../../../hooks/stores/useAppStore';

const getStartDate = (range: DashboardDateRange): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
        case 'week':
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(today.setDate(diff));
        case 'month':
            return new Date(today.getFullYear(), today.getMonth(), 1);
        case 'last30days':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return thirtyDaysAgo;
    }
};

const FinancialSummaryWidget: React.FC = () => {
    const { t } = useTranslation();
    const { invoices, expenses, payables } = useFinanceStore();
    const { dashboardDateRange } = useAppStore();

    const summary = useMemo(() => {
        const today = new Date();
        const startDate = getStartDate(dashboardDateRange);

        const dateFilter = (item: { date?: string; issueDate?: string }) => {
            const itemDate = new Date((item.date || item.issueDate) + 'T00:00:00Z');
            return itemDate >= startDate && itemDate <= today;
        };

        const revenue = invoices
            .filter(inv => inv.status === 'paid' && dateFilter(inv))
            .reduce((sum, inv) => sum + inv.total, 0);

        const accountsReceivable = invoices
            .filter(inv => inv.status === 'sent' || (inv.status !== 'paid' && new Date(inv.dueDate + 'T00:00:00Z') >= today))
            .reduce((sum, inv) => sum + inv.total, 0);
            
        const accountsPayable = payables
            .filter(p => p.status !== 'paid')
            .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

        const totalExpenses = expenses.filter(dateFilter).reduce((sum, exp) => sum + exp.amount, 0);

        return { revenue, accountsReceivable, accountsPayable, totalExpenses };
    }, [invoices, expenses, payables, dashboardDateRange]);

    const chartData = [
        { name: t('revenue'), value: summary.revenue },
        { name: t('expenses'), value: summary.totalExpenses },
    ];
    const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

    const rangeLabels = {
        week: `(${t('This Week')})`,
        month: `(${t('This Month')})`,
        last30days: `(${t('Last 30 Days')})`,
    };

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <ChartPieIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('financialSummary')} <span className="text-sm font-normal text-gray-500">{rangeLabels[dashboardDateRange]}</span></h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-900/50 rounded-lg">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('revenue')}</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.revenue)}</p>
                </div>
                <div className="p-4 bg-rose-50/70 dark:bg-rose-900/50 rounded-lg">
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{t('expenses')}</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div className="p-4 bg-sky-50/70 dark:bg-sky-900/50 rounded-lg">
                    <p className="text-sm font-medium text-sky-700 dark:text-sky-300">{t('accountsReceivable')}</p>
                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{formatCurrency(summary.accountsReceivable)}</p>
                </div>
                <div className="p-4 bg-amber-50/70 dark:bg-amber-900/50 rounded-lg">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('accountsPayable')}</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.accountsPayable)}</p>
                </div>
            </div>
            <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('revenue')} vs {t('expenses')} {rangeLabels[dashboardDateRange]}</h4>
                <div className="space-y-2">
                    {chartData.map(item => (
                        <div key={item.name} className="flex items-center gap-3">
                            <span className="w-24 text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                            <div className="flex-grow bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full ${item.name === t('revenue') ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    style={{ width: `${(item.value / maxChartValue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinancialSummaryWidget;