import React, { useState, useMemo, useEffect } from 'react';
import type { TrashableType, Client, Jobsite } from '../types';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useCrmStore } from '../hooks/stores/useCrmStore';
import { useFinanceStore } from '../hooks/stores/useFinanceStore';
import { useOperationsStore } from '../hooks/stores/useOperationsStore';
import { useTranslation } from '../hooks/useTranslation';


import { TrashIcon } from './icons/TrashIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TicketIcon } from './icons/new/TicketIcon';
import { InvoiceIcon } from './icons/new/InvoiceIcon';
import { ToolboxIconSimple } from './icons/new/ToolboxIcon';
import { BoxIcon } from './icons/new/BoxIcon';
import { CreditCardIcon } from './icons/new/CreditCardIcon';
import { ReceiptIcon } from './icons/new/ReceiptIcon';
import { ShoppingCartIcon } from './icons/new/ShoppingCartIcon';
import { CashIcon } from './icons/new/CashIcon';
import { GanttChartIcon } from './icons/new/GanttChartIcon';
import { FileSignatureIcon } from './icons/new/FileSignatureIcon';
import { ChartBarIcon } from './icons/new/ChartBarIcon';
import { GavelIcon } from './icons/new/GavelIcon';
import { ChecklistIcon } from './icons/new/ChecklistIcon';
import { TruckIcon } from './icons/new/TruckIcon';
import { CalculatorIcon } from './icons/new/CalculatorIcon';
import { ScaleIcon } from './icons/new/ScaleIcon';
import { PriceTagIcon } from './icons/new/PriceTagIcon';
import { BullhornIcon } from './icons/new/BullhornIcon';
import { HandshakeIcon } from './icons/new/HandshakeIcon';
import { SupplierIcon } from './icons/new/SupplierIcon';
import { BookOpenIcon } from './icons/new/BookOpenIcon';
import { MegaphoneIcon } from './icons/new/MegaphoneIcon';

interface TrashModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getDaysRemaining = (deletedAt: string | undefined): number => {
    if (!deletedAt) return 0;
    const deletedDate = new Date(deletedAt);
    const thirtyDaysFromDeletion = new Date(deletedDate);
    thirtyDaysFromDeletion.setDate(deletedDate.getDate() + 30);
    const today = new Date();
    const diffTime = thirtyDaysFromDeletion.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const TRASH_CONFIG: Record<TrashableType, { labelKey: any; icon: React.ReactNode; }> = {
    employees: { labelKey: 'employees', icon: <UsersGroupIcon className="w-5 h-5" /> },
    clients: { labelKey: 'clients', icon: <BuildingIcon className="w-5 h-5" /> },
    subcontractors: { labelKey: 'subcontractors', icon: <GanttChartIcon className="w-5 h-5" /> },
    suppliers: { labelKey: 'suppliers', icon: <SupplierIcon className="w-5 h-5" /> },
    prospects: { labelKey: 'prospects', icon: <BullhornIcon className="w-5 h-5" /> },
    opportunities: { labelKey: 'opportunities', icon: <HandshakeIcon className="w-5 h-5" /> },
    jobsites: { labelKey: 'jobsites', icon: <LocationMarkerIcon className="w-5 h-5" /> },
    dailyLogs: { labelKey: 'daily-logs', icon: <BookOpenIcon className="w-5 h-5" /> },
    timeLogs: { labelKey: 'hours', icon: <ClockIcon className="w-5 h-5" /> },
    extraWorkTickets: { labelKey: 'extra-work', icon: <TicketIcon className="w-5 h-5" /> },
    invoices: { labelKey: 'invoices', icon: <InvoiceIcon className="w-5 h-5" /> },
    estimates: { labelKey: 'estimates', icon: <CalculatorIcon className="w-5 h-5" /> },
    legalDocuments: { labelKey: 'legal', icon: <ScaleIcon className="w-5 h-5" /> },
    priceItems: { labelKey: 'prices', icon: <PriceTagIcon className="w-5 h-5" /> },
    tools: { labelKey: 'tools', icon: <ToolboxIconSimple className="w-5 h-5" /> },
    materials: { labelKey: 'materials', icon: <BoxIcon className="w-5 h-5" /> },
    expenses: { labelKey: 'expenses', icon: <CreditCardIcon className="w-5 h-5" /> },
    payables: { labelKey: 'payables', icon: <ReceiptIcon className="w-5 h-5" /> },
    purchaseOrders: { labelKey: 'purchase-orders', icon: <ShoppingCartIcon className="w-5 h-5" /> },
    pettyCash: { labelKey: 'petty-cash', icon: <CashIcon className="w-5 h-5" /> },
    contracts: { labelKey: 'contracts', icon: <FileSignatureIcon className="w-5 h-5" /> },
    productionLogs: { labelKey: 'productivity', icon: <ChartBarIcon className="w-5 h-5" /> },
    bids: { labelKey: 'bids', icon: <GavelIcon className="w-5 h-5" /> },
    punchLists: { labelKey: 'tasks', icon: <ChecklistIcon className="w-5 h-5" /> },
    vehicles: { labelKey: 'fleet', icon: <TruckIcon className="w-5 h-5" /> },
    quoteRequests: { labelKey: 'requestForQuote', icon: <MegaphoneIcon className="w-5 h-5" /> },
};

const DeletedItem: React.FC<{ item: any; config: typeof TRASH_CONFIG[TrashableType]; isSelected: boolean; onToggle: () => void; details?: string }> = ({ item, config, isSelected, onToggle, details }) => {
    const { t } = useTranslation();
    const days = getDaysRemaining(item.deletedAt);
    return (
        <li className="flex items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <input type="checkbox" checked={isSelected} onChange={onToggle} className="h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0 mr-4"/>
            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">{config.icon}</div>
            <div className="ml-4 flex-grow">
                <p className="font-semibold">{item.name || item.address || item.title || item.description || `ID: ${item.id}`}</p>
                {details && <p className="text-sm text-gray-500 dark:text-gray-400">{details}</p>}
                <p className={`text-sm ${days < 7 ? 'text-rose-600 font-medium' : 'text-gray-500'}`}>{t('deletionIn', { days })}</p>
            </div>
        </li>
    );
};

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    
    const peopleState = usePeopleStore();
    const crmState = useCrmStore();
    const financeState = useFinanceStore();
    const operationsState = useOperationsStore();
    
