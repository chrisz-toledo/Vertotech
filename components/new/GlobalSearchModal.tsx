import React from 'react';
import type { GlobalSearchResultItem } from '../../types';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { XCircleIcon } from '../icons/XCircleIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { UserIcon } from '../icons/UserIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { TicketIcon } from '../icons/new/TicketIcon';
import { ToolboxIconSimple } from '../icons/new/ToolboxIcon';
import { BoxIcon } from '../icons/new/BoxIcon';
import { InvoiceIcon } from '../icons/new/InvoiceIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

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

const ResultItem: React.FC<{ item: GlobalSearchResultItem }> = ({ item }) => (
    <div className="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                {getIconForType(item.type)}
            </div>
            <div className="flex-grow">
                <p className="font-bold text-gray-800 dark:text-gray-100">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.details}</p>
                <div className="mt-2 flex items-start gap-2 text-xs italic text-violet-700 dark:text-violet-400 p-2 bg-violet-50 dark:bg-violet-900/30 rounded-md">
                    <SparklesIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{item.matchReason}</span>
                </div>
            </div>
        </div>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
        <svg className="animate-spin h-10 w-10 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Buscando en toda la aplicación...</p>
    </div>
);

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
    const { isGlobalSearchLoading, globalSearchQuery, globalSearchResults } = useAiStore();

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center z-50 p-4 pt-20 modal-backdrop" 
            onClick={onClose}
        >
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200 dark:border-gray-700 h-full max-h-[70vh] modal-content"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SearchIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Resultados para: "{globalSearchQuery}"</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                        <XCircleIcon className="w-7 h-7"/>
                    </button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto">
                    {isGlobalSearchLoading ? (
                        <LoadingSpinner />
                    ) : globalSearchResults && globalSearchResults.length > 0 ? (
                        <div className="space-y-3">
                            {globalSearchResults.map(item => <ResultItem key={`${item.type}-${item.id}`} item={item} />)}
                        </div>
                    ) : (
                        <div className="text-center h-full flex flex-col items-center justify-center">
                            <SearchIcon className="w-12 h-12 text-gray-300 dark:text-gray-600"/>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">No se encontraron resultados.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};