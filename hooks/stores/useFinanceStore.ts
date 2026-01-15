
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, Estimate, PriceItem, Expense, Payable, PurchaseOrder, PettyCashTransaction, PayrollRun, SpecialPayment, TrashableType, StoreState, QuoteRequest, Employee, Jobsite, DailyHours } from '../../types';
import { usePeopleStore } from './usePeopleStore';
import { useAppStore } from './useAppStore';
import { useOperationsStore } from './useOperationsStore';

export interface FinanceState {
    invoices: Invoice[];
    estimates: Estimate[];
    priceItems: PriceItem[];
    expenses: Expense[];
    payables: Payable[];
    purchaseOrders: PurchaseOrder[];
    pettyCashTransactions: PettyCashTransaction[];
    payrollRuns: PayrollRun[];
    quoteRequests: QuoteRequest[];
    
    deletedInvoices: Invoice[];
    deletedEstimates: Estimate[];
    deletedPriceItems: PriceItem[];
    deletedExpenses: Expense[];
    deletedPayables: Payable[];
    deletedPurchaseOrders: PurchaseOrder[];
    deletedPettyCash: PettyCashTransaction[];
    deletedQuoteRequests: QuoteRequest[];
}

interface FinanceActions {
    setInvoices: (invoices: Invoice[]) => void;
    setEstimates: (estimates: Estimate[]) => void;
    setPriceItems: (priceItems: PriceItem[]) => void;
    setPayables: (payables: Payable[]) => void;
    setPurchaseOrders: (purchaseOrders: PurchaseOrder[]) => void;

    saveInvoice: (data: any) => void;
    deleteInvoice: (ids: string[]) => void;
    
    saveEstimate: (data: any, id?: string) => void;
    deleteEstimate: (ids: string[]) => void;
    
    savePriceItem: (data: any, id?: string) => void;
    deletePriceItem: (id: string) => void;

    saveExpense: (data: any, id?: string) => void;
    deleteExpense: (ids: string[]) => void;
    createExpenseForBalancePayment: (data: { employeeId: string; employeeName: string; amount: number; date: string; jobsiteId: string; notes: string; }) => void;

    savePayable: (data: any, id?: string) => void;
    deletePayable: (ids: string[]) => void;

    savePurchaseOrder: (data: any, id?: string) => void;
    deletePurchaseOrder: (ids: string[]) => void;

    savePettyCashTransaction: (data: any, id?: string) => void;
    deletePettyCashTransaction: (ids: string[]) => void;

    savePayrollRun: (data: any, id?: string) => void;
    markPayrollRunAsPaid: (id: string) => void;

    saveQuoteRequest: (data: any, id?: string) => void;
    deleteQuoteRequest: (ids: string[]) => void;

    addSpecialPayment: (data: any) => void;
    
    restoreItem: (ids: string[], type: TrashableType) => void;
    permanentlyDeleteItem: (ids: string[], type: TrashableType) => void;
}

export const initialState: FinanceState = {
    invoices: [], estimates: [], priceItems: [], expenses: [], payables: [],
    purchaseOrders: [], pettyCashTransactions: [], payrollRuns: [], quoteRequests: [],
    deletedInvoices: [], deletedEstimates: [], deletedPriceItems: [],
    deletedExpenses: [], deletedPayables: [], deletedPurchaseOrders: [], deletedPettyCash: [],
    deletedQuoteRequests: [],
};