    const { clients } = peopleState;
    const { jobsites } = operationsState;

    const restoreItem = (ids: string[], type: TrashableType) => {
        if (['employees', 'clients', 'subcontractors', 'suppliers'].includes(type)) peopleState.restoreItem(ids, type);
        else if (['prospects', 'opportunities'].includes(type)) crmState.restoreItem(ids, type);
        else if (['invoices', 'estimates', 'priceItems', 'expenses', 'payables', 'purchaseOrders', 'pettyCash', 'quoteRequests'].includes(type)) financeState.restoreItem(ids, type);
        else operationsState.restoreItem(ids, type);
    };

    const permanentlyDeleteItem = (ids: string[], type: TrashableType) => {
        if (['employees', 'clients', 'subcontractors', 'suppliers'].includes(type)) peopleState.permanentlyDeleteItem(ids, type);
        else if (['prospects', 'opportunities'].includes(type)) crmState.permanentlyDeleteItem(ids, type);
        else if (['invoices', 'estimates', 'priceItems', 'expenses', 'payables', 'purchaseOrders', 'pettyCash', 'quoteRequests'].includes(type)) financeState.permanentlyDeleteItem(ids, type);
        else operationsState.permanentlyDeleteItem(ids, type);
    };
    
    const data = useMemo(() => {
        return {
            employees: peopleState.deletedEmployees,
            clients: peopleState.deletedClients,
            subcontractors: peopleState.deletedSubcontractors,
            suppliers: peopleState.deletedSuppliers,
            prospects: crmState.deletedProspects,
            opportunities: crmState.deletedOpportunities,
            jobsites: operationsState.deletedJobsites,
            dailyLogs: operationsState.deletedDailyLogs,
            timeLogs: operationsState.deletedTimeLogs,
            extraWorkTickets: operationsState.deletedExtraWorkTickets,
            invoices: financeState.deletedInvoices,
            estimates: financeState.deletedEstimates,
            legalDocuments: operationsState.deletedLegalDocuments,
            priceItems: financeState.deletedPriceItems,
            tools: operationsState.deletedTools,
            materials: operationsState.deletedMaterials,
            expenses: financeState.deletedExpenses,
            payables: financeState.deletedPayables,
            purchaseOrders: financeState.deletedPurchaseOrders,
            pettyCash: financeState.deletedPettyCash,
            contracts: operationsState.deletedContracts,
            productionLogs: operationsState.deletedProductionLogs,
            bids: operationsState.deletedBids,
            punchLists: operationsState.deletedPunchLists,
            vehicles: operationsState.deletedVehicles,
            quoteRequests: financeState.deletedQuoteRequests,
        };
    }, [peopleState, crmState, financeState, operationsState]);
    
