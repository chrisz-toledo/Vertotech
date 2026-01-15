import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import JSZip from 'jszip';
import type { CompanyInfo, FinancialSettings, Notification, ConsideredOpinion, JobRole, StoreState, ProductionLog, ViewType, Alert, FilterableEntity, SavedView, Employee, DocumentSettings } from '../../types';
import { initialCompanyInfo, initialJobRoles, demoData, initialSafetyTips } from '../../data/initialData';
import { usePeopleStore, initialState as peopleInitialState } from './usePeopleStore';
import { useCrmStore, initialState as crmInitialState } from './useCrmStore';
import { useFinanceStore, initialState as financeInitialState } from './useFinanceStore';
import { useOperationsStore, initialState as operationsInitialState } from './useOperationsStore';
import * as geminiService from '../../services/geminiService';

interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    onConfirm: () => void;
}

export type DashboardDateRange = 'week' | 'month' | 'last30days';

export interface AppState {
    companyInfo: CompanyInfo;
    theme: 'light' | 'dark';
    language: 'en' | 'es';
    currentView: ViewType;
    currentUser: Employee | null;
    viewModes: { [key in FilterableEntity]?: 'grid' | 'list' };
    financialSettings: FinancialSettings;
    documentSettings: DocumentSettings;
    jobRoles: string[];
    productivityUnits: string[];
    materialUnits: string[];
    expenseCategories: string[];
    payableCategories: string[];
    pettyCashCategories: string[];
    productionTasks: string[];
    safetyTips: string[];
    widgetOrder: string[];
    dashboardDateRange: DashboardDateRange;
    notifications: Notification[];
    consideredOpinions: ConsideredOpinion[];
    confirmationState: ConfirmationState;
    alerts: Alert[];
    isAlertsLoading: boolean;
    isFilterPanelOpen: boolean;
    filterPanelEntity: FilterableEntity | null;
    savedViews: SavedView[];
}

interface AppActions {
    updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
    toggleTheme: () => void;
    setLanguage: (lang: 'en' | 'es') => void;
    setCurrentView: (view: ViewType) => void;
    setViewMode: (entity: FilterableEntity, mode: 'grid' | 'list') => void;
    updateFinancialSettings: (settings: FinancialSettings) => void;
    updateDocumentSettings: (settings: Partial<DocumentSettings>) => void;
    addJobRole: (role: string) => void;
    updateJobRole: (oldRole: string, newRole: string) => void;
    removeJobRole: (role: string) => void;
    addProductivityUnit: (unit: string) => void;
    updateProductivityUnit: (oldUnit: string, newUnit: string) => void;
    removeProductivityUnit: (unit: string) => void;
    addMaterialUnit: (unit: string) => void;
    updateMaterialUnit: (oldUnit: string, newUnit: string) => void;
    removeMaterialUnit: (unit: string) => void;
    addExpenseCategory: (category: string) => void;
    updateExpenseCategory: (oldCat: string, newCat: string) => void;
    removeExpenseCategory: (category: string) => void;
    addPayableCategory: (category: string) => void;
    updatePayableCategory: (oldCat: string, newCat: string) => void;
    removePayableCategory: (category: string) => void;
    addPettyCashCategory: (category: string) => void;
    updatePettyCashCategory: (oldCat: string, newCat: string) => void;
    removePettyCashCategory: (category: string) => void;
    addProductionTask: (task: string) => void;
    getRandomSafetyTip: () => string;
    updateWidgetOrder: (order: string[]) => void;
    setDashboardDateRange: (range: DashboardDateRange) => void;
    updateNotifications: (notifications: Notification[]) => void;
    addConsideredOpinions: (opinions: string[]) => void;
    removeConsideredOpinion: (id: string) => void;
    generateAlerts: () => Promise<void>;
    generateComplianceAlerts: () => Promise<void>;
    confirm: (options: Omit<ConfirmationState, 'isOpen' | 'onConfirm'> & { onConfirm: () => void }) => void;
    closeConfirmation: () => void;
    handleConfirm: () => void;
    loadDemoData: () => void;
    resetData: () => void;
    exportData: () => void;
    importData: (file: File) => void;
    openFilterPanel: (entity: FilterableEntity) => void;
    closeFilterPanel: () => void;
    addSavedView: (view: SavedView) => void;
    removeSavedView: (id: string) => void;
}