export const useFinanceStore = create<FinanceState & FinanceActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setInvoices: (invoices) => set({ invoices }),
            setEstimates: (estimates) => set({ estimates }),
            setPriceItems: (priceItems) => set({ priceItems }),
            setPayables: (payables) => set({ payables }),
            setPurchaseOrders: (purchaseOrders) => set({ purchaseOrders }),
            
            saveInvoice: (data) => set(state => {
                const { invoices } = state;
                const isEditing = 'id' in data && !data.id.startsWith('manual-');
                if (isEditing) {
                    return { invoices: invoices.map(inv => inv.id === data.id ? data : inv) };
                }
                const newInvoiceNumber = (Math.max(0, ...invoices.map(i => parseInt(i.invoiceNumber, 10))) + 1).toString().padStart(5, '0');
                const newInvoice: Invoice = { ...data, id: `inv-${Date.now()}`, invoiceNumber: newInvoiceNumber, createdAt: new Date().toISOString() };
                return { invoices: [...invoices, newInvoice] };
            }),
            deleteInvoice: (ids) => set(state => {
                const toDelete = state.invoices.filter(i => ids.includes(i.id)).map(i => ({ ...i, deletedAt: new Date().toISOString() }));
                return { invoices: state.invoices.filter(i => !ids.includes(i.id)), deletedInvoices: [...state.deletedInvoices, ...toDelete] };
            }),

            saveEstimate: (data, id) => set(state => {
                const { estimates } = state;
                if (id) {
                    return { estimates: estimates.map(e => e.id === id ? { ...e, ...data } : e) };
                }
                const newEstimateNumber = (Math.max(0, ...estimates.map(e => parseInt(e.estimateNumber, 10))) + 1).toString().padStart(5, '0');
                const newEstimate: Estimate = { ...data, id: `est-${Date.now()}`, estimateNumber: newEstimateNumber, createdAt: new Date().toISOString() };
                return { estimates: [...estimates, newEstimate] };
            }),
            deleteEstimate: (ids) => set(state => {
                const toDelete = state.estimates.filter(e => ids.includes(e.id)).map(e => ({ ...e, deletedAt: new Date().toISOString() }));
                return { estimates: state.estimates.filter(e => !ids.includes(e.id)), deletedEstimates: [...state.deletedEstimates, ...toDelete] };
            }),

            savePriceItem: (data, id) => set(state => {
                if (id) {
                    return { priceItems: state.priceItems.map(p => p.id === id ? { ...p, ...data } : p) };
                }
                const newItem: PriceItem = { ...data, id: `price-${Date.now()}`, createdAt: new Date().toISOString() };
                return { priceItems: [...state.priceItems, newItem] };
            }),
            deletePriceItem: (id) => set(state => {
                const toDelete = state.priceItems.find(p => p.id === id);
                if (!toDelete) return state;
                return { priceItems: state.priceItems.filter(p => p.id !== id), deletedPriceItems: [...state.deletedPriceItems, { ...toDelete, deletedAt: new Date().toISOString() }] };
            }),

            saveExpense: (data, id) => set(state => {
                if (id) {
                    return { expenses: state.expenses.map(e => e.id === id ? { ...e, ...data } : e) };
                }
                const newExpense: Expense = { ...data, id: `exp-${Date.now()}` };
                return { expenses: [...state.expenses, newExpense] };
            }),
            deleteExpense: (ids) => set(state => {
                const toDelete = state.expenses.filter(e => ids.includes(e.id)).map(e => ({ ...e, deletedAt: new Date().toISOString() }));
                return { expenses: state.expenses.filter(e => !ids.includes(e.id)), deletedExpenses: [...state.deletedExpenses, ...toDelete] };
            }),
            createExpenseForBalancePayment: ({ employeeId, employeeName, amount, date, jobsiteId, notes }) => set(state => {
                const newExpense: Expense = {
                    id: `exp-bal-${Date.now()}`,
                    description: `Balance payment to ${employeeName} - ${notes}`,
                    amount,
                    date,
                    category: 'Pago de Saldo',
                    jobsiteId,
                    employeeId,
                };
                return { expenses: [...state.expenses, newExpense] };
            }),
            savePayable: (data, id) => set(state => {
                let newPayables;
                let newPurchaseOrders = state.purchaseOrders;

                if (id) {
                    newPayables = state.payables.map(p => p.id === id ? { ...p, ...data } : p);
                } else {
                    const newPayable: Payable = { ...data, id: `pay-${Date.now()}` };
                    newPayables = [...state.payables, newPayable];

                    if (newPayable.purchaseOrderId) {
                        newPurchaseOrders = state.purchaseOrders.map(po =>
                            po.id === newPayable.purchaseOrderId
                                ? { ...po, payableId: newPayable.id }
                                : po
                        );
                    }
                }
                return { payables: newPayables, purchaseOrders: newPurchaseOrders };
            }),
            deletePayable: (ids) => set(state => {
                const toDelete = state.payables.filter(p => ids.includes(p.id)).map(p => ({...p, deletedAt: new Date().toISOString()}));
                return { payables: state.payables.filter(p => !ids.includes(p.id)), deletedPayables: [...state.deletedPayables, ...toDelete]};
            }),
            savePurchaseOrder: (data, id) => set(state => {
                if(id) return { purchaseOrders: state.purchaseOrders.map(p => p.id === id ? {...p, ...data} : p) };
                const newPONumber = `PO-${new Date().getFullYear()}-${(state.purchaseOrders.length + 1).toString().padStart(3, '0')}`;
                const newPO: PurchaseOrder = {...data, id: `po-${Date.now()}`, poNumber: newPONumber};
                return { purchaseOrders: [...state.purchaseOrders, newPO]};
            }),
            deletePurchaseOrder: (ids) => set(state => {
                const toDelete = state.purchaseOrders.filter(p => ids.includes(p.id)).map(p => ({...p, deletedAt: new Date().toISOString()}));
                return { purchaseOrders: state.purchaseOrders.filter(p => !ids.includes(p.id)), deletedPurchaseOrders: [...state.deletedPurchaseOrders, ...toDelete]};
            }),
            savePettyCashTransaction: (data, id) => set(state => {
                if(id) return { pettyCashTransactions: state.pettyCashTransactions.map(t => t.id === id ? {...t, ...data} : t) };
                const newTrans: PettyCashTransaction = {...data, id: `pc-${Date.now()}`};
                return { pettyCashTransactions: [...state.pettyCashTransactions, newTrans]};
            }),
            deletePettyCashTransaction: (ids) => set(state => {
                const toDelete = state.pettyCashTransactions.filter(t => ids.includes(t.id)).map(t => ({...t, deletedAt: new Date().toISOString()}));
                return { pettyCashTransactions: state.pettyCashTransactions.filter(t => !ids.includes(t.id)), deletedPettyCash: [...state.deletedPettyCash, ...toDelete]};
            }),
            savePayrollRun: (data, id) => set(state => {
                if(id) return { payrollRuns: state.payrollRuns.map(r => r.id === id ? data : r) };
                const newRun: PayrollRun = {...data, id: `prun-${Date.now()}`};
                return { payrollRuns: [...state.payrollRuns, newRun]};
            }),
            markPayrollRunAsPaid: (id) => {
                const runToPay = get().payrollRuns.find(r => r.id === id);
                if (runToPay) {
                    const { timeLogs, jobsites } = useOperationsStore.getState();
                    const { employees } = usePeopleStore.getState();
                    const employeeMap = new Map<string, Employee>(employees.map(e => [e.id, e]));
                    const jobsiteMap = new Map<string, Jobsite>(jobsites.map(j => [j.id, j]));
            
                    const jobsiteCosts = new Map<string, number>();
                    const relevantTimeLogs = timeLogs.filter(log => log.weekStartDate === runToPay.weekStartDate);
            
                    for (const log of relevantTimeLogs) {
                        const jobsiteId = log.jobsiteId;
                        if (!jobsiteId) continue;
            
                        for (const [employeeId, weekHours] of Object.entries(log.employeeHours)) {
                            const employee = employeeMap.get(employeeId);
                            if (!employee) continue;
            
                            const paymentForEmployeeInRun = runToPay.payments.find(p => p.employeeId === employeeId);
                            if (!paymentForEmployeeInRun) continue;

                            const dailyEarnings = Object.values(weekHours).reduce((sum, day: DailyHours) => {
                                return sum + (day.regular * employee.hourlyRate) + (day.overtime * employee.overtimeRate);
                            }, 0);
            
                            jobsiteCosts.set(jobsiteId, (jobsiteCosts.get(jobsiteId) || 0) + dailyEarnings);
                        }
                    }
            
                    const newExpenses: Expense[] = Array.from(jobsiteCosts.entries()).map(([jobsiteId, totalCost]) => {
                        const jobsite = jobsiteMap.get(jobsiteId);
                        const jobsiteAddress = jobsite?.address || `Jobsite ID: ${jobsiteId}`;
                        return {
                            id: `exp-payroll-${runToPay.id}-${jobsiteId}`,
                            description: `Nómina - Semana del ${new Date(runToPay.weekStartDate + 'T00:00:00Z').toLocaleDateString('es-ES', { timeZone: 'UTC' })} - ${jobsiteAddress}`,
                            amount: totalCost,
                            date: runToPay.processingDate,
                            category: 'Nómina',
                            jobsiteId: jobsiteId,
                            vendor: useAppStore.getState().companyInfo.name,
                        };
                    });
            
                    set(state => ({
                        payrollRuns: state.payrollRuns.map(r => r.id === id ? {...r, status: 'paid'} : r),
                        expenses: [...state.expenses, ...newExpenses]
                    }));

                    // This must run after expenses are created.
                    usePeopleStore.getState().processPayrollPayments(runToPay.payments);
                }
            },
            addSpecialPayment: (data) => set(state => {
                // This logic should likely be in usePeopleStore, but is here for simplicity of example
                return state;
            }),

            saveQuoteRequest: (data, id) => set(state => {
                if (id) {
                    return { quoteRequests: state.quoteRequests.map(q => q.id === id ? { ...q, ...data } : q) };
                }
                const newNumber = `RFQ-${new Date().getFullYear()}-${(state.quoteRequests.length + 1).toString().padStart(3, '0')}`;
                const newRequest: QuoteRequest = { ...data, id: `rfq-${Date.now()}`, requestNumber: newNumber, createdAt: new Date().toISOString() };
                return { quoteRequests: [...state.quoteRequests, newRequest] };
            }),
            deleteQuoteRequest: (ids) => set(state => {
                const toDelete = state.quoteRequests.filter(q => ids.includes(q.id)).map(q => ({ ...q, deletedAt: new Date().toISOString() }));
                return { quoteRequests: state.quoteRequests.filter(q => !ids.includes(q.id)), deletedQuoteRequests: [...state.deletedQuoteRequests, ...toDelete] };
            }),

            restoreItem: (ids, type) => set(state => {
                switch (type) {
                    case 'invoices': return { invoices: [...state.invoices, ...state.deletedInvoices.filter(i => ids.includes(i.id))], deletedInvoices: state.deletedInvoices.filter(i => !ids.includes(i.id)) };
                    // Add other cases...
                    default: return {};
                }
            }),
            permanentlyDeleteItem: (ids, type) => set(state => {
                 switch (type) {
                    case 'invoices': return { deletedInvoices: state.deletedInvoices.filter(i => !ids.includes(i.id)) };
                    // Add other cases...
                    default: return {};
                }
            }),
        }),
        { name: 'finance-storage' }
    )
);
