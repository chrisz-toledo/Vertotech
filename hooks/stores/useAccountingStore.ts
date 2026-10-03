import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, AccountType, BankAccount, BankMovement, JournalEntry, JournalLine } from '../../types';

// --- Default chart of accounts (seeded on first load) ---
export const DEFAULT_CHART_OF_ACCOUNTS: Account[] = [
    { code: '1000', name: 'Caja', type: 'activo', isActive: true },
    { code: '1100', name: 'Bancos', type: 'activo', isActive: true },
    { code: '1200', name: 'Cuentas por cobrar', type: 'activo', isActive: true },
    { code: '1300', name: 'Inventario', type: 'activo', isActive: true },
    { code: '2000', name: 'Cuentas por pagar', type: 'pasivo', isActive: true },
    { code: '2100', name: 'Préstamos', type: 'pasivo', isActive: true },
    { code: '3000', name: 'Capital', type: 'patrimonio', isActive: true },
    { code: '4000', name: 'Ingresos por servicios', type: 'ingreso', isActive: true },
    { code: '5000', name: 'Costo de ventas', type: 'gasto', isActive: true },
    { code: '6000', name: 'Gastos operativos', type: 'gasto', isActive: true },
    { code: '6100', name: 'Nómina', type: 'gasto', isActive: true },
];

// --- Validation ---
// Returns a translation key for the error, or null when the entry is valid.
export function validateJournalEntry(lines: JournalLine[]): string | null {
    const meaningful = lines.filter(l => l.accountCode && (l.debit > 0 || l.credit > 0));
    if (meaningful.length < 2) return 'journalErrorMinLines';
    const totalDebit = meaningful.reduce((s, l) => s + l.debit, 0);
    const totalCredit = meaningful.reduce((s, l) => s + l.credit, 0);
    if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.005) return 'journalErrorUnbalanced';
    return null;
}

export interface AccountingState {
    accounts: Account[];
    journalEntries: JournalEntry[];
    bankAccounts: BankAccount[];
    bankMovements: BankMovement[];

    deletedJournalEntries: JournalEntry[];
    deletedBankMovements: BankMovement[];
}

export interface AccountingActions {
    saveAccount: (data: Omit<Account, 'isActive'> & { isActive?: boolean }, code?: string) => void;
    toggleAccountActive: (code: string) => void;

    // Returns a translation key for the validation error, or null on success.
    saveJournalEntry: (data: { date: string; description: string; lines: JournalLine[] }, id?: string) => string | null;
    postJournalEntry: (id: string) => void;
    unpostJournalEntry: (id: string) => void;
    deleteJournalEntry: (ids: string[]) => void;

    saveBankAccount: (data: { name: string; accountCode: string }, id?: string) => void;
    toggleBankAccountActive: (id: string) => void;

    saveBankMovement: (data: { bankAccountId: string; date: string; description: string; amount: number }, id?: string) => void;
    deleteBankMovement: (ids: string[]) => void;
    reconcileMovement: (movementId: string, journalEntryId: string) => void;
    unreconcileMovement: (movementId: string) => void;
}

export const initialState: AccountingState = {
    accounts: DEFAULT_CHART_OF_ACCOUNTS,
    journalEntries: [],
    bankAccounts: [],
    bankMovements: [],
    deletedJournalEntries: [],
    deletedBankMovements: [],
};

