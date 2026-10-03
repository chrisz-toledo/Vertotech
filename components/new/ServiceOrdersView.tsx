import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useServiceOrderStore } from '../../hooks/stores/useServiceOrderStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useBranchStore } from '../../hooks/stores/useBranchStore';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import type { ServiceLine, ServiceOrderStatus } from '../../types/serviceOrder';
import { formatCurrency } from '../../utils/formatters';
import { ToolboxIcon } from '../icons/new/ToolboxIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

const STATUS_FLOW: ServiceOrderStatus[] = ['recibida', 'en_proceso', 'lista', 'entregada'];
const ALL = 'todas';

const STATUS_BADGE: Record<ServiceOrderStatus, string> = {
    recibida: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    en_proceso: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    lista: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    entregada: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const LINE_BADGE: Record<ServiceLine['kind'], string> = {
    repuesto: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    mano_obra: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
};

interface OrderFormState {
    id?: string;
    vehicleId: string;
    clientId: string;
    description: string;
    promisedDate: string;
    lines: ServiceLine[];
}

const emptyLine = (): ServiceLine => ({
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    kind: 'mano_obra',
});

const emptyForm: OrderFormState = {
    vehicleId: '',
    clientId: '',
    description: '',
    promisedDate: '',
    lines: [],
};

const ServiceOrdersView: React.FC = () => {
    const { t } = useTranslation();
    const { serviceOrders, saveServiceOrder, deleteServiceOrder, setStatus } = useServiceOrderStore();
    const { vehicles } = useOperationsStore();
    const { clients } = usePeopleStore();
    const { currentBranchId } = useBranchStore();
    const { confirm } = useAppStore();

    const [statusFilter, setStatusFilter] = useState<string>(ALL);
    const [form, setForm] = useState<OrderFormState>(emptyForm);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const vehicleById = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), [vehicles]);
    const clientById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

    const filtered = statusFilter === ALL
        ? serviceOrders
        : serviceOrders.filter(o => o.status === statusFilter);

    const lineTotal = (l: ServiceLine) => l.quantity * l.unitPrice;
    const formTotal = form.lines.reduce((s, l) => s + lineTotal(l), 0);
    const orderTotal = (lines: ServiceLine[]) => lines.reduce((s, l) => s + lineTotal(l), 0);

    const openAdd = () => { setForm(emptyForm); setIsModalOpen(true); };
    const openEdit = (id: string) => {
        const o = serviceOrders.find(x => x.id === id);
        if (!o) return;
        setForm({
            id: o.id,
            vehicleId: o.vehicleId,
            clientId: o.clientId,
            description: o.description,
            promisedDate: o.promisedDate ?? '',
            lines: o.lines,
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!form.vehicleId || !form.clientId) return;
        saveServiceOrder({
            branchId: currentBranchId ?? undefined,
            vehicleId: form.vehicleId,
            clientId: form.clientId,
            description: form.description.trim(),
            promisedDate: form.promisedDate || undefined,
            lines: form.lines.filter(l => l.description.trim() || l.unitPrice > 0),
        }, form.id);
        setIsModalOpen(false);
        setForm(emptyForm);
    };

    const handleAdvance = (id: string) => {
        const o = serviceOrders.find(x => x.id === id);
        if (!o) return;
        const idx = STATUS_FLOW.indexOf(o.status);
        if (idx >= 0 && idx < STATUS_FLOW.length - 1) setStatus(id, STATUS_FLOW[idx + 1]);
    };

    const handleDeliverAndBill = (id: string) => {
        const o = serviceOrders.find(x => x.id === id);
        if (!o) return;
        const vehicle = vehicleById[o.vehicleId];
        const lineItems = o.lines.map(l => ({
            id: `il-${l.id}`,
            description: `${l.kind === 'repuesto' ? t('soRepuesto' as any) : t('soLabor' as any)}: ${l.description}`,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            amount: l.quantity * l.unitPrice,
        }));
        const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);
        const today = new Date().toISOString().slice(0, 10);
        useFinanceStore.getState().saveInvoice({
            clientId: o.clientId,
            status: 'paid',
            issueDate: today,
            dueDate: today,
            lineItems,
            subtotal,
            taxRate: 0,
            taxAmount: 0,
            total: subtotal,
            notes: `${t('soInvoiceNote' as any)} ${o.id}${vehicle ? ` — ${vehicle.name}` : ''}`,
            branchId: o.branchId ?? currentBranchId ?? undefined,
        });
        setStatus(id, 'entregada');
    };

    const setLine = (lineId: string, patch: Partial<ServiceLine>) =>
        setForm(f => ({ ...f, lines: f.lines.map(l => l.id === lineId ? { ...l, ...patch } : l) }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <ToolboxIcon className="w-7 h-7 text-blue-600" />
                    {t('soTitle' as any)}
                </h2>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />
                    {t('soNew' as any)}
                </button>
            </div>

            <div className="flex gap-2 flex-wrap">
                {[ALL, ...STATUS_FLOW].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                            statusFilter === s
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                        }`}
                    >
                        {s === ALL ? t('soAll' as any) : t(`soStatus_${s}` as any)}
                        {s !== ALL && (
                            <span className="ml-1.5 opacity-70">{serviceOrders.filter(o => o.status === s).length}</span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filtered.map(o => {
                        const vehicle = vehicleById[o.vehicleId];
                        const client = clientById[o.clientId];
                        const idx = STATUS_FLOW.indexOf(o.status);
                        const isFinal = o.status === 'entregada';
                        return (
                            <div key={o.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
                                                {vehicle ? `${vehicle.name}${vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ''}` : '—'}
                                            </h3>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status]}`}>
                                                {t(`soStatus_${o.status}` as any)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {client?.name ?? '—'}
                                            {o.promisedDate && (
                                                <span className="ml-2">· {t('soPromisedDate' as any)}: {o.promisedDate}</span>
                                            )}
                                        </p>
                                        {o.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{o.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => openEdit(o.id)} title={t('edit')} className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => confirm({
                                                title: t('delete'),
                                                message: t('soConfirmDelete' as any),
                                                onConfirm: () => deleteServiceOrder(o.id),
                                            })}
                                            title={t('delete')}
                                            className="p-2.5 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {o.lines.length > 0 && (
                                    <div className="space-y-1.5">
                                        {o.lines.map(l => (
                                            <div key={l.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200 min-w-0">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${LINE_BADGE[l.kind]}`}>
                                                        {l.kind === 'repuesto' ? t('soRepuesto' as any) : t('soLabor' as any)}
                                                    </span>
                                                    <span className="truncate">{l.description || '—'}</span>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">×{l.quantity}</span>
                                                </span>
                                                <span className="font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">{formatCurrency(lineTotal(l))}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-end px-3 pt-1 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 mr-2">{t('soSubtotal' as any)}:</span>
                                            <span className="font-bold text-gray-800 dark:text-gray-100">{formatCurrency(orderTotal(o.lines))}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap">
                                    {!isFinal && idx < STATUS_FLOW.length - 1 && (
                                        <button onClick={() => handleAdvance(o.id)} className="px-4 py-2 font-semibold text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50">
                                            {t('soAdvanceTo' as any)}: {t(`soStatus_${STATUS_FLOW[idx + 1]}` as any)}
                                        </button>
                                    )}
                                    {!isFinal && (
                                        <button onClick={() => handleDeliverAndBill(o.id)} className="px-4 py-2 font-semibold text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                                            {t('soDeliverBill' as any)}
                                        </button>
                                    )}
                                    {isFinal && (
                                        <span className="text-sm text-gray-400 italic">{t('soBilledNote' as any)}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <ToolboxIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('soEmpty' as any)}</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('soEmptyDesc' as any)}</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                            {form.id ? t('soEdit' as any) : t('soNew' as any)}
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('soVehicle' as any)}</label>
                                    <select
                                        value={form.vehicleId}
                                        onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">{t('soSelectVehicle' as any)}</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}{v.licensePlate ? ` · ${v.licensePlate}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('soClient' as any)}</label>
                                    <select
                                        value={form.clientId}
                                        onChange={e => setForm({ ...form, clientId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">{t('soSelectClient' as any)}</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('description')}</label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('soPromisedDate' as any)}</label>
                                    <input
                                        type="date"
                                        value={form.promisedDate}
                                        onChange={e => setForm({ ...form, promisedDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('soLines' as any)}</h4>
                                    <button onClick={() => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))} className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50">
                                        <PlusIcon className="w-4 h-4" />
                                        {t('soAddLine' as any)}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {form.lines.map(l => (
                                        <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                                            <select
                                                value={l.kind}
                                                onChange={e => setLine(l.id, { kind: e.target.value as ServiceLine['kind'] })}
                                                className="col-span-3 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                            >
                                                <option value="mano_obra">{t('soLabor' as any)}</option>
                                                <option value="repuesto">{t('soRepuesto' as any)}</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={l.description}
                                                onChange={e => setLine(l.id, { description: e.target.value })}
                                                placeholder={t('soLineDesc' as any)}
                                                className="col-span-4 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                            />
                                            <input
                                                type="number"
                                                min={1}
                                                value={l.quantity}
                                                onChange={e => setLine(l.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                                                title={t('soQty' as any)}
                                                className="col-span-2 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                value={l.unitPrice}
                                                onChange={e => setLine(l.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                                                title={t('soUnitPrice' as any)}
                                                className="col-span-2 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                            />
                                            <button onClick={() => setForm(f => ({ ...f, lines: f.lines.filter(x => x.id !== l.id) }))} title={t('delete')} className="col-span-1 p-2 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors justify-self-center">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {form.lines.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">{t('soNoLines' as any)}</p>
                                    )}
                                </div>
                                <div className="flex justify-end mt-3 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 mr-2">{t('soSubtotal' as any)}:</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{formatCurrency(formTotal)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                                {t('cancel')}
                            </button>
                            <button onClick={handleSave} disabled={!form.vehicleId || !form.clientId} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceOrdersView;
