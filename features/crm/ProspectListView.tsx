import React from 'react';
import { useCrmStore } from '../../hooks/stores/useCrmStore';
import { useModalManager } from '../../hooks/useModalManager';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { ProspectCard } from './ProspectCard';
import { BullhornIcon } from '../../components/icons/new/BullhornIcon';
import { PlusIcon } from '../../components/icons/new/PlusIcon';

const ProspectListView: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { prospects, deleteProspect, convertProspectToClient } = useCrmStore();
    const { confirm } = useAppStore();

    const onEdit = (prospect: any) => openModal('prospect', { prospect });
    
    const onDelete = (prospect: any) => {
        confirm({
            title: `Delete Prospect`,
            message: `Move ${prospect.name} to the trash?`,
            onConfirm: () => deleteProspect([prospect.id]),
        });
    };

    const onConvert = (prospect: any) => {
        confirm({
            title: 'Convert Prospect',
            message: `This will create a new client from ${prospect.name} and remove the prospect. Continue?`,
            onConfirm: () => convertProspectToClient(prospect),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('prospects')}</h2>
                <button 
                    onClick={() => openModal('prospect')}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('addProspect')}</span>
                </button>
            </div>

            {prospects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prospects.map(prospect => (
                        <ProspectCard 
                            key={prospect.id}
                            prospect={prospect}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onConvert={onConvert}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <BullhornIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Prospects Found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Add a new prospect to start building your sales pipeline.</p>
                </div>
            )}
        </div>
    );
};

export default ProspectListView;