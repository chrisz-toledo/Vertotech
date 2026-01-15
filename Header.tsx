import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Notification } from './types';
import { useTranslation } from './hooks/useTranslation';
import { useAppStore } from './hooks/stores/useAppStore';
import { usePeopleStore } from './hooks/stores/usePeopleStore';
import { useCrmStore } from './hooks/stores/useCrmStore';
import { useFinanceStore } from './hooks/stores/useFinanceStore';
import { useOperationsStore } from './hooks/stores/useOperationsStore';
import { useAiStore } from './hooks/stores/useAiStore';
import { useModalManager } from './hooks/useModalManager';
import { usePeekPanel } from './hooks/usePeekPanel';
import { GlobalSearchDropdown } from './components/new/GlobalSearchDropdown';

import { UsersGroupIcon } from './components/icons/UsersGroupIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { SlidersIcon } from './components/icons/new/SlidersIcon';
import { BellIcon } from './components/icons/new/BellIcon';
import NotificationsPanel from './components/new/NotificationsPanel';
import { SearchIcon } from './components/icons/SearchIcon';
import { CommandIcon } from './components/icons/new/CommandIcon';
import { PlusIcon } from './components/icons/new/PlusIcon';
import { UserPlusIcon } from './components/icons/UserPlusIcon';
import { BuildingIcon } from './components/icons/BuildingIcon';
import { TicketIcon } from './components/icons/new/TicketIcon';
import { InvoiceIcon } from './components/icons/new/InvoiceIcon';
import { CalculatorIcon } from './components/icons/new/CalculatorIcon';
import { LocationMarkerIcon } from './components/icons/LocationMarkerIcon';
import { HandshakeIcon } from './components/icons/new/HandshakeIcon';
import { BullhornIcon } from './components/icons/new/BullhornIcon';
import { SupplierIcon } from './components/icons/new/SupplierIcon';
import { MegaphoneIcon } from './components/icons/new/MegaphoneIcon';

interface CreateAction {
    labelKey: string;
    action: () => void;
    icon: React.ReactNode;
}

const GlobalSearchInput: React.FC = () => {
    const { t } = useTranslation();
    const { performGlobalSearch, globalSearchResults } = useAiStore();
    const [query, setQuery] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLFormElement>(null);
    const debounceTimeout = useRef<number | null>(null);

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim().length > 2) {
            performGlobalSearch(searchQuery.trim());
        }
    };
    
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        if (query.trim().length > 2) {
            debounceTimeout.current = window.setTimeout(() => {
                handleSearch(query);
            }, 300); // 300ms debounce
        } else {
             useAiStore.setState({ globalSearchResults: null });
             setDropdownOpen(false);
        }

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [query]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [containerRef]);
    
    useEffect(() => {
        if (query.trim().length > 2 && globalSearchResults !== null) {
            setDropdownOpen(true);
        } else if (query.trim().length <= 2) {
            setDropdownOpen(false);
        }
    }, [globalSearchResults, query]);

    return (
        <form ref={containerRef} className="w-full max-w-xl relative" onSubmit={(e) => e.preventDefault()}>
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input 
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if(query.length > 2) setDropdownOpen(true); }}
                placeholder={t('aiSearchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md text-gray-900 dark:text-white border border-white/20 dark:border-gray-700/50 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-md"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-900/50 rounded-md px-1.5 py-0.5 pointer-events-none flex items-center gap-1">
                <CommandIcon className="w-3 h-3"/> K
            </div>
            {isDropdownOpen && <GlobalSearchDropdown onClose={() => setDropdownOpen(false)} />}
        </form>
    );
};


