import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import EmployeeFilters from '../EmployeeFilters';
import ClientFilters from '../ClientFilters';
import type { EmployeeFilters as EmployeeFiltersType, ClientFilters as ClientFiltersType } from '../../types';

const FilterPanel: React.FC = () => {
    const { t } = useTranslation();
    const { isFilterPanelOpen, filterPanelEntity, closeFilterPanel, addSavedView } = useAppStore();
    
    const [isClosing, setIsClosing] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<EmployeeFiltersType | ClientFiltersType>({});
    const [viewName, setViewName] = useState('');

    useEffect(() => {
        if (!isFilterPanelOpen) {
            setCurrentFilters({});
            setViewName('');
        }
    }, [isFilterPanelOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeFilterPanel();
            setIsClosing(false);
        }, 300);
    };
    
    // This is a placeholder for applying filters. In a real app, this might trigger a parent component re-render with new filters.
    // For now, we assume the parent list component reads `activeFilters` from a store which we will set up.
    const handleApply = () => {
        // Here you would typically set the active filters in a global state
        // that the list component is listening to.
        console.log("Applying filters:", currentFilters);
        handleClose();
    };

    const handleClear = () => {
        setCurrentFilters({});
    };

    const handleSaveView = () => {
        if (viewName.trim() && filterPanelEntity) {
            const newView = {
                id: `view-${Date.now()}`,
                name: viewName,
                entity: filterPanelEntity,
                filters: currentFilters,
            };
            addSavedView(newView);
            setViewName('');
        }
    };

    if (!isFilterPanelOpen && !isClosing) return null;
    
    const panelAnimation = (isOpen: boolean, isClosing: boolean) => {
        if (isOpen && !isClosing) return 'animate-[slide-in-left_0.3s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]';
        if (isClosing) return 'animate-[slide-out-left_0.3s_cubic-bezier(0.55,0.085,0.68,0.53)_forwards]';
        return '';
    };

    return (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleClose}></div>
            <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-gray-50 dark:bg-gray-800 shadow-2xl flex flex-col ${panelAnimation(isFilterPanelOpen, isClosing)}`}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{t('filters')}</h2>
                    <button onClick={handleClose}><XCircleIcon className="w-8 h-8"/></button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    {filterPanelEntity === 'employee' && (
                        <EmployeeFilters filters={currentFilters as EmployeeFiltersType} onFilterChange={setCurrentFilters} />
                    )}
                    {filterPanelEntity === 'client' && (
                        <ClientFilters filters={currentFilters as ClientFiltersType} onFilterChange={setCurrentFilters} />
                    )}
                </main>
                <footer className="p-4 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">{t('saveView')}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={viewName}
                                onChange={e => setViewName(e.target.value)}
                                placeholder={t('viewName')}
                                className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                            />
                            <button onClick={handleSaveView} disabled={!viewName.trim()} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">Guardar</button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button onClick={handleClear} className="px-6 py-2.5 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">{t('clearFilters')}</button>
                        <button onClick={handleApply} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg">{t('applyFilters')}</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default FilterPanel;