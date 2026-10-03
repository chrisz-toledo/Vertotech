import React, { useMemo, useState } from 'react';
import type { JournalEntry, JournalLine } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountingStore } from '../../hooks/stores/useAccountingStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { ReceiptIcon } from '../icons/new/ReceiptIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { ExclamationIcon } from '../icons/new/ExclamationIcon';
import { formatCurrency } from '../../utils/formatters';
import { ModalShell, Field, inputCls, formatDate } from './accountingShared';

interface LineDraft {
    key: number;
    accountCode: string;
    debit: string;
    credit: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const JournalEntryForm: React.FC<{ entry: JournalEntry | null; onClose: () => void }> = ({ entry, onClose }) => {
    const { t } = useTranslation();
    const { accounts, saveJournalEntry } = useAccountingStore();
    const activeAccounts = useMemo(() => accounts.filter(a => a.isActive), [accounts]);

    const [date, setDate] = useState(entry?.date || todayStr());
    const [description, setDescription] = useState(entry?.description || '');
    const [lines, setLines] = useState<LineDraft[]>(() =>
        entry
            ? entry.lines.map((l, i) => ({ key: i, accountCode: l.accountCode, debit: String(l.debit), credit: String(l.credit) }))
            : [{ key: 0, accountCode: '', debit: '', credit: '' }, { key: 1, accountCode: '', debit: '', credit: '' }]
    );
    const [error, setError] = useState<string | null>(null);
    const [keySeq, setKeySeq] = useState(2);

    const updateLine = (key: number, patch: Partial<LineDraft>) =>
        setLines(ls => ls.map(l => (l.key === key ? { ...l, ...patch } : l)));
    const addLine = () => { setLines(ls => [...ls, { key: keySeq, accountCode: '', debit: '', credit: '' }]); setKeySeq(k => k + 1); };
    const removeLine = (key: number) => setLines(ls => ls.filter(l => l.key !== key));

    const totals = useMemo(() => {
        const debit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
        const credit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
        return { debit, credit, balanced: debit > 0 && Math.abs(debit - credit) < 0.005 };
    }, [lines]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: JournalLine[] = lines.map(l => ({
            accountCode: l.accountCode,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
        }));
        const err = saveJournalEntry({ date, description: description.trim(), lines: payload }, entry?.id);
        if (err) { setError(t(err as any)); return; }
        setError(null);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label={t('entryDate')}>
                    <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} required />
                </Field>
                <div className="md:col-span-2">
                    <Field label={t('entryDescription')}>
                        <input className={inputCls} value={description} onChange={e => setDescription(e.target.value)} required placeholder={t('entryDescription')} />
                    </Field>
                </div>
            </div>

            <div className="space-y-2">
                {lines.map(line => (
                    <div key={line.key} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-6">
                            <select className={inputCls} value={line.accountCode} onChange={e => updateLine(line.key, { accountCode: e.target.value })}>
                                <option value="">{t('selectAccount')}</option>
                                {activeAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <input type="number" min="0" step="0.01" className={inputCls} value={line.debit} onChange={e => updateLine(line.key, { debit: e.target.value })} placeholder={t('debit')} />
                        </div>
                        <div className="col-span-2">
                            <input type="number" min="0" step="0.01" className={inputCls} value={line.credit} onChange={e => updateLine(line.key, { credit: e.target.value })} placeholder={t('credit')} />
                        </div>
                        <div className="col-span-2">
                            <button type="button" onClick={() => removeLine(line.key)} disabled={lines.length <= 2} className="px-2 py-2 text-sm font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-30">✕</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addLine} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-lg hover:bg-blue-200">
                    <PlusIcon className="w-4 h-4" />{t('addLine')}
                </button>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${totals.balanced ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('totals')}</span>
                <div className="flex items-center gap-4 text-sm">
                    <span>{t('debit')}: <strong className="font-mono">{formatCurrency(totals.debit)}</strong></span>
                    <span>{t('credit')}: <strong className="font-mono">{formatCurrency(totals.credit)}</strong></span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${totals.balanced ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                        {totals.balanced ? t('balanced') : t('unbalanced')}
                    </span>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 p-3 text-sm font-medium text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg">
                    <ExclamationIcon className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">{t('save')}</button>
            </div>
        </form>
    );
};

const JournalView: React.FC = () => {
    const { t } = useTranslation();
    const { journalEntries, accounts, postJournalEntry, unpostJournalEntry, deleteJournalEntry } = useAccountingStore();
    const appStore = useAppStore();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<JournalEntry | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'borrador' | 'publicado'>('all');

    const accountName = (code: string) => accounts.find(a => a.code === code)?.name || code;
    const filtered = journalEntries.filter(e => statusFilter === 'all' || e.status === statusFilter);

    const openNew = () => { setEditing(null); setShowForm(true); };
    const openEdit = (e: JournalEntry) => { setEditing(e); setShowForm(true); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ReceiptIcon className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('journalEntries')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('postedOnly')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select className={inputCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={{ width: 'auto' }}>
                        <option value="all">{t('entryStatus')}</option>
                        <option value="borrador">{t('draft')}</option>
                        <option value="publicado">{t('posted')}</option>
                    </select>
                    <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5" />{t('newJournalEntry')}
                    </button>
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map(entry => {
                        const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
                        return (
                            <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</span>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${entry.status === 'publicado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                {entry.status === 'publicado' ? t('posted') : t('draft')}
                                            </span>
                                        </div>
                                        <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{entry.description}</h3>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {entry.lines.map((l, i) => (
                                                <span key={i} className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">
                                                    {l.accountCode} {accountName(l.accountCode)} · {t('debit')} {formatCurrency(l.debit)} / {t('credit')} {formatCurrency(l.credit)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">{formatCurrency(totalDebit)}</p>
                                        <div className="mt-2 flex items-center justify-end gap-2">
                                            {entry.status === 'borrador' ? (
                                                <>
                                                    <button onClick={() => openEdit(entry)} className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">{t('edit')}</button>
                                                    <button
                                                        onClick={() => appStore.confirm({ title: t('confirmPost'), message: t('confirmPostMessage'), onConfirm: () => postJournalEntry(entry.id) })}
                                                        className="px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                                                    >{t('post')}</button>
                                                    <button
                                                        onClick={() => appStore.confirm({ title: t('confirmDeleteEntry'), message: t('confirmDeleteEntryMessage'), onConfirm: () => deleteJournalEntry([entry.id]) })}
                                                        className="px-3 py-1.5 text-sm font-semibold text-rose-700 bg-rose-100 rounded-lg hover:bg-rose-200"
                                                    >{t('delete')}</button>
                                                </>
                                            ) : (
                                                <button onClick={() => unpostJournalEntry(entry.id)} className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">{t('unpost')}</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <ReceiptIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noEntries')}</h3>
                </div>
            )}

            {showForm && (
                <ModalShell title={editing ? t('editJournalEntry') : t('newJournalEntry')} onClose={() => setShowForm(false)} wide>
                    <JournalEntryForm entry={editing} onClose={() => setShowForm(false)} />
                </ModalShell>
            )}
        </div>
    );
};

export default JournalView;
