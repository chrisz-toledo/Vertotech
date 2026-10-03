import React, { useState } from 'react';
import type { Account, AccountType } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountingStore } from '../../hooks/stores/useAccountingStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { BookOpenIcon } from '../icons/new/BookOpenIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { ModalShell, Field, inputCls, useAccountTypeOptions } from './accountingShared';

const TYPE_BADGE: Record<AccountType, string> = {
    activo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    pasivo: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    patrimonio: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    ingreso: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    gasto: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const AccountForm: React.FC<{ account: Account | null; onClose: () => void }> = ({ account, onClose }) => {
    const { t } = useTranslation();
    const { saveAccount } = useAccountingStore();
    const typeOptions = useAccountTypeOptions();
    const [code, setCode] = useState(account?.code || '');
    const [name, setName] = useState(account?.name || '');
    const [type, setType] = useState<AccountType>(account?.type || 'activo');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) return;
        saveAccount({ code: code.trim(), name: name.trim(), type }, account?.code);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Field label={t('accountCode')}>
                    <input className={inputCls} value={code} onChange={e => setCode(e.target.value)} disabled={!!account} required placeholder="1000" />
                </Field>
                <Field label={t('accountType')}>
                    <select className={inputCls} value={type} onChange={e => setType(e.target.value as AccountType)}>
                        {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </Field>
            </div>
            <Field label={t('accountName')}>
                <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required placeholder={t('accountName')} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">{t('save')}</button>
            </div>
        </form>
    );
};

const AccountingView: React.FC = () => {
    const { t } = useTranslation();
    const { accounts, toggleAccountActive } = useAccountingStore();
    const appStore = useAppStore();
    const typeOptions = useAccountTypeOptions();
    const typeLabel = (type: AccountType) => typeOptions.find(o => o.value === type)?.label || type;
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    const visible = accounts.filter(a => showInactive || a.isActive);

    const openNew = () => { setEditing(null); setShowForm(true); };
    const openEdit = (a: Account) => { setEditing(a); setShowForm(true); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookOpenIcon className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('chartOfAccounts')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('accounting')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
                        {t('inactive')}
                    </label>
                    <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5" />{t('addAccount')}
                    </button>
                </div>
            </div>

            {visible.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('accountCode')}</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('accountName')}</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('accountType')}</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('entryStatus')}</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {visible.map(a => (
                                <tr key={a.code} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${!a.isActive ? 'opacity-60' : ''}`}>
                                    <td className="p-4 font-mono font-bold text-gray-900 dark:text-gray-100">{a.code}</td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{a.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${TYPE_BADGE[a.type]}`}>{typeLabel(a.type)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${a.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {a.isActive ? t('active') : t('inactive')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(a)} className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">{t('edit')}</button>
                                            {a.isActive ? (
                                                <button
                                                    onClick={() => appStore.confirm({ title: t('confirmDeactivateAccount'), message: t('confirmDeactivateAccountMessage'), onConfirm: () => toggleAccountActive(a.code) })}
                                                    className="px-3 py-1.5 text-sm font-semibold text-rose-700 bg-rose-100 rounded-lg hover:bg-rose-200"
                                                >{t('deactivate')}</button>
                                            ) : (
                                                <button onClick={() => toggleAccountActive(a.code)} className="px-3 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200">{t('activate')}</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noAccounts')}</h3>
                </div>
            )}

            {showForm && (
                <ModalShell title={editing ? t('editAccount') : t('addAccount')} onClose={() => setShowForm(false)}>
                    <AccountForm account={editing} onClose={() => setShowForm(false)} />
                </ModalShell>
            )}
        </div>
    );
};

export default AccountingView;
