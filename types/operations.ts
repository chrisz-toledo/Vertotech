import type { Document } from './shared';

export type JobsiteStatus = 'not_started' | 'in_progress' | 'on_hold' | 'cancelled' | 'completed';

export interface DetailedBudget {
    labor: number;
    materials: number;
    subcontractors: number;
    miscellaneous: number;
}

export interface Jobsite {
  id: string;
  clientId: string; // Link to Client
  address: string; // This will become the formatted full address
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  buildingType?: 'house' | 'office' | 'building' | 'other';
  status: JobsiteStatus;
  deletedAt?: string;
  budget: DetailedBudget;
  estimatedDurationDays?: number;
  healthScore?: {
    score: number; // 0-100
    analysis: string;
    updatedAt: string;
  };
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  isWorkTimeEnforced?: boolean;
  workStartTime?: string; // e.g., "06:00"
  workEndTime?: string; // e.g., "17:00"
}

export interface DailyHours {
  regular: number;
  overtime: number;
}

export type WeekHours = {
  [day in 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun']: DailyHours;
};

export interface TimeLog {
  id: string;
  clientId: string;
  jobsiteId?: string;
  weekStartDate: string;
  employeeHours: {
    [employeeId: string]: WeekHours;
  };
  deletedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  clientId: string;
  jobsiteId?: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  locationVerified?: 'verified' | 'not_verified' | 'unavailable';
}

export interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
}

export interface ExtraWorkTicket {
  id: string;
  ticketNumber: string;
  clientId: string;
  jobsiteId: string;
  date: string; // YYY-MM-DD
  description: string;
  employeeIds: string[];
  hours: number;
  materialsUsed?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  signature: string; // Data URL
  createdAt: string;
  deletedAt?: string;
  costImpact: number;
  changeOrderId?: string;
  comments?: Comment[];
  category?: 'rework' | 'client_request';
}

export type ToolStatus = 'available' | 'in_use' | 'in_maintenance' | 'broken';

export type ToolAssignment = 
  | { type: 'unassigned' }
  | { type: 'employee', employeeId: string, assignedAt: string }
  | { type: 'jobsite', jobsiteId: string, assignedAt: string }
  | { type: 'warehouse', warehouseName: string, assignedAt: string };

export interface MaintenanceDetails {
  startDate: string;
  estimatedReturnDate: string;
  shopName: string;
  shopAddress?: string;
  shopContact?: string;
  trackingNumber?: string;
  sentBy?: string;
  requestedBy?: string;
  cost?: number;
  pickupInfo?: string;
}

export interface ToolAssignmentLog {
    id: string;
    toolId: string;
    type: 'check-in' | 'check-out';
    date: string; // ISO String
    from: string; // e.g., 'Warehouse', 'John Doe'
    to: string; // e.g., 'Jobsite X', 'Warehouse'
}

export interface Tool {
  id: string;
  name: string;
  type: string;
  status: ToolStatus;
  assignment: ToolAssignment;
  purchaseDate: string;
  value: number;
  serialNumber?: string;
  maintenanceDetails?: MaintenanceDetails;
  assignmentHistory?: ToolAssignmentLog[];
  deletedAt?: string;
}

export type MaterialLocation =
  | { type: 'warehouse'; name: string; }
  | { type: 'jobsite'; jobsiteId: string; };

export interface Material {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  unit: string;
  location: MaterialLocation;
  deletedAt?: string;
}

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'in_progress' | 'completed' | 'cancelled';

export interface Signature {
  dataUrl: string; // base64
  signedAt: string;
}

export interface Contract {
  id: string;
  clientId: string;
  jobsiteId: string;
  title: string;
  scopeOfWork: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalAmount: number;
  status: ContractStatus;
  document?: {
    mimeType: string;
    objectUrl: string;
    name: string;
  };
  companySignature?: Signature;
  clientSignature?: Signature;
  createdAt: string;
  deletedAt?: string;
}

export interface ProductivityTask {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface ProductionLog {
  id: string;
  date: string; // YYYY-MM-DD
  jobsiteId: string;
  responsible: {
    type: 'employees' | 'subcontractor';
    ids: string[]; // employee ids or a single subcontractor id
  };
  tasks: ProductivityTask[];
  createdAt: string;
  deletedAt?: string;
}

export type BidStatus = 'borrador' | 'enviada' | 'ganada' | 'perdida';
export type BidLineItemCategory = 'Mano de Obra' | 'Materiales' | 'Equipos' | 'Subcontratistas' | 'Permisos' | 'Misceláneos';

export interface BidLineItem {
  id: string;
  category: BidLineItemCategory;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Bid {
  id: string;
  bidNumber: string;
  clientId: string;
  title: string;
  projectAddress: string;
  date: string; // YYYY-MM-DD
  status: BidStatus;
  scopeOfWork: string;
  lineItems: BidLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  deletedAt?: string;
}

export type PunchListItemStatus = 'abierto' | 'en_progreso' | 'completado';
export interface PunchListItem {
    id: string;
    description: string;
    location: string;
    status: PunchListItemStatus;
    assignedTo?: string; // Employee ID
    photo?: {
        mimeType: string;
        objectUrl: string;
        name: string;
    };
    createdAt: string;
}

export interface PunchList {
    id: string;
    jobsiteId: string;
    name: string;
    items: PunchListItem[];
    createdAt: string;
    deletedAt?: string;
}

export type VehicleStatus = 'operational' | 'in_repair' | 'out_of_service';
export interface Vehicle {
    id: string;
    name: string; // e.g., "Ford F-150 #3"
    type: string; // e.g., "Truck", "Excavator"
    licensePlate?: string;
    vin?: string;
    purchaseDate: string;
    initialCost: number;
    status: VehicleStatus;
    deletedAt?: string;
}

export interface MaintenanceLog {
    id: string;
    vehicleId: string;
    date: string;
    description: string;
    cost: number;
    shop?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface Task {
  id: string;
  title: string;
  jobsiteId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedEmployeeIds: string[];
  createdAt: string;
  deletedAt?: string;
}

export interface ScheduleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  jobsiteId: string;
  employeeIds: string[];
}

export interface LegalDocument {
  id: string;
  name: string;
  type: 'insurance' | 'license' | 'permit' | 'corporate' | 'other';
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
  file: {
    mimeType: string;
    objectUrl: string;
    name: string;
  };
  createdAt: string;
  deletedAt?: string;
}

export interface SafetyReport {
  id: string;
  image: {
    mimeType: string;
    objectUrl: string;
    name: string;
  };
  analysis: string;
  createdAt: string;
}

export interface LogPhoto {
    id: string;
    file: {
        mimeType: string;
        objectUrl: string;
        name: string;
    };
    analysis?: string; // AI-generated description
}

export interface DailyLog {
    id: string; // YYYY-MM-DD-jobsiteId
    jobsiteId: string;
    date: string; // YYYY-MM-DD
    notes: string;
    photos: LogPhoto[];
    summary?: string; // AI-generated summary
    createdAt: string;
    deletedAt?: string;
}