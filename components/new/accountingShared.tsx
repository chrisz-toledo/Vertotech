import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { AccountType } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';

export const inputCls =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <label className={`block ${className || ''}`}>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>
        {children}
    </label>
);

export const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} flex flex-col max-h-[90vh]`}
            onClick={e => e.stopPropagation()}
        >
            <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                <button onClick={onClose} aria-label="Cerrar"><XCircleIcon className="w-7 h-7 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" /></button>
            </header>
            <main className="p-6 overflow-y-auto">{children}</main>
        </div>
    </div>
);

export const useAccountTypeOptions = () => {
    const { t } = useTranslation();
    return React.useMemo(() => ([
        { value: 'activo' as AccountType, label: t('accountTypeActivo') },
        { value: 'pasivo' as AccountType, label: t('accountTypePasivo') },
        { value: 'patrimonio' as AccountType, label: t('accountTypePatrimonio') },
        { value: 'ingreso' as AccountType, label: t('accountTypeIngreso') },
        { value: 'gasto' as AccountType, label: t('accountTypeGasto') },
    ]), [t]);
};

export const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString();
};
