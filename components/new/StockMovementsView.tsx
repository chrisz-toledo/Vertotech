import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useWarehouseStore, getStockLevel } from '../../hooks/stores/useWarehouseStore';
import type { StockMovementType } from '../../types';
import { ArrowsRightLeftIcon } from '../icons/new/ArrowsRightLeftIcon';
import { BoxIcon } from '../icons/new/BoxIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';

type MovementTypeFilter = StockMovementType | 'all';

interface ProductOption {
    id: string;
    name: string;
    type: 'material' | 'tool';
    unit?: string;
}

interface MovementFormState {
    type: StockMovementType;
    productId: string;
    warehouseId: string;
    fromWarehouseId: string;
    quantity: string;
    date: string;
    reference: string;
    notes: string;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const emptyMovementForm: MovementFormState = {
    type: 'entrada',
    productId: '',
    warehouseId: '',
    fromWarehouseId: '',
    quantity: '',
    date: todayStr(),
    reference: '',
    notes: '',
};

const typeBadgeClasses: Record<StockMovementType, string> = {
    entrada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    salida: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    transferencia: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ajuste: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const StockMovementsView: React.FC = () => {
    const { t } = useTranslation();
    const { warehouses, stockMovements, saveStockMovement, deleteStockMovement } = useWarehouseStore();
    const { materials, tools } = useOperationsStore();
    const { confirm } = useAppStore();

    const [filterWarehouse, setFilterWarehouse] = useState('all');
    const [filterProduct, setFilterProduct] = useState('all');
    const [filterType, setFilterType] = useState<MovementTypeFilter>('all');

    const [form, setForm] = useState<MovementFormState>(emptyMovementForm);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const productOptions: ProductOption[] = useMemo(() => {
        const opts: ProductOption[] = [
            ...materials.map(m => ({ id: m.id, name: m.name, type: 'material' as const, unit: m.unit })),
            ...tools.map(tl => ({ id: tl.id, name: tl.name, type: 'tool' as const })),
        ];
        return opts.sort((a, b) => a.name.localeCompare(b.name));
    }, [materials, tools]);

    const productMap = useMemo(() => new Map(productOptions.map(p => [p.id, p])), [productOptions]);
    const warehouseMap = useMemo(() => new Map(warehouses.map(w => [w.id, w])), [warehouses]);

    const filteredMovements = useMemo(() => {
        return stockMovements
            .filter(m => filterWarehouse === 'all' || m.warehouseId === filterWarehouse || m.fromWarehouseId === filterWarehouse)
            .filter(m => filterProduct === 'all' || m.productId === filterProduct)
            .filter(m => filterType === 'all' || m.type === filterType)
            .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    }, [stockMovements, filterWarehouse, filterProduct, filterType]);

    const openAdd = () => {
        setForm({ ...emptyMovementForm, date: todayStr(), warehouseId: warehouses.find(w => w.isActive)?.id || '' });
        setIsModalOpen(true);
    };

    const isFormValid = () => {
        if (!form.productId || !form.warehouseId) return false;
        const qty = parseFloat(form.quantity);
        if (isNaN(qty) || qty <= 0) return false;
        if (!form.date) return false;
        if (form.type === 'transferencia') {
            if (!form.fromWarehouseId) return false;
            if (form.fromWarehouseId === form.warehouseId) return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!isFormValid()) return;
        const product = productMap.get(form.productId);
        if (!product) return;
        saveStockMovement({
            productId: form.productId,
            productType: product.type,
            warehouseId: form.warehouseId,
            fromWarehouseId: form.type === 'transferencia' ? form.fromWarehouseId : undefined,
            type: form.type,
            quantity: parseFloat(form.quantity),
            date: form.date,
            reference: form.reference.trim() || undefined,
            notes: form.notes.trim() || undefined,
        });
        setIsModalOpen(false);
        setForm(emptyMovementForm);
    };

    const selectClass = "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <ArrowsRightLeftIcon className="w-7 h-7 text-blue-600" />
                    {t('stock-movements')}
                </h2>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />
                    {t('addStockMovement')}
                </button>
            </div>

            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('filterByWarehouse')}</label>
                    <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)} className={selectClass}>
                        <option value="all">{t('allWarehouses')}</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('filterByProduct')}</label>
                    <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className={selectClass}>
                        <option value="all">{t('allProducts')}</option>
                        {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('filterByType')}</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as MovementTypeFilter)} className={selectClass}>
                        <option value="all">{t('allTypes')}</option>
                        <option value="entrada">{t('entrada')}</option>
                        <option value="salida">{t('salida')}</option>
                        <option value="transferencia">{t('transferencia')}</option>
                        <option value="ajuste">{t('ajuste')}</option>
                    </select>
                </div>
            </div>

            {filteredMovements.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-4 py-3">{t('movementType')}</th>
                                    <th className="px-4 py-3">{t('product')}</th>
                                    <th className="px-4 py-3">{t('warehouses')}</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">{t('movementReference')}</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.map(m => {
                                    const product = productMap.get(m.productId);
                                    const dest = warehouseMap.get(m.warehouseId);
                                    const src = m.fromWarehouseId ? warehouseMap.get(m.fromWarehouseId) : undefined;
                                    return (
                                        <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeBadgeClasses[m.type]}`}>
                                                    {t(m.type)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">
                                                    <BoxIcon className="w-4 h-4 text-gray-400" />
                                                    {product?.name || m.productId}
                                                </span>
                                                {m.notes && <p className="text-xs text-gray-400 mt-0.5">{m.notes}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {m.type === 'transferencia'
                                                    ? <span>{src?.name || m.fromWarehouseId} → {dest?.name || m.warehouseId}</span>
                                                    : <span>{dest?.name || m.warehouseId}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-100">
                                                {m.type === 'salida' ? '−' : m.type === 'entrada' ? '+' : ''}{m.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.date}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.reference || '—'}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => confirm({ title: t('delete'), message: t('confirmDeleteMovement'), onConfirm: () => deleteStockMovement([m.id]) })} title={t('delete')} className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-100 transition-colors">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <ArrowsRightLeftIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noStockMovements')}</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noMovementsDesc')}</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('addStockMovement')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('movementType')}</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['entrada', 'salida', 'transferencia', 'ajuste'] as StockMovementType[]).map(mt => (
                                        <button
                                            key={mt}
                                            onClick={() => setForm({ ...form, type: mt })}
                                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${form.type === mt ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {t(mt)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('selectProduct')}</label>
                                <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                                    <option value="">{t('selectProduct')}…</option>
                                    <optgroup label={t('materials')}>
                                        {productOptions.filter(p => p.type === 'material').map(p => <option key={p.id} value={p.id}>{p.name}{p.unit ? ` (${p.unit})` : ''}</option>)}
                                    </optgroup>
                                    <optgroup label={t('tools')}>
                                        {productOptions.filter(p => p.type === 'tool').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                            {form.type === 'transferencia' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('sourceWarehouse')}</label>
                                    <select value={form.fromWarehouseId} onChange={e => setForm({ ...form, fromWarehouseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                                        <option value="">{t('sourceWarehouse')}…</option>
                                        {warehouses.filter(w => w.id !== form.warehouseId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('destinationWarehouse')}</label>
                                <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                                    <option value="">{t('destinationWarehouse')}…</option>
                                    {warehouses.filter(w => w.id !== form.fromWarehouseId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                        {form.type === 'ajuste' ? t('newStockLevel') : 'Qty'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={form.quantity}
                                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    />
                                    {form.productId && form.warehouseId && (
                                        <p className="mt-1 text-xs text-gray-400">{t('currentStock')}: {getStockLevel(form.productId, form.warehouseId)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('movementReference')}</label>
                                <input
                                    type="text"
                                    value={form.reference}
                                    onChange={e => setForm({ ...form, reference: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('movementNotes')}</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                                {t('cancel')}
                            </button>
                            <button onClick={handleSave} disabled={!isFormValid()} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockMovementsView;
