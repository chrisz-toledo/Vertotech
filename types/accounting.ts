// --- Contabilidad (Accounting) ---

export type AccountType = 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto';

export interface Account {
    code: string;
    name: string;
    type: AccountType;
    isActive: boolean;
}

export interface JournalLine {
    accountCode: string;
    debit: number;
    credit: number;
}

export type JournalEntryStatus = 'borrador' | 'publicado';

export interface JournalEntry {
    id: string;
    date: string; // YYYY-MM-DD
    description: string;
    lines: JournalLine[];
    status: JournalEntryStatus;
    createdAt: string;
}

export interface BankAccount {
    id: string;
    name: string;
    accountCode: string; // links to Account.code in the chart of accounts
    isActive: boolean;
}

export interface BankMovement {
    id: string;
    bankAccountId: string;
    date: string; // YYYY-MM-DD
    description: string;
    amount: number;
    reconciledEntryId?: string; // JournalEntry.id of the posted entry it was reconciled against
}
