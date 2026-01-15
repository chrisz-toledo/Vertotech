import type { ComplianceDocument, Document } from './shared';

export interface EmployeeRating {
  quality: number;
  speed: number;
  proactivity: number;
  punctuality: number;
  attendance: number;
  availability: number;
  obedience: number;
  problemSolving: number;
  specialty: number;
  autonomy: number;
}

export type EmployeeRole = 'Owner' | 'Project Manager' | 'Foreman' | 'Labor' | 'Carpenter' | 'Painter' | 'Concrete Finisher' | 'Drywall Installer' | 'Framing';

export interface BalanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'debit' | 'credit'; // debit: company owes employee, credit: company paid employee
  amount: number;
  description: string;
  jobsiteId?: string; // For expense tracking on payments
}

export interface Employee {
  id: string;
  name: string;
  phone1: string;
  phone2: string;
  job: string;
  role: EmployeeRole;
  ssn: string | null;
  hourlyRate: number;
  overtimeRate: number;
  photoUrl?: string;
  deletedAt?: string;
  isActive: boolean;
  rating: EmployeeRating;
  specialtyDescription: string;
  documents?: ComplianceDocument[];
  createdAt: string;
  balanceHistory: BalanceEntry[];
}

export interface ClientRating {
  ppeProvision: number;
  toolProvision: number;
  picky: number;
  payment: number;
  communication: number;
  problemSolving: number;
}

export interface Client {
  id: string;
  type: 'company' | 'individual';
  name: string;
  contactPerson: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  deletedAt?: string;
  isActive: boolean;
  rating: ClientRating;
  retentionPercentage?: number;
  documents?: Document[];
  createdAt: string;
  communicationLogs?: { id: string; date: string; type: string; notes: string }[];
}

export interface Subcontractor {
  id: string;
  name: string;
  trade: string;
  contactPerson: string;
  phone: string;
  email: string;
  documents: ComplianceDocument[];
  deletedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  trade: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  documents?: ComplianceDocument[];
  createdAt: string;
  deletedAt?: string;
}

export type LeaveRequestType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type LeaveRequestStatus = 'pending' | 'approved' | 'denied';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveRequestType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  status: LeaveRequestStatus;
  createdAt: string;
}