import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../../types';
import { VIEW_PERMISSION_KEYS } from '../../types';

export interface RoleState {
    roles: Role[];
}

interface RoleActions {
    saveRole: (data: { name: string; description: string; permissions: string[] }, id?: string) => void;
    deleteRole: (id: string) => void;
    /** Populates the default system roles when the store is empty (safe to call repeatedly). */
    ensureSeeded: () => void;
}

export const initialState: RoleState = {
    roles: [],
};

const seedRoles = (): Role[] => {
    const createdAt = new Date().toISOString();
    const allViews = [...VIEW_PERMISSION_KEYS];
    return [
        {
            id: 'role-admin',
            name: 'Administrador',
            description: 'Acceso total a todo el sistema.',
            permissions: ['*'],
            isSystem: true,
            createdAt,
        },
        {
            id: 'role-manager',
            name: 'Gerente',
            description: 'Acceso amplio a todas las vistas y permisos de edición, finanzas y nómina.',
            permissions: [
                ...allViews,
                'edit:employees',
                'edit:finance',
                'edit:operations',
                'approve:payroll',
            ],
            isSystem: true,
            createdAt,
        },
        {
            id: 'role-employee',
            name: 'Empleado',
            description: 'Acceso limitado a las vistas de uso diario.',
            permissions: [
                'view:dashboard',
                'view:my-day',
                'view:time-tracking',
                'view:planning',
                'view:documents',
            ],
            isSystem: true,
            createdAt,
        },
    ];
};

export const useRoleStore = create<RoleState & RoleActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            saveRole: (data, id) => set(state => {
                if (id) {
                    const existing = state.roles.find(r => r.id === id);
                    if (!existing) return state;
                    // System roles keep name/description locked; only their permissions can be edited.
                    const updates = existing.isSystem
                        ? { permissions: data.permissions }
                        : { name: data.name, description: data.description, permissions: data.permissions };
                    return { roles: state.roles.map(r => (r.id === id ? { ...r, ...updates } : r)) };
                }
                const newRole: Role = {
                    id: `role-${Date.now()}`,
                    name: data.name,
                    description: data.description,
                    permissions: data.permissions,
                    isSystem: false,
                    createdAt: new Date().toISOString(),
                };
                return { roles: [...state.roles, newRole] };
            }),
            deleteRole: (id) => set(state => {
                const target = state.roles.find(r => r.id === id);
                if (!target || target.isSystem) return state; // System roles cannot be deleted.
                return { roles: state.roles.filter(r => r.id !== id) };
            }),
            ensureSeeded: () => {
                if (get().roles.length === 0) {
                    set({ roles: seedRoles() });
                }
            },
        }),
        {
            name: 'role-storage',
            onRehydrateStorage: () => (state) => {
                // Lazy init: seed the default roles on first load only if nothing was persisted.
                if (state && state.roles.length === 0) {
                    state.ensureSeeded();
                }
            },
        }
    )
);
