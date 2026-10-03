import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useRestaurantStore } from '../../hooks/stores/useRestaurantStore';
import type { Table, TableStatus } from '../../types/restaurant';
import { TicketIcon } from '../icons/new/TicketIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CashIcon } from '../icons/new/CashIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

const statusStyles: Record<TableStatus, string> = {
    libre: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    ocupada: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
    reservada: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
};

interface TableFormState {
    id?: string;
    number: string;
    seats: string;
    status: TableStatus;
}

const emptyTableForm: TableFormState = { number: '', seats: '', status: 'libre' };

interface LineFormState {
    productId: string;
    description: string;
    quantity: string;
    unitPrice: string;
}

const emptyLineForm: LineFormState = { productId: '', description: '', quantity: '1', unitPrice: '' };

const TablesView: React.FC = () => {
    const { t } = useTranslation();
    const { confirm } = useAppStore();
    const { materials } = useOperationsStore();
    const {
        tables, comandas,
        saveTable, deleteTable, setTableStatus,
        openComanda, addComandaLine, removeComandaLine,
        closeComanda, cobrarComanda,
    } = useRestaurantStore();

    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [tableForm, setTableForm] = useState<TableFormState>(emptyTableForm);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [lineForm, setLineForm] = useState<LineFormState>(emptyLineForm);

    const selectedTable = tables.find(tb => tb.id === selectedTableId) ?? null;
    const openComandaOfSelected = useMemo(
        () => (selectedTable ? comandas.find(c => c.id === selectedTable.currentComandaId && c.status === 'abierta') ?? null : null),
        [selectedTable, comandas]
    );
    const comandaTotal = useMemo(
        () => (openComandaOfSelected ? openComandaOfSelected.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) : 0),
        [openComandaOfSelected]
    );

    const openAddTable = () => { setTableForm(emptyTableForm); setIsTableModalOpen(true); };

    const handleSaveTable = () => {
        const number = parseInt(tableForm.number, 10);
        if (isNaN(number)) return;
        saveTable(
            {
                number,
                seats: tableForm.seats ? parseInt(tableForm.seats, 10) || undefined : undefined,
                status: tableForm.status,
            },
            tableForm.id
        );
        setIsTableModalOpen(false);
        setTableForm(emptyTableForm);
    };

    const handleOpenComanda = () => {
        if (!selectedTable) return;
        openComanda(selectedTable.id);
    };

    const handleAddLine = () => {
        if (!openComandaOfSelected) return;
        const description = lineForm.productId
            ? (materials.find(m => m.id === lineForm.productId)?.name ?? lineForm.description)
            : lineForm.description.trim();
        const quantity = parseFloat(lineForm.quantity) || 0;
        const unitPrice = parseFloat(lineForm.unitPrice) || 0;
        if (!description || quantity <= 0) return;
        addComandaLine(openComandaOfSelected.id, {
            productId: lineForm.productId || undefined,
            description,
            quantity,
            unitPrice,
        });
        setLineForm(emptyLineForm);
    };

    const handleCobrar = () => {
        if (!openComandaOfSelected || openComandaOfSelected.lines.length === 0) return;
        confirm({
            title: t('restaurantCobrarTitle' as any),
            message: t('restaurantCobrarConfirm' as any, { total: comandaTotal.toFixed(2) }),
            onConfirm: () => {
                cobrarComanda(openComandaOfSelected.id);
                setSelectedTableId(null);
            },
        });
    };

    const handleCerrar = () => {
        if (!openComandaOfSelected) return;
        confirm({
            title: t('restaurantCerrarTitle' as any),
            message: t('restaurantCerrarConfirm' as any),
            onConfirm: () => {
                closeComanda(openComandaOfSelected.id);
                setSelectedTableId(null);
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <TicketIcon className="w-7 h-7 text-blue-600" />
                    {t('restaurantTables' as any)}
                </h2>
                <button onClick={openAddTable} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />
                    {t('restaurantNewTable' as any)}
                </button>
            </div>

            {tables.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tables.map(table => {
                        const comanda = comandas.find(c => c.id === table.currentComandaId && c.status === 'abierta');
                        const total = comanda ? comanda.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) : 0;
                        const isSelected = table.id === selectedTableId;
                        return (
                            <button
                                key={table.id}
                                onClick={() => setSelectedTableId(isSelected ? null : table.id)}
                                className={`relative p-4 rounded-xl border-2 text-left shadow-sm transition-all hover:shadow-md ${statusStyles[table.status]} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}`}
                            >
                                <div className="text-3xl font-extrabold">{t('restaurantTable' as any)} {table.number}</div>
                                {table.seats ? (
                                    <div className="text-xs font-medium opacity-80 mt-1">{table.seats} {t('restaurantSeats' as any)}</div>
                                ) : null}
                                <div className="mt-2">
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        {t(`restaurantStatus${table.status.charAt(0).toUpperCase() + table.status.slice(1)}` as any)}
                                    </span>
                                </div>
                                {comanda && total > 0 && (
                                    <div className="mt-1 text-lg font-bold">${total.toFixed(2)}</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-10 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('restaurantNoTables' as any)}</p>
                </div>
            )}

            {selectedTable && (
                <TableDetailPanel
                    table={selectedTable}
                    t={t}
                    comanda={openComandaOfSelected}
                    comandaTotal={comandaTotal}
                    materials={materials}
                    lineForm={lineForm}
                    setLineForm={setLineForm}
                    onOpenComanda={handleOpenComanda}
                    onAddLine={handleAddLine}
                    onRemoveLine={(lineId) => openComandaOfSelected && removeComandaLine(openComandaOfSelected.id, lineId)}
                    onCerrar={handleCerrar}
                    onCobrar={handleCobrar}
                    onSetStatus={(s) => setTableStatus(selectedTable.id, s)}
                    onDelete={() => confirm({
                        title: t('delete' as any),
                        message: t('restaurantDeleteTableConfirm' as any, { number: String(selectedTable.number) }),
                        onConfirm: () => { deleteTable(selectedTable.id); setSelectedTableId(null); },
                    })}
                />
            )}

            {isTableModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={() => setIsTableModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('restaurantNewTable' as any)}</h3>
                            <button onClick={() => setIsTableModalOpen(false)} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30">
                                <XCircleIcon className="w-7 h-7" />
                            </button>
                        </header>
                        <main className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('restaurantTableNumber' as any)}</label>
                                <input type="number" min={1} value={tableForm.number} onChange={e => setTableForm(f => ({ ...f, number: e.target.value }))} className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('restaurantSeats' as any)}</label>
                                <input type="number" min={1} value={tableForm.seats} onChange={e => setTableForm(f => ({ ...f, seats: e.target.value }))} className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('restaurantStatus' as any)}</label>
                                <select value={tableForm.status} onChange={e => setTableForm(f => ({ ...f, status: e.target.value as TableStatus }))} className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                                    {(['libre', 'ocupada', 'reservada'] as TableStatus[]).map(s => (
                                        <option key={s} value={s}>{t(`restaurantStatus${s.charAt(0).toUpperCase() + s.slice(1)}` as any)}</option>
                                    ))}
                                </select>
                            </div>
                        </main>
                        <footer className="flex justify-end gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={() => setIsTableModalOpen(false)} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('cancel' as any)}</button>
                            <button onClick={handleSaveTable} disabled={!tableForm.number} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{t('save' as any)}</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

interface TableDetailPanelProps {
    table: Table;
    t: (key: any, params?: any) => string;
    comanda: { id: string; lines: { id: string; description: string; quantity: number; unitPrice: number }[] } | null;
    comandaTotal: number;
    materials: { id: string; name: string; unit: string }[];
    lineForm: LineFormState;
    setLineForm: React.Dispatch<React.SetStateAction<LineFormState>>;
    onOpenComanda: () => void;
    onAddLine: () => void;
    onRemoveLine: (lineId: string) => void;
    onCerrar: () => void;
    onCobrar: () => void;
    onSetStatus: (s: TableStatus) => void;
    onDelete: () => void;
}

const TableDetailPanel: React.FC<TableDetailPanelProps> = ({
    table, t, comanda, comandaTotal, materials,
    lineForm, setLineForm,
    onOpenComanda, onAddLine, onRemoveLine, onCerrar, onCobrar, onSetStatus, onDelete,
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('restaurantTable' as any)} {table.number}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[table.status]}`}>
                    {t(`restaurantStatus${table.status.charAt(0).toUpperCase() + table.status.slice(1)}` as any)}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {!comanda && table.status !== 'ocupada' && (
                    <button onClick={onOpenComanda} className="px-4 py-2 font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                        {t('restaurantOpenComanda' as any)}
                    </button>
                )}
                {table.status !== 'ocupada' && (
                    <>
                        <button
                            onClick={() => onSetStatus(table.status === 'reservada' ? 'libre' : 'reservada')}
                            className="px-4 py-2 font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50"
                        >
                            {table.status === 'reservada' ? t('restaurantFreeTable' as any) : t('restaurantReserveTable' as any)}
                        </button>
                        <button onClick={onDelete} title={t('delete' as any)} className="p-2.5 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
        </div>

        {comanda ? (
            <>
                <div className="space-y-2">
                    {comanda.lines.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-2 pr-2 font-medium">{t('restaurantDescription' as any)}</th>
                                        <th className="py-2 pr-2 font-medium text-right">{t('restaurantQty' as any)}</th>
                                        <th className="py-2 pr-2 font-medium text-right">{t('restaurantUnitPrice' as any)}</th>
                                        <th className="py-2 pr-2 font-medium text-right">{t('restaurantAmount' as any)}</th>
                                        <th className="py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comanda.lines.map(l => (
                                        <tr key={l.id} className="border-b border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-100">
                                            <td className="py-2 pr-2">{l.description}</td>
                                            <td className="py-2 pr-2 text-right">{l.quantity}</td>
                                            <td className="py-2 pr-2 text-right">${l.unitPrice.toFixed(2)}</td>
                                            <td className="py-2 pr-2 text-right font-semibold">${(l.quantity * l.unitPrice).toFixed(2)}</td>
                                            <td className="py-2 text-right">
                                                <button onClick={() => onRemoveLine(l.id)} title={t('delete' as any)} className="p-1.5 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('restaurantNoLines' as any)}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('restaurantProduct' as any)}</label>
                        <select
                            value={lineForm.productId}
                            onChange={e => setLineForm(f => ({ ...f, productId: e.target.value, description: e.target.value ? '' : f.description }))}
                            className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                        >
                            <option value="">{t('restaurantCustomItem' as any)}</option>
                            {materials.filter(m => !('deletedAt' in m && (m as { deletedAt?: string }).deletedAt)).map(m => (
                                <option key={m.id} value={m.id}>{m.name}{m.unit ? ` (${m.unit})` : ''}</option>
                            ))}
                        </select>
                        {!lineForm.productId && (
                            <input
                                type="text"
                                value={lineForm.description}
                                onChange={e => setLineForm(f => ({ ...f, description: e.target.value }))}
                                placeholder={t('restaurantDescription' as any)}
                                className="mt-2 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('restaurantQty' as any)}</label>
                        <input type="number" min={0} step="any" value={lineForm.quantity} onChange={e => setLineForm(f => ({ ...f, quantity: e.target.value }))} className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('restaurantUnitPrice' as any)}</label>
                        <div className="flex gap-2">
                            <input type="number" min={0} step="any" value={lineForm.unitPrice} onChange={e => setLineForm(f => ({ ...f, unitPrice: e.target.value }))} className="flex-1 min-w-0 p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
                            <button onClick={onAddLine} className="px-3 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0" title={t('restaurantAddLine' as any)}>
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {t('restaurantTotal' as any)}: <span className="text-2xl">${comandaTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onCerrar} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                            {t('restaurantCloseComanda' as any)}
                        </button>
                        <button onClick={onCobrar} disabled={comanda.lines.length === 0} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400">
                            <CashIcon className="w-5 h-5" />
                            {t('restaurantCobrar' as any)}
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {table.status === 'ocupada'
                    ? t('restaurantNoOpenComanda' as any)
                    : t('restaurantOpenComandaHint' as any)}
            </p>
        )}
    </div>
);

export default TablesView;
