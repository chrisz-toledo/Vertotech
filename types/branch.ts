export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string; // Link to Employee
  isActive: boolean;
  createdAt: string;
  deletedAt?: string; // Soft-delete marker (matches codebase convention)
}
