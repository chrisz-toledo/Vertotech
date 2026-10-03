import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warehouse, StockMovement, LowStockItem, Alert, TrashableType } from '../../types';
import { useOperationsStore } from './useOperationsStore';

export interface WarehouseState {
    warehouses: Warehouse[];
    stockMovements: StockMovement[];

    deletedWarehouses: Warehouse[];
    deletedStockMovements: StockMovement[];
}

interface WarehouseActions {
    saveWarehouse: (data: any, id?: string) => void;
    toggleWarehouseActive: (id: string) => void;
    deleteWarehouse: (ids: string[]) => void;

    saveStockMovement: (data: any) => void;
    deleteStockMovement: (ids: string[]) => void;

    restoreItem: (ids: string[], type: TrashableType) => void;
    permanentlyDeleteItem: (ids: string[], type: TrashableType) => void;
}

export const initialState: WarehouseState = {
    warehouses: [],
    stockMovements: [],
    deletedWarehouses: [],
    deletedStockMovements: [],
};

export const useWarehouseStore = create<WarehouseState & WarehouseActions>()(
    persist(
        (set) => ({
            ...initialState,

            saveWarehouse: (data, id) => set(state => {
                if (id) {
                    return { warehouses: state.warehouses.map(w => w.id === id ? { ...w, ...data } : w) };
                }
                const newWarehouse: Warehouse = { ...data, id: `wh-${Date.now()}`, createdAt: new Date().toISOString() };
                return { warehouses: [...state.warehouses, newWarehouse] };
            }),
            toggleWarehouseActive: (id) => set(state => ({
                warehouses: state.warehouses.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w)
            })),
            deleteWarehouse: (ids) => set(state => {
                const toDelete = state.warehouses.filter(w => ids.includes(w.id)).map(w => ({ ...w, deletedAt: new Date().toISOString() }));
                return {
                    warehouses: state.warehouses.filter(w => !ids.includes(w.id)),
                    deletedWarehouses: [...state.deletedWarehouses, ...toDelete]
                };
            }),

            saveStockMovement: (data) => set(state => {
                const newMovement: StockMovement = { ...data, id: `sm-${Date.now()}`, createdAt: new Date().toISOString() };
                return { stockMovements: [...state.stockMovements, newMovement] };
            }),
            deleteStockMovement: (ids) => set(state => {
                const toDelete = state.stockMovements.filter(m => ids.includes(m.id)).map(m => ({ ...m, deletedAt: new Date().toISOString() }));
                return {
                    stockMovements: state.stockMovements.filter(m => !ids.includes(m.id)),
                    deletedStockMovements: [...state.deletedStockMovements, ...toDelete]
                };
            }),

            restoreItem: (ids, type) => set(state => {
                switch (type) {
                    case 'warehouses': return { warehouses: [...state.warehouses, ...state.deletedWarehouses.filter(w => ids.includes(w.id))], deletedWarehouses: state.deletedWarehouses.filter(w => !ids.includes(w.id)) };
                    case 'stockMovements': return { stockMovements: [...state.stockMovements, ...state.deletedStockMovements.filter(m => ids.includes(m.id))], deletedStockMovements: state.deletedStockMovements.filter(m => !ids.includes(m.id)) };
                    default: return {};
                }
            }),
            permanentlyDeleteItem: (ids, type) => set(state => {
                switch (type) {
                    case 'warehouses': return { deletedWarehouses: state.deletedWarehouses.filter(w => !ids.includes(w.id)) };
                    case 'stockMovements': return { deletedStockMovements: state.deletedStockMovements.filter(m => !ids.includes(m.id)) };
                    default: return {};
                }
            }),
        }),
        { name: 'warehouse-storage' }
    )
);

// --- Selector helpers (balances are always derived from movements, never stored) ---

/**
 * Computes the stock level of a product in a warehouse by folding its movements
 * in chronological order. 'ajuste' sets the absolute level.
 */