const initialState: AppState = {
    companyInfo: {
        ...initialCompanyInfo,
        address: '123 Main St, Constructville, USA',
        phone: '555-123-4567',
        taxId: '12-3456789'
    },
    theme: 'light',
    language: 'es',
    currentView: 'dashboard',
    currentUser: null,
    viewModes: { employee: 'grid', client: 'grid' },
    financialSettings: {
        defaultTaxRate: 8.25,
        payrollSettings: { payPeriod: 'weekly', overtimeThresholdHours: 8 },
        invoiceSettings: { defaultTerms: 'Net 30', defaultNotes: 'Thank you for your business.', invoicePrefix: 'INV-' },
        checkPrintingSettings: {
            bankName: 'Bank of Verto',
            bankAddress: '456 Finance Ave, Moneytown, USA',
            accountNumber: '**** **** **** 1234',
            routingNumber: '*********'
        }
    },
    documentSettings: {
        accentColor: '#4f46e5', // Default: indigo-600
        logoPosition: 'right',
        fontFamily: "'Figtree', sans-serif",
        showCompanyInfo: true,
    },
    jobRoles: initialJobRoles.map(r => r.name),
    productivityUnits: ['wall', 'sq ft', 'linear ft', 'room'],
    materialUnits: ['pieces', 'sheets', 'bags', 'gallons', 'lbs', 'ft'],
    expenseCategories: ['Fuel', 'Materials', 'Meals', 'Tools', 'Subcontractor'],
    payableCategories: ['Materials', 'Subcontractor', 'Rent', 'Utilities'],
    pettyCashCategories: ['Materials', 'Fuel', 'Office Supplies', 'Miscellaneous'],
    productionTasks: ["Metal Frame", "Colgar Hojas", "Tapping Out"],
    safetyTips: initialSafetyTips,
    widgetOrder: ['briefing', 'alerts', 'liveStatus', 'stats', 'financial', 'actions', 'operational', 'opinions'],
    dashboardDateRange: 'week',
    notifications: [],
    consideredOpinions: [],
    confirmationState: { isOpen: false, title: '', message: '', onConfirm: () => {} },
    alerts: [],
    isAlertsLoading: false,
    isFilterPanelOpen: false,
    filterPanelEntity: null,
    savedViews: [],
};

