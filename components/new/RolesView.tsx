import React, { useMemo, useState } from 'react';
import type { Role } from '../../types';
import { ACTION_PERMISSION_KEYS, VIEW_PERMISSION_KEYS } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useRoleStore } from '../../hooks/stores/useRoleStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { ShieldCheckIcon } from '../icons/new/ShieldCheckIcon';
import { PlusIcon } from '../icons/new/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

const RolesView: React.FC = () => {
    const { t } = useTranslation();
    const { roles, saveRole, deleteRole } = useRoleStore();
    const { employees, saveEmployee } = usePeopleStore();
    const { confirm } = useAppStore();

    const [editing, setEditing] = useState<Role | null>(null);
    const [draftName, setDraftName] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');

    const permissionLabel = (key: string): string => {
        if (key === '*') return '*';
        if (key.startsWith('view:')) {
            const viewId = key.slice(5);
            const translated = t(viewId as any);
            return translated === viewId ? key : translated;
        }
        const translated = t(`perm:${key}` as any);
        return translated === `perm:${key}` ? key : translated;
    };

    const openEditor = (role: Role | null) => {
        setEditing(role);
        setDraftName(role?.name ?? '');
        setDraftDescription(role?.description ?? '');
        setDraftPermissions(role ? [...role.permissions] : []);
    };

    const togglePermission = (key: string) => {
        setDraftPermissions(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        );
    };

    const toggleGroup = (keys: string[], select: boolean) => {
        setDraftPermissions(prev => {
            const next = new Set(prev);
            keys.forEach(k => (select ? next.add(k) : next.delete(k)));
            return [...next];
        });
    };

    const handleSave = () => {
        if (!draftName.trim() && !editing?.isSystem) return;
        saveRole(
            { name: draftName.trim(), description: draftDescription.trim(), permissions: draftPermissions },
            editing?.id
        );
        setEditing(null);
    };

    const handleDelete = (role: Role) => {
        confirm({
            title: t('deleteRole'),
            message: `${t('deleteRoleConfirm')} "${role.name}"`,
            onConfirm: () => deleteRole(role.id),
        });
    };

    const toggleEmployeeRole = (employeeId: string, roleId: string, current: string[] | undefined) => {
        const next = (current ?? []).includes(roleId)
            ? (current ?? []).filter(id => id !== roleId)
            : [...(current ?? []), roleId];
        saveEmployee({ roleIds: next }, employeeId);
    };

    const visibleEmployees = useMemo(() => {
        const q = employeeSearch.trim().toLowerCase();
        return employees.filter(e => !e.deletedAt && (!q || e.name.toLowerCase().includes(q)));
    }, [employees, employeeSearch]);

    const PermissionGroup: React.FC<{ title: string; keys: string[] }> = ({ title, keys }) => (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{title}</h4>
                <div className="flex gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => toggleGroup(keys, true)}
                        className="text-blue-600 hover:underline"
                    >
                        {t('selectAll')}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleGroup(keys, false)}
                        className="text-gray-500 hover:underline"
                    >
                        {t('clear')}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {keys.map(key => (
                    <label
                        key={key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                            draftPermissions.includes(key)
                                ? 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200'
                                : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={draftPermissions.includes(key)}
                            onChange={() => togglePermission(key)}
                            className="accent-blue-600"
                        />
                        <span className="truncate">{permissionLabel(key)}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShieldCheckIcon className="w-7 h-7 text-indigo-600" />
                        {t('roles')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('rolesDesc')}</p>
                </div>
                <button
                    onClick={() => openEditor(null)}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('newRole')}</span>
                </button>
            </div>

            {/* Roles list */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roles.map(role => (
                    <div
                        key={role.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col gap-3"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <ShieldCheckIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                                <h3 className="font-bold text-gray-800 dark:text-white truncate">{role.name}</h3>
                            </div>
                            {role.isSystem && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 shrink-0">
                                    {t('systemRole')}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                            {role.description || '—'}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {role.permissions.includes('*')
                                ? '*'
                                : t('permissions') + ': ' + role.permissions.length}
                        </div>
                        <div className="flex gap-2 mt-auto pt-1">
                            <button
                                onClick={() => openEditor(role)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                                <PencilIcon className="w-4 h-4" />
                                {t('editRole')}
                            </button>
                            {!role.isSystem && (
                                <button
                                    onClick={() => handleDelete(role)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    {t('deleteRole')}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Employee assignment */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{t('assignRoles')}</h2>
                <input
                    type="text"
                    value={employeeSearch}
                    onChange={e => setEmployeeSearch(e.target.value)}
                    placeholder={t('searchEmployees')}
                    className="mt-2 mb-4 w-full md:w-80 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200"
                />
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {visibleEmployees.map(emp => (
                        <div
                            key={emp.id}
                            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                        >
                            <div className="w-48 shrink-0">
                                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{emp.name}</div>
                                <div className="text-xs text-gray-500">{emp.job}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {roles.map(role => {
                                    const checked = (emp.roleIds ?? []).includes(role.id);
                                    return (
                                        <label
                                            key={role.id}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs cursor-pointer transition-colors ${
                                                checked
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:border-indigo-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleEmployeeRole(emp.id, role.id, emp.roleIds)}
                                                className="sr-only"
                                            />
                                            {role.name}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role editor modal */}
            {editing !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            {editing ? t('editRole') : t('newRole')}
                            {editing?.isSystem && (
                                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 align-middle">
                                    {t('systemRole')}
                                </span>
                            )}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('roleName')}
                                </label>
                                <input
                                    type="text"
                                    value={draftName}
                                    onChange={e => setDraftName(e.target.value)}
                                    disabled={editing?.isSystem}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('roleDescription')}
                                </label>
                                <textarea
                                    value={draftDescription}
                                    onChange={e => setDraftDescription(e.target.value)}
                                    disabled={editing?.isSystem}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('permissions')}
                                </h3>
                                <PermissionGroup title={t('viewPermissions')} keys={[...VIEW_PERMISSION_KEYS]} />
                                <PermissionGroup title={t('actionPermissions')} keys={[...ACTION_PERMISSION_KEYS]} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setEditing(null)}
                                className="px-4 py-2 font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!editing?.isSystem && !draftName.trim()}
                                className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesView;
