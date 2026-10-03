import React, { useState } from 'react';
import type { Branch } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useBranchStore } from '../../hooks/stores/useBranchStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { BuildingIcon } from '../icons/BuildingIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CheckCircleIcon } from '../icons/new/CheckCircleIcon';

const BranchFormModal: React.FC<{ isOpen: boolean; onClose: () => void; editingBranch: Branch | null }> = ({ isOpen, onClose, editingBranch }) => {
    const { t } = useTranslation();
    const saveBranch = useBranchStore(s => s.saveBranch);
    const employees = usePeopleStore(s => s.employees);

    const [name, setName] = useState(editingBranch?.name || '');
    const [address, setAddress] = useState(editingBranch?.address || '');
    const [phone, setPhone] = useState(editingBranch?.phone || '');
    const [managerId, setManagerId] = useState(editingBranch?.managerId || '');

    if (!isOpen) return null;

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        saveBranch(
            {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                managerId: managerId || undefined,
                isActive: editingBranch?.isActive ?? true,
            },
            editingBranch?.id
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {editingBranch ? t('editBranch') : t('addBranch')}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('branchName')}</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('branchAddress')}</label>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('branchPhone')}</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('branchManager')}</label>
                            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className={inputClass}>
                                <option value="">{t('noManager')}</option>
                                {employees.filter(e => e.isActive).map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                            {t('cancel')}
                        </button>
                        <button type="submit" className="px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BranchesView: React.FC = () => {
    const { t } = useTranslation();
    const { branches, currentBranchId, saveBranch, deleteBranch, setCurrentBranch } = useBranchStore();
    const employees = usePeopleStore(s => s.employees);
    const confirm = useAppStore(s => s.confirm);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const openCreate = () => {
        setEditingBranch(null);
        setIsModalOpen(true);
    };

    const openEdit = (branch: Branch) => {
        setEditingBranch(branch);
        setIsModalOpen(true);
    };

    const toggleActive = (branch: Branch) => {
        saveBranch({ isActive: !branch.isActive }, branch.id);
    };

    const handleDelete = (branch: Branch) => {
        confirm({
            title: t('deleteBranchTitle'),
            message: t('deleteBranchMessage', { name: branch.name }),
            onConfirm: () => deleteBranch([branch.id]),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('branches')}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('branchesSubtitle')}</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('addBranch')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {branches.map(branch => {
                    const isCurrent = branch.id === currentBranchId;
                    const manager = branch.managerId ? employeeMap.get(branch.managerId) : undefined;
                    return (
                        <div key={branch.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
                                        <BuildingIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{branch.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('branchManager')}: {manager?.name || t('noManager')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${branch.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {branch.isActive ? t('branchActive') : t('branchInactive')}
                                    </span>
                                    {isCurrent && (
                                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                            {t('currentBranch')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                {branch.address && <p>{branch.address}</p>}
                                {branch.phone && <p>{branch.phone}</p>}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                {!isCurrent && branch.isActive ? (
                                    <button onClick={() => setCurrentBranch(branch.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {t('selectAsCurrent')}
                                    </button>
                                ) : <span />}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleActive(branch)}
                                        title={branch.isActive ? t('deactivateBranch') : t('activateBranch')}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${branch.isActive ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                                    >
                                        {branch.isActive ? t('deactivateBranch') : t('activateBranch')}
                                    </button>
                                    <button onClick={() => openEdit(branch)} title={t('edit')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(branch)} title={t('delete')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <BranchFormModal
                    key={editingBranch?.id || 'new'}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editingBranch={editingBranch}
                />
            )}
        </div>
    );
};

export default BranchesView;
