import React, { useMemo, useState } from 'react';
import type { BankAccount, BankMovement } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountingStore, computeReconciliationStatus } from '../../hooks/stores/useAccountingStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { CoinsIcon } from '../icons/new/CoinsIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { formatCurrency } from '../../utils/formatters';
import { ModalShell, Field, inputCls, formatDate } from './accountingShared';

const todayStr = () => new Date().toISOString().slice(0, 10);

const BankAccountForm: React.FC<{ account: BankAccount | null; onClose: () => void }> = ({ account, onClose }) => {
    const { t } = useTranslation();
    const { accounts, saveBankAccount } = useAccountingStore();
    const activeAccounts = useMemo(() => accounts.filter(a => a.isActive), [accounts]);
    const [name, setName] = useState(account?.name || '');
    const [accountCode, setAccountCode] = useState(account?.accountCode || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !accountCode) return;
        saveBankAccount({ name: name.trim(), accountCode }, account?.id);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t('bankAccountName')}>
                <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required placeholder={t('bankAccountName')} />
            </Field>
            <Field label={t('linkedAccount')}>
                <select className={inputCls} value={accountCode} onChange={e => setAccountCode(e.target.value)} required>
                    <option value="">{t('selectAccount')}</option>
                    {activeAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">{t('save')}</button>
            </div>
        </form>
    );
};

const MovementForm: React.FC<{ movement: BankMovement | null; bankAccountId: string; onClose: () => void }> = ({ movement, bankAccountId, onClose }) => {
    const { t } = useTranslation();
    const { saveBankMovement } = useAccountingStore();
    const [date, setDate] = useState(movement?.date || todayStr());
    const [description, setDescription] = useState(movement?.description || '');
    const [amount, setAmount] = useState(movement ? String(movement.amount) : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!description.trim() || isNaN(amt)) return;
        saveBankMovement({ bankAccountId, date, description: description.trim(), amount: amt }, movement?.id);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Field label={t('entryDate')}>
                    <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} required />
                </Field>
                <Field label={t('amount')}>
                    <input type="number" step="0.01" className={inputCls} value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
                </Field>
            </div>
            <Field label={t('entryDescription')}>
                <input className={inputCls} value={description} onChange={e => setDescription(e.target.value)} required placeholder={t('entryDescription')} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">{t('save')}</button>
            </div>
        </form>
    );
};

const ReconcileModal: React.FC<{ movement: BankMovement; onClose: () => void }> = ({ movement, onClose }) => {
    const { t } = useTranslation();
    const { journalEntries, reconcileMovement } = useAccountingStore();
    const postedEntries = useMemo(() => journalEntries.filter(e => e.status === 'publicado'), [journalEntries]);
    const [entryId, setEntryId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryId) return;
        reconcileMovement(movement.id, entryId);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>{movement.description}</strong> — {formatDate(movement.date)} · <span className="font-mono">{formatCurrency(movement.amount)}</span>
            </p>
            <Field label={t('selectEntryToReconcile')}>
                <select className={inputCls} value={entryId} onChange={e => setEntryId(e.target.value)} required>
                    <option value="">{t('selectEntryToReconcile')}…</option>
                    {postedEntries.map(e => (
                        <option key={e.id} value={e.id}>
                            {formatDate(e.date)} — {e.description} ({formatCurrency(e.lines.reduce((s, l) => s + l.debit, 0))})
                        </option>
                    ))}
                </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                <button type="submit" disabled={!entryId} className="px-4 py-2 font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-40">{t('reconcile')}</button>
            </div>
        </form>
    );
};

