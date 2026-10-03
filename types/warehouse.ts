// --- Inventario por Almacén (Warehouse Inventory) ---

export interface Warehouse {
  id: string;
  branchId?: string; // Optional: a branches module may exist separately; unused for now
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export type StockMovementType = 'entrada' | 'salida' | 'transferencia' | 'ajuste';

export interface StockMovement {
  id: string;
  productId: string;
  productType: 'material' | 'tool';
  warehouseId: string; // Destination warehouse for 'transferencia'
  fromWarehouseId?: string; // Source warehouse for 'transferencia'
  type: StockMovementType;
  quantity: number;
  date: string; // YYYY-MM-DD
  reference?: string;
  notes?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  productType: 'material' | 'tool';
  unit?: string;
  warehouseId: string;
  warehouseName: string;
  level: number;
  threshold: number;
}
