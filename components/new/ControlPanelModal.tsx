
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import PersonalizationSettings from './settings/PersonalizationSettings';
import CategorySettings from './settings/CategorySettings';
import FinancialSettings from './settings/FinancialSettings';
import DataManagementSettings from './settings/DataManagementSettings';
import DocumentStylingSettings from './settings/DocumentStylingSettings';

// Icons
import { XCircleIcon } from '../icons/XCircleIcon';
import { SlidersIcon } from '../icons/new/SlidersIcon';
import { PaletteIcon } from '../icons/new/PaletteIcon';
import { DatabaseIcon } from '../icons/new/DatabaseIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { FileTextIcon } from '../icons/new/FileTextIcon';

interface ControlPanelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsTab = 'personalization' | 'categories' | 'financial' | 'data' | 'documentStyling';

export const ControlPanelModal: React.FC<ControlPanelModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('personalization');

    const tabs = [
        { id: 'personalization', labelKey: 'personalization', icon: <PaletteIcon className="w-5 h-5"/> },
        { id: 'documentStyling', labelKey: 'documentStyling', icon: <FileTextIcon className="w-5 h-5"/> },
        { id: 'categories', labelKey: 'categoriesAndRates', icon: <TagIcon className="w-5 h-5"/> },
        { id: 'financial', labelKey: 'financialSettings', icon: <DollarSignIcon className="w-5 h-5"/> },
        { id: 'data', labelKey: 'dataManagement', icon: <DatabaseIcon className="w-5 h-5"/> },
    ];

    const TabButton: React.FC<{tabId: string, label: string, icon: React.ReactNode}> = ({tabId, label, icon}) => (
        <button onClick={() => setActiveTab(tabId as SettingsTab)} className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${activeTab === tabId ? 'bg-blue-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'personalization': return <PersonalizationSettings />;
            case 'documentStyling': return <DocumentStylingSettings />;
            case 'categories': return <CategorySettings />;
            case 'financial': return <FinancialSettings />;
            case 'data': return <DataManagementSettings />;
            default: return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col border border-gray-200 dark:border-gray-700 h-[90vh] max-h-[800px] modal-content" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3"><SlidersIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h2></div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50"><XCircleIcon className="w-8 h-8"/></button>
                </header>
                <div className="flex flex-grow overflow-hidden">
                    <nav className="w-56 p-4 border-r border-gray-200 dark:border-gray-700 space-y-2 bg-white dark:bg-gray-800/50">
                        {tabs.map(tab => (
                            <TabButton key={tab.id} tabId={tab.id} label={t(tab.labelKey as any)} icon={tab.icon} />
                        ))}
                    </nav>
                    <main className="p-6 flex-grow overflow-y-auto">
                       {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};