export const useAppStore = create<AppState & AppActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            updateCompanyInfo: (info) => set(state => ({ companyInfo: { ...state.companyInfo, ...info } })),
            toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            setLanguage: (lang) => set({ language: lang }),
            setCurrentView: (view) => set({ currentView: view }),
            setViewMode: (entity, mode) => set(state => ({ viewModes: { ...state.viewModes, [entity]: mode } })),
            updateFinancialSettings: (settings) => set({ financialSettings: settings }),
            updateDocumentSettings: (settings) => set(state => ({ documentSettings: { ...state.documentSettings, ...settings } })),
            addJobRole: (role) => set(state => ({ jobRoles: [...state.jobRoles, role] })),
            updateJobRole: (oldRole, newRole) => set(state => ({ jobRoles: state.jobRoles.map(r => r === oldRole ? newRole : r) })),
            removeJobRole: (role) => set(state => ({ jobRoles: state.jobRoles.filter(r => r !== role) })),
            addProductivityUnit: (unit) => set(state => ({ productivityUnits: [...state.productivityUnits, unit] })),
            updateProductivityUnit: (oldUnit, newUnit) => set(state => ({ productivityUnits: state.productivityUnits.map(u => u === oldUnit ? newUnit : u) })),
            removeProductivityUnit: (unit) => set(state => ({ productivityUnits: state.productivityUnits.filter(u => u !== unit) })),
            addMaterialUnit: (unit) => set(state => ({ materialUnits: [...state.materialUnits, unit] })),
            updateMaterialUnit: (oldUnit, newUnit) => set(state => ({ materialUnits: state.materialUnits.map(u => u === oldUnit ? newUnit : u) })),
            removeMaterialUnit: (unit) => set(state => ({ materialUnits: state.materialUnits.filter(u => u !== unit) })),
            addExpenseCategory: (category) => set(state => ({ expenseCategories: [...state.expenseCategories, category] })),
            updateExpenseCategory: (oldCat, newCat) => set(state => ({ expenseCategories: state.expenseCategories.map(c => c === oldCat ? newCat : c) })),
            removeExpenseCategory: (category) => set(state => ({ expenseCategories: state.expenseCategories.filter(c => c !== category) })),
            addPayableCategory: (category) => set(state => ({ payableCategories: [...state.payableCategories, category] })),
            updatePayableCategory: (oldCat, newCat) => set(state => ({ payableCategories: state.payableCategories.map(c => c === oldCat ? newCat : c) })),
            removePayableCategory: (category) => set(state => ({ payableCategories: state.payableCategories.filter(c => c !== category) })),
            addPettyCashCategory: (category) => set(state => ({ pettyCashCategories: [...state.pettyCashCategories, category] })),
            updatePettyCashCategory: (oldCat, newCat) => set(state => ({ pettyCashCategories: state.pettyCashCategories.map(c => c === oldCat ? newCat : c) })),
            removePettyCashCategory: (category) => set(state => ({ pettyCashCategories: state.pettyCashCategories.filter(c => c !== category) })),
            addProductionTask: (task) => set(state => {
                const existingTasks = state.productionTasks.map(t => t.toLowerCase());
                if (!existingTasks.includes(task.toLowerCase().trim())) {
                    return { productionTasks: [...state.productionTasks, task.trim()] };
                }
                return {};
            }),
            getRandomSafetyTip: () => {
                const { safetyTips } = get();
                if (safetyTips.length === 0) return "Stay safe.";
                const randomIndex = Math.floor(Math.random() * safetyTips.length);
                return safetyTips[randomIndex];
            },
            updateWidgetOrder: (order) => set({ widgetOrder: order }),
            setDashboardDateRange: (range) => set({ dashboardDateRange: range }),
            updateNotifications: (notifications) => set({ notifications }),
            addConsideredOpinions: (opinions) => set(state => ({
                consideredOpinions: [
                    ...state.consideredOpinions,
                    ...opinions.map(op => ({ id: `op-${Date.now()}-${Math.random()}`, text: op, createdAt: new Date().toISOString() }))
                ]
            })),
            removeConsideredOpinion: (id: string) => set(state => ({
                consideredOpinions: state.consideredOpinions.filter(op => op.id !== id)
            })),
            generateAlerts: async () => {
                set({ isAlertsLoading: true });
                const { safetyReports } = useOperationsStore.getState();
                const alerts = await geminiService.generateAlerts(safetyReports);
                set({ alerts, isAlertsLoading: false });
            },
            generateComplianceAlerts: async () => {
                set({ isAlertsLoading: true });
                const { employees, subcontractors } = usePeopleStore.getState();
                const newAlerts = await geminiService.analyzeComplianceDocuments(employees, subcontractors);
                const newAlertsWithIds = newAlerts.map(alert => ({ ...alert, id: `alert-comp-${Date.now()}-${Math.random()}` }));
                set(state => ({
                    alerts: [
                        ...newAlertsWithIds,
                        ...state.alerts.filter(a => a.type !== 'compliance')
                    ],
                    isAlertsLoading: false,
                    notifications: [
                        ...state.notifications,
                        {
                            id: `notif-comp-${Date.now()}`,
                            message: newAlerts.length > 0 ? `${newAlerts.length} new compliance issues found.` : 'No new compliance issues found.',
                            type: newAlerts.length > 0 ? 'warning' : 'success',
                            createdAt: new Date().toISOString(),
                            read: false,
                        }
                    ]
                }));
            },
            confirm: (options) => set({ confirmationState: { ...options, isOpen: true } }),
            closeConfirmation: () => set(state => ({ confirmationState: { ...state.confirmationState, isOpen: false } })),
            handleConfirm: () => {
                get().confirmationState.onConfirm();
                get().closeConfirmation();
            },
            loadDemoData: () => {
                usePeopleStore.setState({ employees: demoData.employees, clients: demoData.clients, suppliers: demoData.suppliers, subcontractors: [], leaveRequests: [], deletedEmployees: [], deletedClients: [], deletedSubcontractors: [], deletedSuppliers: [] });
                useCrmStore.setState({ prospects: demoData.prospects, opportunities: demoData.opportunities, deletedProspects: [], deletedOpportunities: [] });
                useFinanceStore.setState({ invoices: demoData.invoices, estimates: demoData.estimates, priceItems: demoData.priceItems, expenses: [], payables: [], purchaseOrders: [], pettyCashTransactions: [], payrollRuns: [], quoteRequests: [], deletedInvoices: [], deletedEstimates: [], deletedPriceItems: [], deletedExpenses: [], deletedPayables: [], deletedPurchaseOrders: [], deletedPettyCash: [], deletedQuoteRequests: [] });
                useOperationsStore.setState({ jobsites: demoData.jobsites, extraWorkTickets: demoData.extraWorkTickets, legalDocuments: demoData.legalDocuments, contracts: [], timeLogs: [], tools: [], materials: [], productionLogs: [], bids: [], punchLists: [], vehicles: [], safetyReports: [], attendanceRecords: [], schedule: [], maintenanceLogs: [], toolAssignmentLogs: [], dailyLogs: [], deletedJobsites: [], deletedTimeLogs: [], deletedExtraWorkTickets: [], deletedTools: [], deletedMaterials: [], deletedContracts: [], deletedProductionLogs: [], deletedBids: [], deletedPunchLists: [], deletedVehicles: [], deletedLegalDocuments: [], deletedDailyLogs: [] });
                set({ notifications: [{ id: '1', message: 'Demo data loaded successfully!', type: 'success', createdAt: new Date().toISOString(), read: false }], currentUser: demoData.employees[0] });
            },
             resetData: () => {
                // This is a simplified reset.
                // A full implementation would involve clearing local storage for each persist middleware and reloading.
                // For now, we just reset the state of each store.
                usePeopleStore.setState(peopleInitialState);
                useCrmStore.setState(crmInitialState);
                useFinanceStore.setState(financeInitialState);
                useOperationsStore.setState(operationsInitialState);
                set(initialState);
            },
            exportData: () => {
                const zip = new JSZip();
                const allState = {
                    app: get(),
                    people: usePeopleStore.getState(),
                    crm: useCrmStore.getState(),
                    finance: useFinanceStore.getState(),
                    operations: useOperationsStore.getState(),
                };
                zip.file("data.json", JSON.stringify(allState, null, 2));
                zip.generateAsync({ type: "blob" }).then(content => {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(content);
                    link.download = `verto_backup_${new Date().toISOString().split('T')[0]}.zip`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            },
            importData: async (file: File) => {
                const zip = new JSZip();
                try {
                    const contents = await zip.loadAsync(file);
                    const dataFile = contents.file("data.json");
                    if (dataFile) {
                        const dataText = await dataFile.async("string");
                        const importedState = JSON.parse(dataText);
                        
                        // Selectively restore state to avoid overwriting functions
                        const { app, people, crm, finance, operations } = importedState;
                        set(app);
                        usePeopleStore.setState(people);
                        useCrmStore.setState(crm);
                        useFinanceStore.setState(finance);
                        useOperationsStore.setState(operations);
                        
                        alert("Data imported successfully!");
                    } else {
                        alert("Invalid backup file: data.json not found.");
                    }
                } catch (error) {
                    console.error("Import failed:", error);
                    alert("Failed to import data.");
                }
            },
            openFilterPanel: (entity) => set({ isFilterPanelOpen: true, filterPanelEntity: entity }),
            closeFilterPanel: () => set({ isFilterPanelOpen: false }),
            addSavedView: (view) => set(state => ({ savedViews: [...state.savedViews, view] })),
            removeSavedView: (id) => set(state => ({ savedViews: state.savedViews.filter(v => v.id !== id) })),
        }),
        {
            name: 'app-storage',
        }
    )
);