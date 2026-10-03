/**
 * Restaurant domain types: tables ("mesas") and order tickets ("comandas").
 * Industry: restaurante.
 */

export type TableStatus = 'libre' | 'ocupada' | 'reservada';

export interface Table {
  id: string;
  branchId?: string;
  number: number;
  seats?: number;
  status: TableStatus;
  currentComandaId?: string;
}

export interface ComandaLine {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type ComandaStatus = 'abierta' | 'cerrada' | 'pagada';

export interface Comanda {
  id: string;
  tableId: string;
  branchId?: string;
  lines: ComandaLine[];
  status: ComandaStatus;
  createdAt: string;
  closedAt?: string;
  invoiceId?: string;
}
