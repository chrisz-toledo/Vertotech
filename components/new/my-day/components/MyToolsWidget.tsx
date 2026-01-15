import React, { useMemo } from 'react';
import { useAppStore } from '../../../../hooks/stores/useAppStore';
import { useOperationsStore } from '../../../../hooks/stores/useOperationsStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { ToolboxIconSimple } from '../../../icons/new/ToolboxIcon';

const MyToolsWidget: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppStore();
    const { tools } = useOperationsStore();

    const myAssignedTools = useMemo(() => {
        if (!currentUser) return [];
        return tools.filter(tool => 
            tool.assignment.type === 'employee' && tool.assignment.employeeId === currentUser.id
        );
    }, [tools, currentUser]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <ToolboxIconSimple className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('myAssignedTools')}</h3>
            </div>
            {myAssignedTools.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                    {myAssignedTools.map(tool => (
                        <li key={tool.id}>{tool.name}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No tienes herramientas asignadas.</p>
            )}
        </div>
    );
};

export default MyToolsWidget;