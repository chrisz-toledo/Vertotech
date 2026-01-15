import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import PersonalizationSettings from './settings/PersonalizationSettings';
import CategorySettings from './settings/CategorySettings';
import FinancialSettings from './settings/FinancialSettings';
import DataManagementSettings from './settings/DataManagementSettings';

import { PaletteIcon } from '../icons/new/PaletteIcon';
import { TagIcon } from '../icons/new/TagIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { DatabaseIcon } from '../icons/new/DatabaseIcon';

type SettingsTab = 'personalization' | 'categories' | 'financial' | 'data';

const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('personalization');

    const tabs = [
        { id: 'personalization', label: t('personalization'), icon: <PaletteIcon className="w-5 h-5"/> },
        { id: 'categories', label: t('categoriesAndRates'), icon: <TagIcon className="w-5 h-5"/> },
        { id: 'financial', label: t('finance'), icon: <DollarSignIcon className="w-5 h-5"/> },
        { id: 'data', label: t('dataManagement'), icon: <DatabaseIcon className="w-5 h-5"/> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'personalization': return <PersonalizationSettings />;
            case 'categories': return <CategorySettings />;
            case 'financial': return <FinancialSettings />;
            case 'data': return <DataManagementSettings />;
            default: return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('settings')}</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-56 flex-shrink-0">
                    <nav className="space-y-2">
                        {tabs.map(tab => (
                             <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-grow min-w-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsView;
