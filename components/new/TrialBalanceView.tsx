import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountingStore, computeTrialBalance } from '../../hooks/stores/useAccountingStore';
import { ChartBarIcon } from '../icons/new/ChartBarIcon';
import { formatCurrency } from '../../utils/formatters';

const TrialBalanceView: React.FC = () => {
    const { t } = useTranslation();
    const { accounts, journalEntries } = useAccountingStore();

    const trial = useMemo(() => computeTrialBalance(accounts, journalEntries), [accounts, journalEntries]);
    const difference = trial.totalDebit - trial.totalCredit;
    const isBalanced = Math.abs(difference) < 0.005;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('trial-balance')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('postedOnly')}</p>
                    </div>
                </div>
                <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${isBalanced ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                    {isBalanced ? t('balanced') : t('unbalanced')}
                </span>
            </div>

            {trial.rows.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('accountCode')}</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('accountName')}</th>
                                <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('debit')}</th>
                                <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('credit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {trial.rows.map(r => (
                                <tr key={r.code} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-mono font-bold text-gray-900 dark:text-gray-100">{r.code}</td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{r.name}</td>
                                    <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-200">{r.debit > 0 ? formatCurrency(r.debit) : ''}</td>
                                    <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-200">{r.credit > 0 ? formatCurrency(r.credit) : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-300 dark:border-gray-600">
                            <tr>
                                <td colSpan={2} className="p-4 font-bold text-gray-900 dark:text-gray-100 uppercase text-sm">{t('grandTotals')}</td>
                                <td className="p-4 text-right font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(trial.totalDebit)}</td>
                                <td className="p-4 text-right font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(trial.totalCredit)}</td>
                            </tr>
                            {!isBalanced && (
                                <tr>
                                    <td colSpan={2} className="p-4 font-bold text-rose-700 dark:text-rose-400 uppercase text-sm">{t('difference')}</td>
                                    <td colSpan={2} className="p-4 text-right font-mono font-bold text-rose-700 dark:text-rose-400">{formatCurrency(difference)}</td>
                                </tr>
                            )}
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noEntries')}</h3>
                </div>
            )}
        </div>
    );
};

export default TrialBalanceView;