const Header: React.FC = () => {
  const { t } = useTranslation();
  const { open: openModal } = useModalManager();
  const { open: openPeekPanel } = usePeekPanel();
  
  const { companyInfo, notifications, updateNotifications } = useAppStore();
  const peopleState = usePeopleStore();
  const crmState = useCrmStore();
  const financeState = useFinanceStore();
  const operationsState = useOperationsStore();
  
  const unreadCount = useMemo(() => {
      if (!notifications) return 0;
      return notifications.filter(n => !n.read).length;
  }, [notifications]);
  
  const deletedCount = useMemo(() => {
      const p = peopleState;
      const c = crmState;
      const f = financeState;
      const o = operationsState;
      return (p.deletedEmployees?.length || 0) + (p.deletedClients?.length || 0) + (p.deletedSubcontractors?.length || 0) + (p.deletedSuppliers?.length || 0)
           + (c.deletedProspects?.length || 0) + (c.deletedOpportunities?.length || 0)
           + (f.deletedInvoices?.length || 0) + (f.deletedEstimates?.length || 0) + (f.deletedPriceItems?.length || 0) + (f.deletedExpenses?.length || 0) + (f.deletedPayables?.length || 0) + (f.deletedPurchaseOrders?.length || 0) + (f.deletedPettyCash?.length || 0) + (f.deletedQuoteRequests?.length || 0)
           + (o.deletedJobsites?.length || 0) + (o.deletedTimeLogs?.length || 0) + (o.deletedExtraWorkTickets?.length || 0) + (o.deletedTools?.length || 0) + (o.deletedMaterials?.length || 0) + (o.deletedContracts?.length || 0) + (o.deletedProductionLogs?.length || 0) + (o.deletedBids?.length || 0) + (o.deletedPunchLists?.length || 0) + (o.deletedVehicles?.length || 0) + (o.deletedLegalDocuments?.length || 0) + (o.deletedDailyLogs?.length || 0);
  }, [peopleState, crmState, financeState, operationsState]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const createActions: CreateAction[] = [
    { labelKey: 'addEmployee', action: () => openPeekPanel('employee'), icon: <UserPlusIcon className="w-5 h-5" /> },
    { labelKey: 'addClient', action: () => openPeekPanel('client'), icon: <BuildingIcon className="w-5 h-5" /> },
    { labelKey: 'addJobsite', action: () => openModal('jobsite'), icon: <LocationMarkerIcon className="w-5 h-5" /> },
    { labelKey: 'createTicket', action: () => openModal('extraWorkTicket'), icon: <TicketIcon className="w-5 h-5" /> },
    { labelKey: 'addInvoice', action: () => openModal('invoiceDetails', { isManual: true }), icon: <InvoiceIcon className="w-5 h-5" /> },
    { labelKey: 'addEstimate', action: () => openModal('estimate'), icon: <CalculatorIcon className="w-5 h-5" /> },
    { labelKey: 'addProspect', action: () => openModal('prospect'), icon: <BullhornIcon className="w-5 h-5" /> },
    { labelKey: 'addOpportunity', action: () => openModal('opportunity'), icon: <HandshakeIcon className="w-5 h-5" /> },
    { labelKey: 'addSupplier', action: () => openModal('supplier'), icon: <SupplierIcon className="w-5 h-5" /> },
    { labelKey: 'addQuoteRequest', action: () => openModal('quoteRequest'), icon: <MegaphoneIcon className="w-5 h-5" /> },
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [createMenuRef]);


  return (
    <header className="relative text-left mb-6 pt-4">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-start gap-4">
            {companyInfo.logoUrl ? (
              <img src={companyInfo.logoUrl} alt={`${companyInfo.name} Logo`} className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-600 shadow-md object-cover" />
            ) : (
              <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200/60 dark:border-indigo-700/50 shadow-sm">
                <UsersGroupIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
             <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                    {companyInfo.name}
                </h1>
                <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                    {t('poweredBy')} <strong>VertoTech</strong>
                </p>
            </div>
        </div>
      
        <div className="flex items-center gap-2">
            <div className="relative" ref={createMenuRef}>
                {/* FIX: Use glass-button class for consistent styling */}
                <button 
                    onClick={() => setCreateMenuOpen(prev => !prev)}
                    className="glass-button !py-2 !px-4"
                    title={t('createNew')}
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{t('createNew')}</span>
                </button>
                {isCreateMenuOpen && (
                    // FIX: Add popover animation
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50 p-2 animate-popover">
                        <ul className="space-y-1">
                            {createActions.map(action => (
                                <li key={action.labelKey}>
                                    <button 
                                        onClick={() => {
                                            action.action();
                                            setCreateMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 text-left p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
                                    >
                                        <span className="flex-shrink-0 w-5 h-5">{action.icon}</span>
                                        <span className="text-sm font-medium">{t(action.labelKey as any)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="relative">
                <button 
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="relative glass-button-secondary !p-3 !rounded-full"
                title={t('notifications')}
                aria-label={`${t('notifications')}, ${unreadCount} unread`}
                >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-md">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {isNotificationsOpen && (
                <NotificationsPanel
                    notifications={notifications}
                    onClose={() => setIsNotificationsOpen(false)}
                    onUpdateNotifications={updateNotifications}
                />
                )}
            </div>
            <button 
                onClick={() => openModal('trash')} 
                className="relative glass-button-secondary !p-3 !rounded-full"
                title={t('openTrash')}
                aria-label={`${t('openTrash')}, ${deletedCount} items`}
            >
                <TrashIcon className="w-6 h-6" />
                {deletedCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-md">
                        {deletedCount}
                    </span>
                )}
            </button>
             <button 
              onClick={() => openModal('controlPanel')} 
              className="glass-button-secondary !p-3 !rounded-full"
              title={t('settings')}
            >
              <SlidersIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
       <div className="mt-6">
            <GlobalSearchInput />
       </div>
    </header>
  );
};

export default Header;