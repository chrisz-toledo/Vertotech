export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  taxId?: string;
}

export interface Document {
  id: string;
  name: string;
  file: {
    mimeType: string;
    objectUrl: string; 
    name: string;
  };
  uploadedAt: string;
}

export interface ComplianceDocument extends Document {
  type: 'insurance' | 'license' | 'w9' | 'certification' | 'other';
  expirationDate?: string;
}

export interface JobRole {
  name: string;
  description: string | null;
}

export interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}
export interface Quiz {
    title: string;
    questions: QuizQuestion[];
}


// --- New Types for AI Features ---
export type ChatMessagePart =
  | { type: 'text'; content: string }
  | { type: 'file'; content: { mimeType: string; data: string; name: 'string' } };

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: ChatMessagePart[];
  isLoading?: boolean;
}

export interface ConsideredOpinion {
  id: string;
  text: string;
  createdAt: string;
}

export type GlobalSearchResultItem = {
    id: string;
    type: 'employee' | 'client' | 'jobsite' | 'ticket' | 'tool' | 'material' | 'invoice' | 'estimate' | 'legal_document' | 'contract' | 'prospect' | 'opportunity' | 'supplier';
    name: string;
    details: string;
    matchReason: string;
};

export type GlobalSearchResult = GlobalSearchResultItem[];

export interface Alert {
  id: string;
  type: 'cost' | 'safety' | 'inventory' | 'operational' | 'compliance';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  relatedTo?: {
    type: 'employee' | 'subcontractor' | 'jobsite';
    id: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
  read: boolean;
}

export type ViewType = 'dashboard' | 'my-day' | 'bids' | 'employees' | 'clients' | 'subcontractors' | 'jobsites' | 'planning' | 'time-tracking' | 'productivity' | 'extra-work' | 'payroll' | 'balance' | 'invoices' | 'estimates' | 'purchase-orders' | 'payables' | 'petty-cash' | 'expenses' | 'inventory' | 'fleet' | 'training' | 'safety' | 'analytics' | 'documents' | 'legal' | 'prices' | 'crm' | 'prospects' | 'suppliers' | 'daily-logs' | 'project-center' | 'leave-requests' | 'contracts' | 'tasks';

export type TrashableType = 
    | 'employees' | 'clients' | 'jobsites' | 'timeLogs' | 'extraWorkTickets' 
    | 'invoices' | 'estimates' | 'tools' | 'materials' | 'expenses' | 'payables' 
    | 'purchaseOrders' | 'pettyCash' | 'subcontractors' | 'contracts' 
    | 'productionLogs' | 'bids' | 'punchLists' | 'vehicles' | 'legalDocuments' | 'priceItems'
    | 'prospects' | 'opportunities' | 'suppliers' | 'dailyLogs' | 'quoteRequests';

export interface FinancialSettings {
    defaultTaxRate: number; // As a percentage, e.g., 8.25 for 8.25%
    payrollSettings: {
        payPeriod: 'weekly' | 'bi-weekly';
        overtimeThresholdHours: number;
    };
    invoiceSettings: {
        defaultTerms: string;
        defaultNotes: string;
        invoicePrefix: string;
    };
    checkPrintingSettings: {
        bankName: string;
        bankAddress: string;
        accountNumber: string;
        routingNumber: string;
    };
}

export interface DocumentSettings {
  accentColor: string;
  logoPosition: 'left' | 'center' | 'right';
  fontFamily: string;
  showCompanyInfo: boolean;
}

export interface EmployeeFilters {
    job?: string;
    isActive?: boolean;
}

export interface ClientFilters {
    type?: 'company' | 'individual';
    isActive?: boolean;
}

export type FilterableEntity = 'employee' | 'client';

export interface SavedView {
    id: string;
    name: string;
    entity: FilterableEntity;
    filters: EmployeeFilters | ClientFilters;
}

// --- Store Types ---
export interface StoreState<T, A> {
  state: T;
  actions: A;
}