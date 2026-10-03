import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountingStore, computeLedger } from '../../hooks/stores/useAccountingStore';
import { CalculatorIcon } from '../icons/new/CalculatorIcon';
import { formatCurrency } from '../../utils/formatters';
import { inputCls, formatDate } from './accountingShared';

const LedgerView: React.FC = () => {
    const { t } = useTranslation();
    const { accounts, journalEntries } = useAccountingStore();
    const activeAccounts = useMemo(() => accounts.filter(a => a.isActive).sort((a, b) => a.code.localeCompare(b.code)), [accounts]);
    const [selectedCode, setSelectedCode] = useState('');

    const selectedAccount = accounts.find(a => a.code === selectedCode);
    const lines = useMemo(
        () => (selectedAccount ? computeLedger(selectedAccount.code, selectedAccount.type, journalEntries) : []),
        [selectedAccount, journalEntries]
    );
    const finalBalance = lines.length > 0 ? lines[lines.length - 1].balance : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <CalculatorIcon className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('ledger')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('postedOnly')}</p>
                    </div>
                </div>
                <div className="w-80">
                    <select className={inputCls} value={selectedCode} onChange={e => setSelectedCode(e.target.value)}>
                        <option value="">{t('selectAccount')}</option>
                        {activeAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                    </select>
                </div>
            </div>

            {!selectedAccount ? (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CalculatorIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('selectAccountToViewLedger')}</h3>
                </div>
            ) : (
                <>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{selectedAccount.code} — {selectedAccount.name}</h3>
                        <p className={`text-4xl font-bold mt-2 font-mono ${finalBalance >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatCurrency(finalBalance)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('runningBalance')}</p>
                    </div>

                    {lines.length > 0 ? (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('entryDate')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('entryDescription')}</th>
                                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('debit')}</th>
                                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('credit')}</th>
                                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('runningBalance')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {lines.map((l, i) => (
                                        <tr key={l.entryId + '-' + i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(l.date)}</td>
                                            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{l.description}</td>
                                            <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-200">{l.debit > 0 ? formatCurrency(l.debit) : ''}</td>
                                            <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-200">{l.credit > 0 ? formatCurrency(l.credit) : ''}</td>
                                            <td className="p-4 text-right font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(l.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noEntries')}</h3>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LedgerView;
