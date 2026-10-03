import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useWarehouseStore, getStockByProduct } from '../../hooks/stores/useWarehouseStore';
import type { Warehouse } from '../../types';
import { BuildingIcon } from '../icons/BuildingIcon';
import { BoxIcon } from '../icons/new/BoxIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ExclamationIcon } from '../icons/new/ExclamationIcon';

const LOW_STOCK_THRESHOLD = 5;

interface WarehouseFormState {
    id?: string;
    name: string;
    address: string;
    isActive: boolean;
}

const emptyForm: WarehouseFormState = { name: '', address: '', isActive: true };

const WarehousesView: React.FC = () => {
    const { t } = useTranslation();
    const { warehouses, saveWarehouse, toggleWarehouseActive, deleteWarehouse } = useWarehouseStore();
    const { confirm } = useAppStore();

    const [form, setForm] = useState<WarehouseFormState>(emptyForm);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openAdd = () => { setForm(emptyForm); setIsModalOpen(true); };
    const openEdit = (w: Warehouse) => {
        setForm({ id: w.id, name: w.name, address: w.address, isActive: w.isActive });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        saveWarehouse({ name: form.name.trim(), address: form.address.trim(), isActive: form.isActive }, form.id);
        setIsModalOpen(false);
        setForm(emptyForm);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <BuildingIcon className="w-7 h-7 text-blue-600" />
                    {t('warehouses')}
                </h2>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />
                    {t('addWarehouse')}
                </button>
            </div>

            {warehouses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {warehouses.map(w => {
                        const summary = getStockByProduct(w.id);
                        const lowCount = summary.filter(s => s.level <= LOW_STOCK_THRESHOLD).length;
                        return (
                            <div key={w.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center bg-blue-100 border-2 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
                                            <BuildingIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{w.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{w.address || '—'}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                    {w.isActive ? t('active') : t('inactive')}
                                                </span>
                                                {lowCount > 0 && (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                                                        <ExclamationIcon className="w-3.5 h-3.5" />
                                                        {lowCount} · {t('stockLow')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => toggleWarehouseActive(w.id)} title={w.isActive ? t('inactive') : t('active')} className="p-2.5 rounded-full text-gray-500 hover:text-amber-600 hover:bg-amber-100 transition-colors">
                                            <span className="text-xs font-bold px-1">{w.isActive ? t('inactive') : t('active')}</span>
                                        </button>
                                        <button onClick={() => openEdit(w)} title={t('edit')} className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => confirm({ title: t('delete'), message: t('confirmDeleteWarehouse', { name: w.name }), onConfirm: () => deleteWarehouse([w.id]) })} title={t('delete')} className="p-2.5 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t('stockSummary')} ({t('currentStock')})</h4>
                                    {summary.length > 0 ? (
                                        <div className="max-h-48 overflow-y-auto space-y-1.5">
                                            {summary.map(s => {
                                                const isLow = s.level <= LOW_STOCK_THRESHOLD;
                                                return (
                                                    <div key={s.productId} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                                            <BoxIcon className="w-4 h-4 text-gray-400" />
                                                            {s.productName}
                                                            <span className="text-xs text-gray-400">· {t(s.productType)}</span>
                                                        </span>
                                                        <span className={`font-bold ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                                            {s.level}{s.unit ? ` ${s.unit}` : ''}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">—</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <BuildingIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noWarehouses')}</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noWarehousesDesc')}</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                            {form.id ? t('editWarehouse') : t('addWarehouse')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('warehouseName')}</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('warehouseAddress')}</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                {t('warehouseStatus')}: {form.isActive ? t('active') : t('inactive')}
                            </label>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                                {t('cancel')}
                            </button>
                            <button onClick={handleSave} disabled={!form.name.trim()} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehousesView;
