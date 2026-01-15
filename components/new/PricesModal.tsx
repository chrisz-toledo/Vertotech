import React from 'react';
import type { PriceItem } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PriceTagIcon } from '../icons/new/PriceTagIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';

interface PricesModalProps {
    isOpen: boolean;
    onClose: () => void;
    priceItems: PriceItem[];
    onAdd: () => void;
    onEdit: (item: PriceItem) => void;
    onDelete: (item: PriceItem) => void;
}

const PriceItemRow: React.FC<{ item: PriceItem, onEdit: (i: PriceItem) => void, onDelete: (i: PriceItem) => void }> = ({ item, onEdit, onDelete }) => {
    return (
        <tr className="bg-white dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{item.category}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">{item.description}</td>
            <td className="p-4 text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(item.rate)}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">/ {item.unit}</td>
            <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(item)} title="Edit Rate" className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(item)} title="Delete Rate" className="p-2 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </td>
        </tr>
    );
};

export const PricesModal: React.FC<PricesModalProps> = ({ isOpen, onClose, priceItems, onAdd, onEdit, onDelete }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col border border-gray-200 dark:border-gray-700 h-[90vh] max-h-[800px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <PriceTagIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Rate List</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full"><XCircleIcon className="w-8 h-8"/></button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    {priceItems.length > 0 ? (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-medium uppercase">Category</th>
                                        <th className="p-4 text-left text-xs font-medium uppercase">Description</th>
                                        <th className="p-4 text-right text-xs font-medium uppercase">Rate</th>
                                        <th className="p-4 text-left text-xs font-medium uppercase">Unit</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {priceItems.map(item => <PriceItemRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />)}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <PriceTagIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-xl font-semibold dark:text-gray-200">No rates registered</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Add a new rate to get started.</p>
                        </div>
                    )}
                </main>
                 <footer className="p-4 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{priceItems.length} rate(s) registered</p>
                    <button onClick={onAdd} className="px-5 py-2 font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover">
                        {t('addPriceItem')}
                    </button>
                </footer>
            </div>
        </div>
    );
};