export const getStockLevel = (productId: string, warehouseId: string): number => {
    const { stockMovements } = useWarehouseStore.getState();
    const relevant = stockMovements
        .filter(m => m.productId === productId && (m.warehouseId === warehouseId || m.fromWarehouseId === warehouseId))
        .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

    let level = 0;
    for (const m of relevant) {
        switch (m.type) {
            case 'entrada':
                if (m.warehouseId === warehouseId) level += m.quantity;
                break;
            case 'salida':
                if (m.warehouseId === warehouseId) level -= m.quantity;
                break;
            case 'transferencia':
                if (m.fromWarehouseId === warehouseId) level -= m.quantity;
                if (m.warehouseId === warehouseId) level += m.quantity;
                break;
            case 'ajuste':
                if (m.warehouseId === warehouseId) level = m.quantity;
                break;
        }
    }
    return level;
};

export interface ProductStockSummary {
    productId: string;
    productName: string;
    productType: 'material' | 'tool';
    unit?: string;
    level: number;
}

/**
 * Stock summary for one warehouse: every product with at least one movement
 * touching that warehouse, with its derived level.
 */
export const getStockByProduct = (warehouseId: string): ProductStockSummary[] => {
    const { warehouses, stockMovements } = useWarehouseStore.getState();
    const { materials, tools } = useOperationsStore.getState();
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (!warehouse) return [];

    const productIds = new Set<string>();
    for (const m of stockMovements) {
        if (m.warehouseId === warehouseId || m.fromWarehouseId === warehouseId) {
            productIds.add(m.productId);
        }
    }

    const productMap = new Map<string, { name: string; type: 'material' | 'tool'; unit?: string }>();
    materials.forEach(mt => productMap.set(mt.id, { name: mt.name, type: 'material', unit: mt.unit }));
    tools.forEach(t => productMap.set(t.id, { name: t.name, type: 'tool' }));

    const summary: ProductStockSummary[] = [];
    productIds.forEach(productId => {
        const info = productMap.get(productId) || { name: productId, type: 'material' as const };
        summary.push({
            productId,
            productName: info.name,
            productType: info.type,
            unit: info.unit,
            level: getStockLevel(productId, warehouseId),
        });
    });
    return summary.sort((a, b) => a.productName.localeCompare(b.productName));
};

/**
 * Returns products whose stock level in a warehouse is at or below the
 * threshold. Only products with at least one recorded movement are considered.
 * Materials and Tools have no minStock field, so a flat default of 5 is used
 * unless a different threshold is passed.
 */
export const getLowStockItems = (threshold = 5): LowStockItem[] => {
    const { warehouses } = useWarehouseStore.getState();
    const items: LowStockItem[] = [];
    for (const warehouse of warehouses) {
        if (!warehouse.isActive) continue;
        for (const s of getStockByProduct(warehouse.id)) {
            if (s.level <= threshold) {
                items.push({
                    productId: s.productId,
                    productName: s.productName,
                    productType: s.productType,
                    unit: s.unit,
                    warehouseId: warehouse.id,
                    warehouseName: warehouse.name,
                    level: s.level,
                    threshold,
                });
            }
        }
    }
    return items.sort((a, b) => a.level - b.level);
};

const getAppLanguage = (): 'es' | 'en' => {
    try {
        const raw = localStorage.getItem('language');
        if (raw) {
            const parsed = JSON.parse(raw);
            return parsed === 'en' ? 'en' : 'es';
        }
    } catch {
        // fall through to default
    }
    return 'es';
};

/**
 * Builds low-stock inventory alerts in the shape of the existing Alert type,
 * so useAppStore can merge them with the AI-generated alerts.
 */
export const buildLowStockAlerts = (threshold = 5): Alert[] => {
    const lang = getAppLanguage();
    return getLowStockItems(threshold).map(item => ({
        id: `alert-lowstock-${item.productId}-${item.warehouseId}`,
        type: 'inventory' as const,
        severity: (item.level <= 0 ? 'critical' : 'warning') as Alert['severity'],
        message: lang === 'es'
            ? `Stock bajo: ${item.productName} tiene ${item.level}${item.unit ? ` ${item.unit}` : ''} en ${item.warehouseName} (mínimo: ${item.threshold}).`
            : `Low stock: ${item.productName} has ${item.level}${item.unit ? ` ${item.unit}` : ''} in ${item.warehouseName} (minimum: ${item.threshold}).`,
    }));
};
