import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Table, Comanda, ComandaLine, TableStatus } from '../../types/restaurant';
import { useFinanceStore } from './useFinanceStore';
import { useBranchStore } from './useBranchStore';

export interface RestaurantState {
    tables: Table[];
    comandas: Comanda[];
}

interface RestaurantActions {
    saveTable: (data: { number: number; seats?: number; status?: TableStatus }, id?: string) => void;
    deleteTable: (id: string) => void;
    setTableStatus: (id: string, status: TableStatus) => void;
    openComanda: (tableId: string) => string | null;
    addComandaLine: (comandaId: string, line: { productId?: string; description: string; quantity: number; unitPrice: number }) => void;
    removeComandaLine: (comandaId: string, lineId: string) => void;
    closeComanda: (comandaId: string) => void;
    cobrarComanda: (comandaId: string) => void;
}

export const initialState: RestaurantState = {
    tables: [],
    comandas: [],
};

const nowISO = () => new Date().toISOString();

export const useRestaurantStore = create<RestaurantState & RestaurantActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            saveTable: (data, id) => set(state => {
                const branchId = useBranchStore.getState().currentBranchId ?? undefined;
                if (id) {
                    return { tables: state.tables.map(t => (t.id === id ? { ...t, ...data } : t)) };
                }
                const newTable: Table = {
                    id: `table-${Date.now()}`,
                    branchId,
                    number: data.number,
                    seats: data.seats,
                    status: data.status ?? 'libre',
                };
                return { tables: [...state.tables, newTable].sort((a, b) => a.number - b.number) };
            }),

            deleteTable: (id) => set(state => ({
                tables: state.tables.filter(t => t.id !== id),
            })),

            setTableStatus: (id, status) => set(state => ({
                tables: state.tables.map(t => (t.id === id ? { ...t, status } : t)),
            })),

            openComanda: (tableId) => {
                const { tables, comandas } = get();
                const table = tables.find(t => t.id === tableId);
                if (!table) return null;
                const existing = comandas.find(c => c.id === table.currentComandaId && c.status === 'abierta');
                if (existing) return existing.id;
                const branchId = useBranchStore.getState().currentBranchId ?? undefined;
                const comanda: Comanda = {
                    id: `comanda-${Date.now()}`,
                    tableId,
                    branchId,
                    lines: [],
                    status: 'abierta',
                    createdAt: nowISO(),
                };
                set(state => ({
                    comandas: [...state.comandas, comanda],
                    tables: state.tables.map(t =>
                        t.id === tableId ? { ...t, status: 'ocupada' as TableStatus, currentComandaId: comanda.id } : t
                    ),
                }));
                return comanda.id;
            },

            addComandaLine: (comandaId, line) => set(state => ({
                comandas: state.comandas.map(c =>
                    c.id === comandaId && c.status === 'abierta'
                        ? { ...c, lines: [...c.lines, { ...line, id: `line-${Date.now()}-${Math.floor(Math.random() * 1e6)}` } as ComandaLine] }
                        : c
                ),
            })),

            removeComandaLine: (comandaId, lineId) => set(state => ({
                comandas: state.comandas.map(c =>
                    c.id === comandaId && c.status === 'abierta'
                        ? { ...c, lines: c.lines.filter(l => l.id !== lineId) }
                        : c
                ),
            })),

            closeComanda: (comandaId) => set(state => {
                const comanda = state.comandas.find(c => c.id === comandaId);
                if (!comanda) return {};
                return {
                    comandas: state.comandas.map(c =>
                        c.id === comandaId ? { ...c, status: 'cerrada' as const, closedAt: nowISO() } : c
                    ),
                    tables: state.tables.map(t =>
                        t.id === comanda.tableId ? { ...t, status: 'libre' as TableStatus, currentComandaId: undefined } : t
                    ),
                };
            }),

            cobrarComanda: (comandaId) => {
                const { comandas, tables } = get();
                const comanda = comandas.find(c => c.id === comandaId);
                if (!comanda || comanda.status !== 'abierta' || comanda.lines.length === 0) return;
                const table = tables.find(t => t.id === comanda.tableId);

                const lineItems = comanda.lines.map(l => ({
                    id: l.id,
                    description: l.description,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    amount: l.quantity * l.unitPrice,
                }));
                const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);
                const today = new Date().toISOString().split('T')[0];

                useFinanceStore.getState().saveInvoice({
                    clientId: 'walk-in-consumidor-final',
                    status: 'paid',
                    issueDate: today,
                    dueDate: today,
                    lineItems,
                    subtotal,
                    taxRate: 0,
                    taxAmount: 0,
                    total: subtotal,
                    notes: `Comanda restaurante — Mesa ${table ? table.number : ''}`.trim(),
                    branchId: comanda.branchId,
                });

                // saveInvoice appends the new invoice at the end; link it back.
                const invoices = useFinanceStore.getState().invoices;
                const invoice = invoices[invoices.length - 1];

                set(state => ({
                    comandas: state.comandas.map(c =>
                        c.id === comandaId
                            ? { ...c, status: 'pagada' as const, closedAt: nowISO(), invoiceId: invoice?.id }
                            : c
                    ),
                    tables: state.tables.map(t =>
                        t.id === comanda.tableId ? { ...t, status: 'libre' as TableStatus, currentComandaId: undefined } : t
                    ),
                }));
            },
        }),
        { name: 'restaurant-storage' }
    )
);
