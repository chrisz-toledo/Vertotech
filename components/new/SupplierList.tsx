import React, { useMemo } from 'react';
import type { Supplier } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { SupplierIcon } from '../icons/new/SupplierIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';

const SupplierCard: React.FC<{ supplier: Supplier; onEdit: (s: Supplier) => void; onDelete: (s: Supplier) => void; }> = ({ supplier, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-700">
                <SupplierIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400"/>
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{supplier.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.trade}</p>
                 <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                     <p className="text-sm text-gray-600 dark:text-gray-300">Contacto: {supplier.contactPerson}</p>
                     <p className="text-sm text-gray-600 dark:text-gray-300">Teléfono: {supplier.phone}</p>
                </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => onEdit(supplier)} title="Editar" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(supplier)} title="Eliminar" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const SupplierList: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { suppliers, deleteSupplier } = usePeopleStore();
    const { confirm } = useAppStore();

    const sortedSuppliers = useMemo(() =>
        [...suppliers].sort((a, b) => a.name.localeCompare(b.name)),
    [suppliers]);

    const onAdd = () => openModal('supplier');
    const onEdit = (supplier: Supplier) => openModal('supplier', { supplier });
    const onDelete = (supplier: Supplier) => {
        confirm({
            title: 'Eliminar Proveedor',
            message: `¿Mover a ${supplier.name} a la papelera?`,
            onConfirm: () => deleteSupplier([supplier.id]),
        });
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('suppliers')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <SupplierIcon className="w-5 h-5" />
                    <span>{t('addSupplier')}</span>
                </button>
            </div>
            {sortedSuppliers.length > 0 ? (
                <div className="space-y-6">
                    {sortedSuppliers.map(s => <SupplierCard key={s.id} supplier={s} onEdit={onEdit} onDelete={onDelete} />)}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <SupplierIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Proveedores</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada un nuevo proveedor para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default SupplierList;