    const tabs = useMemo(() => Object.keys(data).filter(key => data[key as TrashableType]?.length > 0) as TrashableType[], [data]);
    const [activeTab, setActiveTab] = useState<TrashableType>('employees');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const { clientMap, jobsiteMap } = useMemo(() => ({
        clientMap: new Map<string, string>(clients.map((c : Client) => [c.id, c.name])),
        jobsiteMap: new Map<string, string>(jobsites.map((j : Jobsite) => [j.id, j.address])),
    }), [clients, jobsites]);
    
    useEffect(() => {
        if (isOpen) {
            setActiveTab(tabs[0] || 'employees');
        } else {
             setSelectedIds([]);
        }
    }, [isOpen, tabs]);

    useEffect(() => {
        setSelectedIds([]);
    }, [activeTab]);

    const currentItems = data[activeTab] || [];
    const handleToggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIds(e.target.checked ? currentItems.map(item => item.id) : []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b"><div className="flex items-center gap-3"><TrashIcon className="w-6 h-6"/><h2 className="text-xl font-bold">{t('recycleBin')}</h2></div><button onClick={onClose} className="p-1 rounded-full"><XCircleIcon className="w-8 h-8"/></button></header>
                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-56 p-4 border-r overflow-y-auto"><nav className="space-y-1">{Object.entries(TRASH_CONFIG).map(([key, config]) => <button key={key} onClick={() => setActiveTab(key as TrashableType)} className={`w-full flex items-center justify-between gap-2 p-3 text-sm font-semibold rounded-lg text-left transition-colors ${activeTab === key ? `bg-gray-200/50 dark:bg-gray-700/50 text-blue-600 border-blue-600` : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}>{config.icon}{t(config.labelKey)}<span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{data[key as TrashableType]?.length || 0}</span></button>)}</nav></aside>
                    <main className="flex-1 flex flex-col p-4 overflow-hidden">
                        {currentItems.length > 0 ? <>
                            <div className="flex-shrink-0 mb-4 flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border"><input type="checkbox" onChange={handleSelectAll} checked={currentItems.length > 0 && selectedIds.length === currentItems.length} className="h-5 w-5 rounded"/><label className="font-semibold select-none">{t('selectAll')} ({selectedIds.length} / {currentItems.length})</label></div>
                            <ul className="flex-grow space-y-3 overflow-y-auto pr-2">
                                {currentItems.map(item => {
                                    const details = (item as any).clientId ? `${t('clientLabel')}: ${clientMap.get((item as any).clientId) || 'N/A'}` : (item as any).jobsiteId ? `${t('jobsiteLabel')}: ${jobsiteMap.get((item as any).jobsiteId) || 'N/A'}` : undefined;
                                    return <DeletedItem key={item.id} item={item} config={TRASH_CONFIG[activeTab]} isSelected={selectedIds.includes(item.id)} onToggle={() => handleToggleSelect(item.id)} details={details} />;
                                })}
                            </ul>
                        </> : <div className="text-center p-10"><h3 className="text-xl font-semibold">{t('trashEmpty')}</h3><p className="mt-1">{t('categoryEmpty')}</p></div>}
                    </main>
                </div>
                <footer className="p-4 border-t flex justify-end gap-4"><button onClick={() => restoreItem(selectedIds, activeTab)} disabled={selectedIds.length === 0} className="glass-button"><RestoreIcon className="w-5 h-5"/>{t('restore')} ({selectedIds.length})</button><button onClick={() => permanentlyDeleteItem(selectedIds, activeTab)} disabled={selectedIds.length === 0} className="glass-button-destructive"><TrashIcon className="w-5 h-5"/>{t('delete')} ({selectedIds.length})</button></footer>
            </div>
        </div>
    );
};