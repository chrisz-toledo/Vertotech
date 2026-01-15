import React, { useMemo } from 'react';
import type { GlobalSearchResultItem } from '../../types';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { usePeekPanel } from '../../hooks/usePeekPanel';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { UserIcon } from '../icons/UserIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { TicketIcon } from '../icons/new/TicketIcon';
import { ToolboxIconSimple } from '../icons/new/ToolboxIcon';
import { BoxIcon } from '../icons/new/BoxIcon';
import { InvoiceIcon } from '../icons/new/InvoiceIcon';

const getIconForType = (type: GlobalSearchResultItem['type']) => {
    switch (type) {
        case 'employee': return <UserIcon className="w-5 h-5 text-blue-500" />;
        case 'client': return <BuildingIcon className="w-5 h-5 text-sky-500" />;
        case 'jobsite': return <LocationMarkerIcon className="w-5 h-5 text-purple-500" />;
        case 'ticket': return <TicketIcon className="w-5 h-5 text-amber-500" />;
        case 'tool': return <ToolboxIconSimple className="w-5 h-5 text-gray-500" />;
        case 'material': return <BoxIcon className="w-5 h-5 text-lime-500" />;
        case 'invoice': return <InvoiceIcon className="w-5 h-5 text-emerald-500" />;
        default: return <SearchIcon className="w-5 h-5 text-gray-400" />;
    }
};

const ResultItem: React.FC<{ item: GlobalSearchResultItem; onClick: () => void }> = ({ item, onClick }) => (
    <li onClick={onClick}>
        <div className="p-3 flex items-start gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mt-1">
                {getIconForType(item.type)}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.details}</p>
                <div className="mt-1 flex items-start gap-1 text-xs italic text-violet-700 dark:text-violet-400">
                    <SparklesIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{item.matchReason}</span>
                </div>
            </div>
        </div>
    </li>
);

interface GlobalSearchDropdownProps {
  onClose: () => void;
}

export const GlobalSearchDropdown: React.FC<GlobalSearchDropdownProps> = ({ onClose }) => {
    const { isGlobalSearchLoading, globalSearchResults: results } = useAiStore();
    const { setCurrentView } = useAppStore();
    const { open: openPeekPanel } = usePeekPanel();
    const { employees, clients } = usePeopleStore.getState();

    const handleResultClick = (item: GlobalSearchResultItem) => {
        switch (item.type) {
            case 'employee': {
                const employee = employees.find(e => e.id === item.id);
                if (employee) openPeekPanel('employee', { employee });
                else setCurrentView('employees');
                break;
            }
            case 'client': {
                const client = clients.find(c => c.id === item.id);
                if (client) openPeekPanel('client', { client });
                else setCurrentView('clients');
                break;
            }
            case 'jobsite': setCurrentView('jobsites'); break;
            case 'ticket': setCurrentView('extra-work'); break;
            case 'tool': setCurrentView('inventory'); break;
            case 'material': setCurrentView('inventory'); break;
            case 'invoice': setCurrentView('invoices'); break;
            default: break;
        }
        onClose();
    };

    const groupedResults = useMemo(() => {
        if (!Array.isArray(results)) return {};
        return results.reduce((acc, item) => {
            const type = item.type;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(item);
            return acc;
        }, {} as Record<string, GlobalSearchResultItem[]>);
    }, [results]);

    return (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-2 max-h-[60vh] overflow-y-auto">
            {isGlobalSearchLoading && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Buscando...</div>
            )}
            {!isGlobalSearchLoading && results && results.length > 0 && (
                <ul>
                    {Object.entries(groupedResults).map(([type, items]: [string, GlobalSearchResultItem[]]) => (
                        <li key={type}>
                            <h3 className="px-3 py-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{type}s</h3>
                            <ul className="space-y-1">
                                {items.map(item => (
                                    <ResultItem key={`${item.type}-${item.id}`} item={item} onClick={() => handleResultClick(item)} />
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
             {!isGlobalSearchLoading && (!results || results.length === 0) && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">No se encontraron resultados.</div>
             )}
        </div>
    );
};