export const useAccountingStore = create<AccountingState & AccountingActions>()(
    persist(
        (set) => ({
            ...initialState,

            saveAccount: (data, code) => set(state => {
                const isEditing = !!code;
                if (isEditing) {
                    return { accounts: state.accounts.map(a => a.code === code ? { ...a, ...data, code } : a) };
                }
                if (state.accounts.some(a => a.code === data.code)) return state; // code already exists
                const newAccount: Account = { ...data, isActive: data.isActive ?? true };
                return { accounts: [...state.accounts, newAccount].sort((a, b) => a.code.localeCompare(b.code)) };
            }),
            toggleAccountActive: (code) => set(state => ({
                accounts: state.accounts.map(a => a.code === code ? { ...a, isActive: !a.isActive } : a),
            })),

            saveJournalEntry: (data, id) => {
                const error = validateJournalEntry(data.lines);
                if (error) return error;
                const lines = data.lines
                    .filter(l => l.accountCode && (l.debit > 0 || l.credit > 0))
                    .map(l => ({ accountCode: l.accountCode, debit: l.debit, credit: l.credit }));
                set(state => {
                    if (id) {
                        return { journalEntries: state.journalEntries.map(e => e.id === id ? { ...e, ...data, lines } : e) };
                    }
                    const newEntry: JournalEntry = {
                        ...data,
                        lines,
                        id: `je-${Date.now()}`,
                        status: 'borrador',
                        createdAt: new Date().toISOString(),
                    };
                    return { journalEntries: [newEntry, ...state.journalEntries] };
                });
                return null;
            },
            postJournalEntry: (id) => set(state => ({
                journalEntries: state.journalEntries.map(e => e.id === id ? { ...e, status: 'publicado' } : e),
            })),
            unpostJournalEntry: (id) => set(state => ({
                journalEntries: state.journalEntries.map(e => e.id === id ? { ...e, status: 'borrador' } : e),
            })),
            deleteJournalEntry: (ids) => set(state => {
                const toDelete = state.journalEntries.filter(e => ids.includes(e.id));
                return {
                    journalEntries: state.journalEntries.filter(e => !ids.includes(e.id)),
                    deletedJournalEntries: [...state.deletedJournalEntries, ...toDelete],
                };
            }),

            saveBankAccount: (data, id) => set(state => {
                if (id) {
                    return { bankAccounts: state.bankAccounts.map(b => b.id === id ? { ...b, ...data } : b) };
                }
                const newBankAccount: BankAccount = { ...data, id: `bank-${Date.now()}`, isActive: true };
                return { bankAccounts: [...state.bankAccounts, newBankAccount] };
            }),
            toggleBankAccountActive: (id) => set(state => ({
                bankAccounts: state.bankAccounts.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b),
            })),

            saveBankMovement: (data, id) => set(state => {
                if (id) {
                    return { bankMovements: state.bankMovements.map(m => m.id === id ? { ...m, ...data } : m) };
                }
                const newMovement: BankMovement = { ...data, id: `bm-${Date.now()}` };
                return { bankMovements: [...state.bankMovements, newMovement] };
            }),
            deleteBankMovement: (ids) => set(state => {
                const toDelete = state.bankMovements.filter(m => ids.includes(m.id));
                return {
                    bankMovements: state.bankMovements.filter(m => !ids.includes(m.id)),
                    deletedBankMovements: [...state.deletedBankMovements, ...toDelete],
                };
            }),
            reconcileMovement: (movementId, journalEntryId) => set(state => ({
                bankMovements: state.bankMovements.map(m => m.id === movementId ? { ...m, reconciledEntryId: journalEntryId } : m),
            })),
            unreconcileMovement: (movementId) => set(state => ({
                bankMovements: state.bankMovements.map(m => m.id === movementId ? { ...m, reconciledEntryId: undefined } : m),
            })),
        }),
        { name: 'accounting-storage' }
    )
);

// --- Selectors / helpers ---

export interface LedgerLine {
    entryId: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

// Libro mayor for one account: lines from POSTED entries with running balance.
// Accounts of type activo/gasto carry a debit balance; pasivo/patrimonio/ingreso carry a credit balance.
export function computeLedger(accountCode: string, type: AccountType, entries: JournalEntry[]): LedgerLine[] {
    const lines = entries
        .filter(e => e.status === 'publicado')
        .sort((a, b) => a.date.localeCompare(b.date))
        .flatMap(e => e.lines
            .filter(l => l.accountCode === accountCode)
            .map(l => ({ entryId: e.id, date: e.date, description: e.description, debit: l.debit, credit: l.credit })));
    let balance = 0;
    return lines.map(l => {
        balance += (type === 'activo' || type === 'gasto') ? (l.debit - l.credit) : (l.credit - l.debit);
        return { ...l, balance };
    });
}

export interface TrialBalanceRow {
    code: string;
    name: string;
    type: AccountType;
    debit: number;
    credit: number;
}

export interface TrialBalance {
    rows: TrialBalanceRow[];
    totalDebit: number;
    totalCredit: number;
}

// Balance de comprobación: per-account debit/credit totals over POSTED entries.
export function computeTrialBalance(accounts: Account[], entries: JournalEntry[]): TrialBalance {
    const totals = new Map<string, { debit: number; credit: number }>();
    for (const entry of entries) {
        if (entry.status !== 'publicado') continue;
        for (const line of entry.lines) {
            const t = totals.get(line.accountCode) || { debit: 0, credit: 0 };
            t.debit += line.debit;
            t.credit += line.credit;
            totals.set(line.accountCode, t);
        }
    }
    const rows: TrialBalanceRow[] = accounts
        .filter(a => a.isActive && totals.has(a.code))
        .map(a => ({ code: a.code, name: a.name, type: a.type, debit: totals.get(a.code)!.debit, credit: totals.get(a.code)!.credit }))
        .sort((a, b) => a.code.localeCompare(b.code));
    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
    return { rows, totalDebit, totalCredit };
}

export interface ReconciliationStatus {
    totalReconciled: number;
    totalPending: number;
    countReconciled: number;
    countPending: number;
}

// Conciliación bancaria: totals split by reconciled vs pending movements.
export function computeReconciliationStatus(bankAccountId: string, movements: BankMovement[]): ReconciliationStatus {
    const relevant = movements.filter(m => m.bankAccountId === bankAccountId);
    let totalReconciled = 0, totalPending = 0, countReconciled = 0, countPending = 0;
    for (const m of relevant) {
        if (m.reconciledEntryId) { totalReconciled += m.amount; countReconciled++; }
        else { totalPending += m.amount; countPending++; }
    }
    return { totalReconciled, totalPending, countReconciled, countPending };
}
