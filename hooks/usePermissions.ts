import { useMemo } from 'react';
import { useRoleStore } from './stores/useRoleStore';
import { usePeopleStore } from './stores/usePeopleStore';

/**
 * Checks whether the given role ids grant a permission.
 * - A role containing '*' grants everything.
 * - undefined/empty roleIds returns true (legacy fallback): users without
 *   assigned roles keep the previous behavior (gated only by the job-title
 *   `requiredRoles` mechanism), so existing setups are unchanged.
 */
export function hasPermission(roleIds: string[] | undefined, permission: string): boolean {
    if (!roleIds || roleIds.length === 0) return true;
    const { roles } = useRoleStore.getState();
    const granted = new Set<string>();
    for (const role of roles) {
        if (roleIds.includes(role.id)) {
            for (const p of role.permissions) granted.add(p);
        }
    }
    return granted.has('*') || granted.has(permission);
}

/** Reactive permission checker bound to the role store (re-renders when roles change). */
export function usePermissions(roleIds: string[] | undefined): (permission: string) => boolean {
    const roles = useRoleStore(s => s.roles);
    return useMemo(() => {
        if (!roleIds || roleIds.length === 0) return (_permission: string) => true;
        const granted = new Set<string>();
        for (const role of roles) {
            if (roleIds.includes(role.id)) {
                for (const p of role.permissions) granted.add(p);
            }
        }
        return (permission: string) => granted.has('*') || granted.has(permission);
    }, [roles, roleIds]);
}

/**
 * Resolves the current user's assigned role ids from the employees list.
 * Returns undefined when no user/employee is found (legacy fallback = allowed).
 */
export function useCurrentUserRoleIds(currentUserId: string | undefined): string[] | undefined {
    const employees = usePeopleStore(s => s.employees);
    return useMemo(() => {
        if (!currentUserId) return undefined;
        return employees.find(e => e.id === currentUserId)?.roleIds;
    }, [employees, currentUserId]);
}
