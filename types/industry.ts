import type { ViewType } from './shared';

/** Industries supported by the app. New industries are added here and in INDUSTRY_PROFILES. */
export type IndustryId = 'construccion' | 'retail' | 'restaurante' | 'taller' | 'servicios';

/**
 * Canonical term keys. Each industry profile re-labels these concepts with
 * the vocabulary its users expect (e.g. jobsite -> Obra / Sucursal / Restaurante).
 */
export type TermKey =
    | 'jobsite'
    | 'material'
    | 'tool'
    | 'client'
    | 'employee'
    | 'invoice'
    | 'estimate'
    | 'vehicle'
    | 'warehouse'
    | 'supplier'
    | 'bid'
    | 'contract'
    | 'workOrder'
    | 'timeLog'
    | 'project';

export interface IndustryProfile {
    id: IndustryId;
    name: string;
    icon: string;
    description: string;
    /** Per-industry vocabulary for the canonical TermKeys. */
    terms: Record<TermKey, string>;
    /** Views available while this industry is the current one. */
    enabledViews: ViewType[];
}

/**
 * All current views except the industry-exclusive ones (pos, tables, service-orders).
 * construccion keeps the full set; the other profiles carve out their own subset.
 */
const ALL_VIEWS_EXCEPT_EXCLUSIVE: ViewType[] = [
    'dashboard', 'my-day', 'project-center', 'analytics', 'branches', 'roles',
    'crm', 'prospects',
    'employees', 'clients', 'subcontractors', 'leave-requests',
    'invoices', 'estimates', 'payroll', 'expenses', 'payables', 'purchase-orders',
    'suppliers', 'petty-cash', 'balance', 'accounting', 'journal', 'ledger',
    'trial-balance', 'reconciliation', 'prices',
    'jobsites', 'daily-logs', 'planning', 'time-tracking', 'productivity', 'extra-work',
    'inventory', 'warehouses', 'stock-movements', 'fleet', 'safety', 'documents',
    'contracts', 'bids', 'tasks', 'training', 'legal',
];

const terms = (overrides: Partial<Record<TermKey, string>>, base: Record<TermKey, string>): Record<TermKey, string> => ({
    ...base,
    ...overrides,
});

const CONSTRUCCION_TERMS: Record<TermKey, string> = {
    jobsite: 'Obra',
    material: 'Material',
    tool: 'Herramienta',
    client: 'Cliente',
    employee: 'Empleado',
    invoice: 'Factura',
    estimate: 'Cotización',
    vehicle: 'Vehículo',
    warehouse: 'Almacén',
    supplier: 'Proveedor',
    bid: 'Licitación',
    contract: 'Contrato',
    workOrder: 'Orden de trabajo',
    timeLog: 'Registro de horas',
    project: 'Proyecto',
};

export const INDUSTRY_PROFILES: Record<IndustryId, IndustryProfile> = {
    construccion: {
        id: 'construccion',
        name: 'Construcción',
        icon: '🏗️',
        description: 'Obras, materiales, herramientas y personal de campo.',
        terms: CONSTRUCCION_TERMS,
        enabledViews: ALL_VIEWS_EXCEPT_EXCLUSIVE,
    },
    retail: {
        id: 'retail',
        name: 'Retail',
        icon: '🏪',
        description: 'Comercio minorista: productos, sucursales y punto de venta.',
        terms: terms({
            jobsite: 'Sucursal',
            material: 'Producto',
            tool: 'Equipo',
            invoice: 'Ticket',
        }, CONSTRUCCION_TERMS),
        enabledViews: [
            'dashboard', 'my-day', 'project-center', 'analytics', 'branches', 'roles',
            'crm', 'prospects',
            'employees', 'clients', 'leave-requests',
            'invoices', 'estimates', 'payroll', 'expenses', 'payables', 'purchase-orders',
            'suppliers', 'petty-cash', 'balance', 'accounting', 'journal', 'ledger',
            'trial-balance', 'reconciliation', 'prices',
            'inventory', 'warehouses', 'stock-movements',
            'documents', 'contracts', 'tasks', 'training', 'legal', 'safety',
            'time-tracking',
            'pos',
        ],
    },
    restaurante: {
        id: 'restaurante',
        name: 'Restaurante',
        icon: '🍽️',
        description: 'Restaurantes: comandas, mesas, insumos y personal.',
        terms: terms({
            jobsite: 'Restaurante',
            material: 'Insumo',
            tool: 'Equipo',
            invoice: 'Ticket',
            workOrder: 'Comanda',
        }, CONSTRUCCION_TERMS),
        enabledViews: [
            'dashboard', 'my-day', 'project-center', 'analytics', 'branches', 'roles',
            'crm', 'prospects',
            'employees', 'clients', 'leave-requests',
            'invoices', 'estimates', 'payroll', 'expenses', 'payables', 'purchase-orders',
            'suppliers', 'petty-cash', 'balance', 'accounting', 'journal', 'ledger',
            'trial-balance', 'reconciliation', 'prices',
            'inventory', 'warehouses', 'stock-movements',
            'documents', 'contracts', 'tasks', 'training', 'legal', 'safety',
            'time-tracking', 'planning',
            'tables',
        ],
    },
    taller: {
        id: 'taller',
        name: 'Taller',
        icon: '🔧',
        description: 'Talleres mecánicos: órdenes de servicio, repuestos y flota.',
        terms: terms({
            jobsite: 'Taller',
            material: 'Repuesto',
            workOrder: 'Orden de servicio',
        }, CONSTRUCCION_TERMS),
        enabledViews: [
            'dashboard', 'my-day', 'project-center', 'analytics', 'branches', 'roles',
            'crm', 'prospects',
            'employees', 'clients', 'subcontractors', 'leave-requests',
            'invoices', 'estimates', 'payroll', 'expenses', 'payables', 'purchase-orders',
            'suppliers', 'petty-cash', 'balance', 'accounting', 'journal', 'ledger',
            'trial-balance', 'reconciliation', 'prices',
            'jobsites', 'daily-logs', 'planning', 'time-tracking', 'productivity',
            'extra-work', 'inventory', 'warehouses', 'stock-movements', 'fleet',
            'documents', 'contracts', 'bids', 'tasks', 'training', 'legal', 'safety',
            'service-orders',
        ],
    },
    servicios: {
        id: 'servicios',
        name: 'Servicios',
        icon: '💼',
        description: 'Servicios profesionales: proyectos, cotizaciones y punto de venta.',
        terms: terms({
            jobsite: 'Proyecto',
            material: 'Insumo',
            tool: 'Equipo',
            workOrder: 'Orden de servicio',
        }, CONSTRUCCION_TERMS),
        enabledViews: [
            'dashboard', 'my-day', 'project-center', 'analytics', 'branches', 'roles',
            'crm', 'prospects',
            'employees', 'clients', 'subcontractors', 'leave-requests',
            'invoices', 'estimates', 'payroll', 'expenses', 'payables', 'purchase-orders',
            'suppliers', 'petty-cash', 'balance', 'accounting', 'journal', 'ledger',
            'trial-balance', 'reconciliation', 'prices',
            'jobsites', 'daily-logs', 'planning', 'time-tracking', 'productivity',
            'extra-work', 'inventory', 'warehouses', 'stock-movements',
            'documents', 'contracts', 'bids', 'tasks', 'training', 'legal', 'safety',
            'pos',
        ],
    },
};

/** Ordered list of industry ids, for selects and settings screens. */
export const INDUSTRY_IDS: IndustryId[] = ['construccion', 'retail', 'restaurante', 'taller', 'servicios'];
