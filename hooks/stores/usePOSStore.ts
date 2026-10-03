import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type POSPaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'giftcard';
export type CashMovementKind = 'ingreso' | 'retiro';

export interface GiftCard {
    code: string;
    balance: number;
    initialBalance: number;
    issuedAt: string;
    issuedBy?: string;
}

export interface CashMovement {
    id: string;
    kind: CashMovementKind;
    amount: number;
    reason: string;
    at: string;
}

export interface CashSession {
    id: string;
    branchId: string;
    openedBy: string;
    openedAt: string;
    openingAmount: number;
    movements: CashMovement[];
    closedAt?: string;
    closingAmount?: number;
}

export interface SalePayment {
    method: POSPaymentMethod;
    amount: number;
    giftCardCode?: string;
}

export interface SaleLine {
    productId: string;
    productType: 'material' | 'tool';
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface SaleRecord {
    id: string;
    invoiceId: string;
    branchId: string;
    salespersonId?: string;
    payments: SalePayment[];
    discountTotal: number;
    cashSessionId?: string;
    createdAt: string;
    lines: SaleLine[];
}

export interface ReturnLine {
    description: string;
    quantity: number;
    unitPrice: number;
    productId?: string;
    productType?: 'material' | 'tool';
}

export interface ReturnRecord {
    id: string;
    originalInvoiceId: string;
    lines: ReturnLine[];
    refundAmount: number;
    method: string;
    at: string;
}

export interface POSState {
    favorites: string[];
    barcodes: Record<string, string>; // productId -> code
    prices: Record<string, number>; // productId -> sale price (materials/tools carry no price field)
    giftCards: GiftCard[];
    cashSessions: CashSession[];
    sales: SaleRecord[];
    returns: ReturnRecord[];
    taxRate: number; // e.g. 0.16
}

interface POSActions {
    toggleFavorite: (productId: string) => void;
    setBarcode: (productId: string, code: string) => void;
    setPrice: (productId: string, price: number) => void;
    setTaxRate: (rate: number) => void;
    issueGiftCard: (balance: number, issuedBy?: string) => string;
    redeemGiftCard: (code: string, amount: number) => boolean;
    openSession: (branchId: string, openedBy: string, openingAmount: number) => string;
    closeSession: (sessionId: string, closingAmount: number) => void;
    addCashMovement: (sessionId: string, kind: CashMovementKind, amount: number, reason: string) => void;
    recordSale: (sale: Omit<SaleRecord, 'id' | 'createdAt'>) => string;
    recordReturn: (ret: Omit<ReturnRecord, 'id' | 'at'>) => string;
}

export const initialState: POSState = {
    favorites: [],
    barcodes: {},
    prices: {},
    giftCards: [],
    cashSessions: [],
    sales: [],
    returns: [],
    taxRate: 0.16,
};

const randomCode = (prefix: string, length = 8): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < length; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    return `${prefix}-${suffix}`;
};

export const usePOSStore = create<POSState & POSActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            toggleFavorite: (productId) => set(state => ({
                favorites: state.favorites.includes(productId)
                    ? state.favorites.filter(id => id !== productId)
                    : [...state.favorites, productId],
            })),

            setBarcode: (productId, code) => set(state => {
                const barcodes = { ...state.barcodes };
                const trimmed = code.trim();
                if (!trimmed) delete barcodes[productId];
                else barcodes[productId] = trimmed;
                return { barcodes };
            }),

            setPrice: (productId, price) => set(state => ({
                prices: { ...state.prices, [productId]: Math.max(0, price) },
            })),

            setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),

            issueGiftCard: (balance, issuedBy) => {
                const code = randomCode('GC', 8);
                const card: GiftCard = {
                    code,
                    balance,
                    initialBalance: balance,
                    issuedAt: new Date().toISOString(),
                    issuedBy,
                };
                set(state => ({ giftCards: [...state.giftCards, card] }));
                return code;
            },

            redeemGiftCard: (code, amount) => {
                const card = get().giftCards.find(c => c.code === code);
                if (!card || card.balance < amount) return false;
                set(state => ({
                    giftCards: state.giftCards.map(c =>
                        c.code === code ? { ...c, balance: Math.round((c.balance - amount) * 100) / 100 } : c
                    ),
                }));
                return true;
            },

            openSession: (branchId, openedBy, openingAmount) => {
                const id = `cs-${Date.now()}`;
                const session: CashSession = {
                    id,
                    branchId,
                    openedBy,
                    openedAt: new Date().toISOString(),
                    openingAmount,
                    movements: [],
                };
                set(state => ({ cashSessions: [...state.cashSessions, session] }));
                return id;
            },

            closeSession: (sessionId, closingAmount) => set(state => ({
                cashSessions: state.cashSessions.map(s =>
                    s.id === sessionId ? { ...s, closedAt: new Date().toISOString(), closingAmount } : s
                ),
            })),

            addCashMovement: (sessionId, kind, amount, reason) => set(state => ({
                cashSessions: state.cashSessions.map(s =>
                    s.id === sessionId
                        ? { ...s, movements: [...s.movements, { id: `cm-${Date.now()}`, kind, amount, reason, at: new Date().toISOString() }] }
                        : s
                ),
            })),

            recordSale: (sale) => {
                const id = `sale-${Date.now()}`;
                set(state => ({ sales: [...state.sales, { ...sale, id, createdAt: new Date().toISOString() }] }));
                return id;
            },

            recordReturn: (ret) => {
                const id = `ret-${Date.now()}`;
                set(state => ({ returns: [...state.returns, { ...ret, id, at: new Date().toISOString() }] }));
                return id;
            },
        }),
        { name: 'pos-storage' }
    )
);

/** Find the open cash session for a branch, if any. */
export const getOpenCashSession = (branchId: string): CashSession | undefined =>
    usePOSStore.getState().cashSessions.find(s => s.branchId === branchId && !s.closedAt);

/** Expected cash in a session: opening + ingresos - retiros + cash (efectivo) sale payments. */
export const getSessionExpectedCash = (session: CashSession): number => {
    const { sales } = usePOSStore.getState();
    const cashSales = sales
        .filter(s => s.cashSessionId === session.id)
        .reduce((sum, s) => sum + s.payments.filter(p => p.method === 'efectivo').reduce((a, p) => a + p.amount, 0), 0);
    const movements = session.movements.reduce(
        (sum, m) => sum + (m.kind === 'ingreso' ? m.amount : -m.amount), 0
    );
    return Math.round((session.openingAmount + movements + cashSales) * 100) / 100;
};

/** Resolve a product id from a scanned/typed barcode. */
export const findProductIdByBarcode = (code: string): string | undefined => {
    const { barcodes } = usePOSStore.getState();
    const needle = code.trim();
    return Object.keys(barcodes).find(pid => barcodes[pid] === needle);
};
