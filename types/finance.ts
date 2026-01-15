export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sourceId?: string;
  sourceType?: 'timelog' | 'extrawork';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  createdAt: string;
  deletedAt?: string;
}

export interface EstimateLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  lineItems: EstimateLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface PriceItem {
    id: string;
    category: string;
    description: string;
    unit: string;
    rate: number;
    createdAt: string;
    deletedAt?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
    category: string;
    vendor?: string;
    jobsiteId?: string;
    employeeId?: string;
    receiptImage?: {
        mimeType: string;
        objectUrl: string;
        name: string;
    };
    deletedAt?: string;
}

export interface Payable {
    id: string;
    supplierId: string;
    purchaseOrderId?: string;
    invoiceNumber?: string;
    description: string;
    amountDue: number;
    amountPaid: number;
    issueDate: string; // YYYY-MM-DD
    dueDate: string; // YYYY-MM-DD
    status: 'unpaid' | 'partially_paid' | 'paid';
    category: string;
    document?: {
        mimeType: string;
        objectUrl: string;
        name: string;
    };
    deletedAt?: string;
}

export interface PurchaseOrderLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    payableId?: string;
    date: string; // YYYY-MM-DD
    jobsiteId?: string;
    lineItems: PurchaseOrderLineItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled';
    notes?: string;
    deletedAt?: string;
}

export interface PettyCashTransaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  description: string;
  amount: number;
  category?: string;
  employeeId?: string;
  receiptImage?: {
    mimeType: string;
    objectUrl: string;
    name: string;
  };
  deletedAt?: string;
}

export interface Deduction {
    description: string;
    amount: number;
}

export interface EmployeePayment {
    employeeId: string;
    employeeName: string;
    regularHours: number;
    overtimeHours: number;
    grossPay: number;
    deductions: Deduction[];
    calculatedNetPay: number;
    paidAmount: number;
    balancePaid: number;
    newBalanceCreated: number;
}

export interface PayrollRun {
    id: string;
    weekStartDate: string; // YYYY-MM-DD
    processingDate: string; // YYYY-MM-DD
    status: 'pending_payment' | 'paid';
    payments: EmployeePayment[];
    totalAmount: number;
}

export interface SpecialPayment {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface QuoteRequest {
    id: string;
    requestNumber: string;
    title: string;
    date: string; // YYYY-MM-DD
    deadline: string; // YYYY-MM-DD
    supplierIds: string[];
    lineItems: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
    }[];
    status: 'draft' | 'sent';
    createdAt: string;
    deletedAt?: string;
}