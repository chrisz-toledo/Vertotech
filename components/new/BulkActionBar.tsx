
import React from 'react';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CheckSquareIcon } from '../icons/CheckSquareIcon';
import { ArchiveIcon } from '../icons/ArchiveIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface BulkActionBarProps {
    itemType: 'empleados' | 'clientes';
    selectedCount: number;
    onClearSelection: () => void;
    onToggleActive: () => void;
    onToggleInactive: () => void;
    onDelete: () => void;
    onBulkEdit?: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    itemType,
    selectedCount,
    onClearSelection,
    onToggleActive,
    onToggleInactive,
    onDelete,
    onBulkEdit,
}) => {
    const { t } = useTranslation();
    if (selectedCount === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-30 p-4 animate-fade-in-up">
            <div className="bg-slate-900/70 dark:bg-slate-800/80 backdrop-blur-lg text-white rounded-xl shadow-2xl flex items-center justify-between p-4 border border-white/20">
                <div className="flex items-center gap-4">
                    <button onClick={onClearSelection} className="p-1 rounded-full hover:bg-white/10">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg">{selectedCount} {itemType} seleccionado(s)</span>
                </div>
                <div className="flex items-center gap-3">
                    {onBulkEdit && (
                        <button 
                            onClick={onBulkEdit}
                            className="glass-button !py-2 !px-4"
                            title={t('bulkEdit')}
                        >
                            <PencilIcon className="w-5 h-5" />
                            <span>{t('edit')}</span>
                        </button>
                    )}
                    <button 
                        onClick={onToggleActive} 
                        className="glass-button !py-2 !px-4 !bg-emerald-600/50 hover:!bg-emerald-700/70"
                        title="Marcar como Activo(s)"
                    >
                        <CheckSquareIcon className="w-5 h-5" />
                        <span>Activo</span>
                    </button>
                    <button 
                        onClick={onToggleInactive}
                        className="glass-button-secondary !py-2 !px-4"
                        title="Marcar como Inactivo(s)"
                    >
                        <CheckSquareIcon className="w-5 h-5" />
                        <span>Inactivo</span>
                    </button>
                     <button 
                        onClick={onDelete} 
                        className="glass-button-destructive !py-2 !px-4"
                        title="Mover a la Papelera"
                    >
                        <ArchiveIcon className="w-5 h-5" />
                        <span>Papelera</span>
                    </button>
                </div>
            </div>
        </div>
    );
};