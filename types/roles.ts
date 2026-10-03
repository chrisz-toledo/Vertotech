import type { ViewType } from './shared';

/**
 * Permission key catalogue.
 *
 * - `view:<view-id>` — grants access to a single view (one key per ViewType):
 *   view:dashboard, view:my-day, view:bids, view:employees, view:clients,
 *   view:subcontractors, view:jobsites, view:planning, view:time-tracking,
 *   view:productivity, view:extra-work, view:payroll, view:balance,
 *   view:invoices, view:estimates, view:purchase-orders, view:payables,
 *   view:petty-cash, view:expenses, view:inventory, view:fleet, view:training,
 *   view:safety, view:analytics, view:documents, view:legal, view:prices,
 *   view:crm, view:prospects, view:suppliers, view:daily-logs,
 *   view:project-center, view:leave-requests, view:contracts, view:tasks,
 *   view:roles
 * - Action keys (cross-cutting capabilities, not tied to a single view):
 *   edit:employees, edit:finance, approve:payroll, admin:settings, edit:operations
 * - `*` — wildcard: grants every permission.
 */
export const VIEW_PERMISSION_KEYS: Array<`view:${ViewType}`> = [
    'view:dashboard', 'view:my-day', 'view:bids', 'view:employees', 'view:clients',
    'view:subcontractors', 'view:jobsites', 'view:planning', 'view:time-tracking',
    'view:productivity', 'view:extra-work', 'view:payroll', 'view:balance',
    'view:invoices', 'view:estimates', 'view:purchase-orders', 'view:payables',
    'view:petty-cash', 'view:expenses', 'view:inventory', 'view:fleet',
    'view:training', 'view:safety', 'view:analytics', 'view:documents',
    'view:legal', 'view:prices', 'view:crm', 'view:prospects', 'view:suppliers',
    'view:daily-logs', 'view:project-center', 'view:leave-requests',
    'view:contracts', 'view:tasks', 'view:roles',
];

export const ACTION_PERMISSION_KEYS = [
    'edit:employees',
    'edit:finance',
    'approve:payroll',
    'admin:settings',
    'edit:operations',
] as const;
export type ActionPermissionKey = (typeof ACTION_PERMISSION_KEYS)[number];

/** Any assignable permission key, plus the `*` wildcard. */
export type PermissionKey = `view:${ViewType}` | ActionPermissionKey | '*';

export const WILDCARD_PERMISSION = '*';

/** Every documented permission key (excludes the wildcard). */
export const ALL_PERMISSION_KEYS: string[] = [...VIEW_PERMISSION_KEYS, ...ACTION_PERMISSION_KEYS];

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    /** System roles are seeded, cannot be deleted, and keep their name/description locked. */
    isSystem: boolean;
    createdAt: string;
}
