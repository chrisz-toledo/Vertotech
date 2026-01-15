import React, { useMemo, useRef } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../../hooks/stores/useOperationsStore';
import { useFinanceStore } from '../../../hooks/stores/useFinanceStore';
import MorningBriefingWidget from './MorningBriefingWidget';
import LiveStatusWidget from './LiveStatusWidget';
import AlertsWidget from './AlertsWidget';
import StatCard from './StatCard';
import { UsersGroupIcon } from '../../icons/UsersGroupIcon';
import { BuildingIcon } from '../../icons/BuildingIcon';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import FinancialSummaryWidget from './FinancialSummaryWidget';
import ActionItemsWidget from './ActionItemsWidget';
import OperationalSummaryWidget from './OperationalSummaryWidget';
import { ConsideredOpinionsWidget } from '../ConsideredOpinionsWidget';
import { GripVerticalIcon } from '../icons/new/GripVerticalIcon';
import type { DashboardDateRange } from '../../../hooks/stores/useAppStore';


const DateRangeFilter: React.FC = () => {
    const { t } = useTranslation();
    const { dashboardDateRange, setDashboardDateRange } = useAppStore();
    
    const ranges: { key: DashboardDateRange; label: 'This Week' | 'This Month' | 'Last 30 Days' }[] = [
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'last30days', label: 'Last 30 Days' },
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
            {ranges.map(range => (
                <button
                    key={range.key}
                    onClick={() => setDashboardDateRange(range.key)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${dashboardDateRange === range.key ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                    {t(range.label)}
                </button>
            ))}
        </div>
    );
};

const DraggableWidget: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative group">
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-2 bg-gray-200/50 dark:bg-gray-900/50 rounded-full">
                <GripVerticalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            {children}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    
    // State from Stores
    const { widgetOrder, updateWidgetOrder, consideredOpinions, removeConsideredOpinion, loadDemoData, alerts, isAlertsLoading, generateAlerts, setCurrentView } = useAppStore();
    const { employees, clients } = usePeopleStore();
    const { jobsites, tools, extraWorkTickets } = useOperationsStore();
    const { invoices, payables } = useFinanceStore();

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const activeEmployeesCount = useMemo(() => employees.filter(e => e.isActive).length, [employees]);
    const activeClientsCount = useMemo(() => clients.filter(c => c.isActive).length, [clients]);
    const activeProjectsCount = useMemo(() => jobsites.filter(j => j.status === 'in_progress').length, [jobsites]);

    const hasData = employees.length > 0 && clients.length > 0;

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        
        const newOrder = [...widgetOrder];
        const [reorderedItem] = newOrder.splice(dragItem.current, 1);
        newOrder.splice(dragOverItem.current, 0, reorderedItem);
        
        dragItem.current = null;
        dragOverItem.current = null;
        updateWidgetOrder(newOrder);
    };

    const widgets: { [key: string]: React.ReactNode } = {
        briefing: <MorningBriefingWidget />,
        alerts: <AlertsWidget alerts={alerts} onGenerateAlerts={generateAlerts} isLoading={isAlertsLoading} />,
        liveStatus: <LiveStatusWidget />,
        stats: (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCard title={t('activeEmployees')} value={activeEmployeesCount} icon={<UsersGroupIcon className="w-8 h-8" />} color="blue" onClick={() => setCurrentView('employees')} />
                <StatCard title={t('activeClients')} value={activeClientsCount} icon={<BuildingIcon className="w-8 h-8" />} color="sky" onClick={() => setCurrentView('clients')} />
                <StatCard title={t('activeProjects')} value={activeProjectsCount} icon={<BriefcaseIcon className="w-8 h-8" />} color="indigo" onClick={() => setCurrentView('jobsites')}/>
            </div>
        ),
        financial: <FinancialSummaryWidget />,
        actions: <ActionItemsWidget extraWorkTickets={extraWorkTickets} invoices={invoices} payables={payables} />,
        operational: <OperationalSummaryWidget jobsites={jobsites} tools={tools} />,
        opinions: <ConsideredOpinionsWidget opinions={consideredOpinions} onRemoveOpinion={removeConsideredOpinion} />,
    };
    
    if (!hasData) {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">¡Bienvenido a VertoTech!</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Parece que está empezando de cero. ¿Le gustaría cargar datos de demostración para explorar la aplicación?</p>
                <button onClick={loadDemoData} className="mt-6 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    Cargar Datos de Demostración
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <div className="flex justify-end">
                <DateRangeFilter />
            </div>
            {widgetOrder.filter(key => widgets[key]).map((key, index) => (
                <div
                    key={key}
                    draggable
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleDragSort}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <DraggableWidget>{widgets[key]}</DraggableWidget>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;