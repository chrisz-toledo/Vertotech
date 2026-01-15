import React, { useState } from 'react';
import type { Tool, Material } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import ToolList from './ToolList';
import MaterialList from './MaterialList';
import { ToolboxIconSimple } from '../icons/new/ToolboxIcon';
import { BoxIcon } from '../icons/new/BoxIcon';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { ArrowsRightLeftIcon } from '../icons/new/ArrowsRightLeftIcon';

const InventoryView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'tools' | 'materials'>('tools');
    const { open: openModal } = useModalManager();

    const operationsStore = useOperationsStore();
    const peopleStore = usePeopleStore();
    const appStore = useAppStore();

    const TabButton: React.FC<{ tabId: 'tools' | 'materials', label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${activeTab === tabId ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200/70'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl shadow-sm">
                    <TabButton tabId="tools" label={t('tools')} icon={<ToolboxIconSimple className="w-5 h-5" />} />
                    <TabButton tabId="materials" label={t('materials')} icon={<BoxIcon className="w-5 h-5" />} />
                </div>
                <div>
                    {activeTab === 'tools' && (
                        <div className="flex items-center gap-2">
                             <button onClick={() => openModal('toolCheckin')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700">
                                <ArrowsRightLeftIcon className="w-5 h-5" />
                                <span>{t('registerMovement')}</span>
                            </button>
                            <button onClick={() => openModal('tool')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                                <ToolboxIconSimple className="w-5 h-5" />{t('addTool')}
                            </button>
                        </div>
                    )}
                    {activeTab === 'materials' && (
                        <button onClick={() => openModal('material')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                            <BoxIcon className="w-5 h-5" />{t('addMaterial')}
                        </button>
                    )}
                </div>
            </div>

            <div>
                {activeTab === 'tools' && (
                    <ToolList
                        tools={operationsStore.tools}
                        employees={peopleStore.employees}
                        jobsites={operationsStore.jobsites}
                        onEdit={(tool) => openModal('tool', { tool })}
                        onDelete={(tool) => appStore.confirm({ title: 'Eliminar Herramienta', message: '¿Mover a la papelera?', onConfirm: () => operationsStore.deleteTool([tool.id])})}
                    />
                )}
                {activeTab === 'materials' && (
                    <MaterialList
                        materials={operationsStore.materials}
                        jobsites={operationsStore.jobsites}
                        onEdit={(material) => openModal('material', { material })}
                        onDelete={(material) => appStore.confirm({ title: 'Eliminar Material', message: '¿Mover a la papelera?', onConfirm: () => operationsStore.deleteMaterial([material.id])})}
                    />
                )}
            </div>
        </div>
    );
};

export default InventoryView;