const ReconciliationView: React.FC = () => {
    const { t } = useTranslation();
    const {
        bankAccounts, bankMovements, journalEntries, accounts,
        toggleBankAccountActive, deleteBankMovement, unreconcileMovement,
    } = useAccountingStore();
    const appStore = useAppStore();

    const [selectedBankId, setSelectedBankId] = useState('');
    const [showBankForm, setShowBankForm] = useState(false);
    const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
    const [showMovementForm, setShowMovementForm] = useState(false);
    const [editingMovement, setEditingMovement] = useState<BankMovement | null>(null);
    const [reconciling, setReconciling] = useState<BankMovement | null>(null);

    const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
    const movements = useMemo(
        () => bankMovements.filter(m => m.bankAccountId === selectedBankId).sort((a, b) => a.date.localeCompare(b.date)),
        [bankMovements, selectedBankId]
    );
    const status = useMemo(() => computeReconciliationStatus(selectedBankId, bankMovements), [selectedBankId, bankMovements]);
    const entryLabel = (id?: string) => {
        if (!id) return '';
        const e = journalEntries.find(j => j.id === id);
        return e ? `${formatDate(e.date)} — ${e.description}` : id;
    };
    const linkedAccountName = (code: string) => accounts.find(a => a.code === code)?.name || code;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <CoinsIcon className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('reconciliation')}</h2>
                </div>
                <button onClick={() => { setEditingBank(null); setShowBankForm(true); }} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />{t('addBankAccount')}
                </button>
            </div>

            {/* Bank accounts picker */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">{t('bankAccounts')}</h3>
                {bankAccounts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {bankAccounts.map(b => (
                            <div key={b.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${b.id === selectedBankId ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                <button onClick={() => setSelectedBankId(b.id)} className="text-left">
                                    <span className={`font-semibold ${b.isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 line-through'}`}>{b.name}</span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">{b.accountCode} {linkedAccountName(b.accountCode)}</span>
                                </button>
                                <button onClick={() => { setEditingBank(b); setShowBankForm(true); }} className="text-xs font-semibold text-gray-500 hover:text-blue-600">{t('edit')}</button>
                                <button onClick={() => toggleBankAccountActive(b.id)} className="text-xs font-semibold text-gray-500 hover:text-amber-600">
                                    {b.isActive ? t('deactivate') : t('activate')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('noBankAccounts')}</p>
                )}
            </div>

            {selectedBank && (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('reconciliationSummary')}</h3>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{selectedBank.name}</p>
                        </div>
                        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm text-center">
                            <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{t('totalReconciled')} ({status.countReconciled})</h3>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 font-mono">{formatCurrency(status.totalReconciled)}</p>
                        </div>
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm text-center">
                            <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">{t('totalPending')} ({status.countPending})</h3>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1 font-mono">{formatCurrency(status.totalPending)}</p>
                        </div>
                    </div>

                    {/* Movements */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('movements')}</h3>
                        <button onClick={() => { setEditingMovement(null); setShowMovementForm(true); }} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                            <PlusIcon className="w-5 h-5" />{t('addMovement')}
                        </button>
                    </div>

                    {movements.length > 0 ? (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('entryDate')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('entryDescription')}</th>
                                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('amount')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('entryStatus')}</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {movements.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(m.date)}</td>
                                            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                                                {m.description}
                                                {m.reconciledEntryId && (
                                                    <span className="block text-xs text-emerald-600 dark:text-emerald-400">{t('journalEntry')}: {entryLabel(m.reconciledEntryId)}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(m.amount)}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${m.reconciledEntryId ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                    {m.reconciledEntryId ? t('reconciled') : t('pending')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setEditingMovement(m); setShowMovementForm(true); }} className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">{t('edit')}</button>
                                                    {m.reconciledEntryId ? (
                                                        <button onClick={() => unreconcileMovement(m.id)} className="px-3 py-1.5 text-sm font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200">{t('unreconcile')}</button>
                                                    ) : (
                                                        <button onClick={() => setReconciling(m)} className="px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">{t('reconcile')}</button>
                                                    )}
                                                    <button
                                                        onClick={() => appStore.confirm({ title: t('delete'), message: m.description, onConfirm: () => deleteBankMovement([m.id]) })}
                                                        className="px-3 py-1.5 text-sm font-semibold text-rose-700 bg-rose-100 rounded-lg hover:bg-rose-200"
                                                    >{t('delete')}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <CoinsIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noMovements')}</h3>
                        </div>
                    )}
                </>
            )}

            {showBankForm && (
                <ModalShell title={editingBank ? t('editBankAccount') : t('addBankAccount')} onClose={() => setShowBankForm(false)}>
                    <BankAccountForm account={editingBank} onClose={() => setShowBankForm(false)} />
                </ModalShell>
            )}
            {showMovementForm && selectedBank && (
                <ModalShell title={editingMovement ? t('editMovement') : t('addMovement')} onClose={() => setShowMovementForm(false)}>
                    <MovementForm movement={editingMovement} bankAccountId={selectedBank.id} onClose={() => setShowMovementForm(false)} />
                </ModalShell>
            )}
            {reconciling && (
                <ModalShell title={t('reconcileWith')} onClose={() => setReconciling(null)}>
                    <ReconcileModal movement={reconciling} onClose={() => setReconciling(null)} />
                </ModalShell>
            )}
        </div>
    );
};

export default ReconciliationView;
