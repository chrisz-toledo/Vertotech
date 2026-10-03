import type { IndustryId } from './industry';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string; // Link to Employee
  /** Optional per-branch industry override. Falls back to the company's default industry. */
  industryId?: IndustryId;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string; // Soft-delete marker (matches codebase convention)
}
