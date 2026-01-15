

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Employee, Client, Subcontractor, Prospect, TrashableType, StoreState, Supplier, LeaveRequest, LeaveRequestStatus, EmployeePayment, BalanceEntry } from '../../types';
import { EmployeeFormData } from '../../components/EmployeeForm';
import { initialClients, initialSuppliers } from '../../data/initialData';
import { useFinanceStore } from './useFinanceStore';

export interface PeopleState {
    employees: Employee[];
    clients: Client[];
    subcontractors: Subcontractor[];
    suppliers: Supplier[];
    leaveRequests: LeaveRequest[];
    deletedEmployees: Employee[];
    deletedClients: Client[];
    deletedSubcontractors: Subcontractor[];
    deletedSuppliers: Supplier[];
}

interface PeopleActions {
    setEmployees: (employees: Employee[]) => void;
    setClients: (clients: Client[]) => void;
    setSubcontractors: (subcontractors: Subcontractor[]) => void;
    setSuppliers: (suppliers: Supplier[]) => void;
    saveEmployee: (data: Partial<EmployeeFormData>, id?: string) => void;
    deleteEmployee: (ids: string[]) => void;
    toggleEmployeeStatus: (id: string) => void;
    bulkToggleEmployeeStatus: (ids: string[], isActive: boolean) => void;
    bulkUpdateEmployees: (ids: string[], updates: { job?: string; hourlyRate?: number }) => void;
    saveClient: (data: any, id?: string) => void;
    deleteClient: (ids: string[]) => void;
    toggleClientStatus: (id: string) => void;
    bulkToggleClientStatus: (ids: string[], isActive: boolean) => void;
    saveSubcontractor: (data: any, id?: string) => void;
    deleteSubcontractor: (ids: string[]) => void;
    saveSupplier: (data: any, id?: string) => void;
    deleteSupplier: (ids: string[]) => void;
    convertProspectToClient: (prospect: Prospect) => void;
    addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => void;
    updateLeaveRequestStatus: (id: string, status: LeaveRequestStatus) => void;
    processPayrollPayments: (payments: EmployeePayment[]) => void;
    makeBalancePayment: (paymentData: { employeeId: string, amount: number, date: string, notes: string, jobsiteId: string }) => void;
    restoreItem: (ids: string[], type: TrashableType) => void;
    permanentlyDeleteItem: (ids: string[], type: TrashableType) => void;
}

export const initialState: PeopleState = {
    employees: [],
    clients: [],
    subcontractors: [],
    suppliers: [],
    leaveRequests: [],
    deletedEmployees: [],
    deletedClients: [],
    deletedSubcontractors: [],
    deletedSuppliers: [],
};

export const usePeopleStore = create<PeopleState & PeopleActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setEmployees: (employees) => set({ employees }),
            setClients: (clients) => set({ clients }),
            setSubcontractors: (subcontractors) => set({ subcontractors }),
            setSuppliers: (suppliers) => set({ suppliers }),
            saveEmployee: (data, id) => set(state => {
                if (id) {
                    return {
                        employees: state.employees.map(e => {
                            if (e.id === id) {
                                const { hourlyRate, overtimeRate, ...restOfData } = data;
                                const updatedEmployee: Employee = { ...e, ...restOfData };
            
                                if (hourlyRate !== undefined) {
                                    const newHourlyRate = parseFloat(hourlyRate);
                                    if (!isNaN(newHourlyRate)) {
                                        updatedEmployee.hourlyRate = newHourlyRate;
                                        if (overtimeRate === undefined) {
                                            updatedEmployee.overtimeRate = newHourlyRate * 1.5;
                                        }
                                    }
                                }
            
                                if (overtimeRate !== undefined) {
                                    const newOvertimeRate = parseFloat(overtimeRate);
                                    if (!isNaN(newOvertimeRate)) {
                                        updatedEmployee.overtimeRate = newOvertimeRate;
                                    }
                                }
            
                                return updatedEmployee;
                            }
                            return e;
                        })
                    };
                }
                
                const { hourlyRate, overtimeRate, ...restData } = data as EmployeeFormData;
                const newEmployee: Employee = {
                    ...restData,
                    id: uuidv4(),
                    hourlyRate: parseFloat(hourlyRate),
                    overtimeRate: parseFloat(overtimeRate),
                    balanceHistory: [],
                    createdAt: new Date().toISOString(),
                };
                return { employees: [...state.employees, newEmployee] };
            }),
            deleteEmployee: (ids) => set(state => {
                const toDelete = state.employees.filter(e => ids.includes(e.id)).map(e => ({ ...e, deletedAt: new Date().toISOString() }));
                return {
                    employees: state.employees.filter(e => !ids.includes(e.id)),
                    deletedEmployees: [...state.deletedEmployees, ...toDelete]
                };
            }),
            toggleEmployeeStatus: (id) => set(state => ({
                employees: state.employees.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e)
            })),
            bulkToggleEmployeeStatus: (ids, isActive) => set(state => ({
                employees: state.employees.map(e => ids.includes(e.id) ? { ...e, isActive } : e)
            })),
            bulkUpdateEmployees: (ids, updates) => set(state => ({
                employees: state.employees.map(e => {
                    if (ids.includes(e.id)) {
                        const newUpdates: Partial<Employee> = {};
                        if (updates.job) newUpdates.job = updates.job;
                        if (updates.hourlyRate) {
                            newUpdates.hourlyRate = updates.hourlyRate;
                            newUpdates.overtimeRate = updates.hourlyRate * 1.5;
                        }
                        return { ...e, ...newUpdates };
                    }
                    return e;
                })
            })),
            saveClient: (data, id) => set(state => {
                const { clients } = state;
                if (id) {
                    return { clients: clients.map(c => c.id === id ? { ...c, ...data } : c) };
                }
                const newClient: Client = { ...data, id: `client-${Date.now()}`, createdAt: new Date().toISOString() };
                return { clients: [...clients, newClient] };
            }),
            deleteClient: (ids) => set(state => {
                const toDelete = state.clients.filter(c => ids.includes(c.id)).map(c => ({ ...c, deletedAt: new Date().toISOString() }));
                return {
                    clients: state.clients.filter(c => !ids.includes(c.id)),
                    deletedClients: [...state.deletedClients, ...toDelete]
                };
            }),
            toggleClientStatus: (id) => set(state => ({
                clients: state.clients.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
            })),
            bulkToggleClientStatus: (ids, isActive) => set(state => ({
                clients: state.clients.map(c => ids.includes(c.id) ? { ...c, isActive } : c)
            })),
            saveSubcontractor: (data, id) => set(state => {
                const { subcontractors } = state;
                if (id) {
                    return { subcontractors: subcontractors.map(sub => sub.id === id ? { ...sub, ...data } : sub) };
                }
                const newSub: Subcontractor = { ...data, id: `sub-${Date.now()}` };
                return { subcontractors: [...subcontractors, newSub] };
            }),
            deleteSubcontractor: (ids) => set(state => {
                const toDelete = state.subcontractors.filter(sub => ids.includes(sub.id)).map(sub => ({ ...sub, deletedAt: new Date().toISOString() }));
                return {
                    subcontractors: state.subcontractors.filter(sub => !ids.includes(sub.id)),
                    deletedSubcontractors: [...state.deletedSubcontractors, ...toDelete]
                };
            }),
            saveSupplier: (data, id) => set(state => {
                const { suppliers } = state;
                if (id) {
                    return { suppliers: suppliers.map(sup => sup.id === id ? { ...sup, ...data } : sup) };
                }
                const newSupplier: Supplier = { ...data, id: `supplier-${Date.now()}`, createdAt: new Date().toISOString() };
                return { suppliers: [...suppliers, newSupplier] };
            }),
            deleteSupplier: (ids) => set(state => {
                const toDelete = state.suppliers.filter(sup => ids.includes(sup.id)).map(sup => ({ ...sup, deletedAt: new Date().toISOString() }));
                return {
                    suppliers: state.suppliers.filter(sup => !ids.includes(sup.id)),
                    deletedSuppliers: [...state.deletedSuppliers, ...toDelete]
                };
            }),
            convertProspectToClient: (prospect) => set(state => {
                const newClient: Client = {
                    id: `client-from-${prospect.id}`,
                    type: 'company', // Assumption
                    name: prospect.name,
                    contactPerson: prospect.contactPerson || '',
                    phone1: prospect.phone || '',
                    phone2: '',
                    email: prospect.email || '',
                    address: '',
                    isActive: true,
                    rating: { ppeProvision: 3, toolProvision: 3, picky: 3, payment: 3, communication: 3, problemSolving: 3 },
                    createdAt: new Date().toISOString()
                };
                return { clients: [...state.clients, newClient] };
            }),
            addLeaveRequest: (request) => set(state => {
                const newRequest: LeaveRequest = {
                    ...request,
                    id: `leave-${Date.now()}`,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                };
                return { leaveRequests: [...state.leaveRequests, newRequest] };
            }),
            updateLeaveRequestStatus: (id, status) => set(state => ({
                leaveRequests: state.leaveRequests.map(req => req.id === id ? { ...req, status } : req)
            })),
            processPayrollPayments: (payments) => set(state => {
                const updatedEmployees = state.employees.map(emp => {
                    const payment = payments.find(p => p.employeeId === emp.id);
                    if (payment) {
                        const newHistory = [...emp.balanceHistory];
                        const balanceChange = payment.calculatedNetPay - payment.paidAmount;

                        if (payment.balancePaid > 0) {
                             newHistory.push({
                                id: `bal-credit-payroll-${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                type: 'credit',
                                amount: payment.balancePaid,
                                description: 'Payment of outstanding balance from payroll',
                            });
                        }
                        
                        if (balanceChange > 0) { // Underpayment -> Company owes employee more
                            newHistory.push({
                                id: `bal-debit-underpay-${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                type: 'debit',
                                amount: balanceChange,
                                description: 'Payroll underpayment',
                            });
                        } else if (balanceChange < 0) { // Overpayment -> Employee's debt is reduced
                            newHistory.push({
                                id: `bal-credit-overpay-${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                type: 'credit',
                                amount: Math.abs(balanceChange),
                                description: 'Payment towards balance from payroll (overpayment)',
                            });
                        }
                        
                        const pendingDeduction = payment.deductions.find(d => d.description === 'Saldo Pendiente (No Pagado)');
                        if (pendingDeduction) {
                            newHistory.push({
                                id: `bal-debit-manual-${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                type: 'debit',
                                amount: pendingDeduction.amount,
                                description: 'Manual pending balance from payroll',
                            });
                        }
                        return { ...emp, balanceHistory: newHistory };
                    }
                    return emp;
                });
                return { employees: updatedEmployees };
            }),
            makeBalancePayment: ({ employeeId, amount, date, notes, jobsiteId }) => {
                const { employees } = get();
                const employee = employees.find(e => e.id === employeeId);
                if (!employee) return;
            
                useFinanceStore.getState().createExpenseForBalancePayment({
                    employeeId,
                    employeeName: employee.name,
                    amount,
                    date,
                    jobsiteId,
                    notes,
                });
                
                set(state => ({
                    employees: state.employees.map(emp => {
                        if (emp.id === employeeId) {
                            const newCreditEntry: BalanceEntry = {
                                id: `bal-${Date.now()}`,
                                date,
                                type: 'credit',
                                amount,
                                description: `Special Payment: ${notes}`,
                                jobsiteId,
                            };
                            return { ...emp, balanceHistory: [...emp.balanceHistory, newCreditEntry] };
                        }
                        return emp;
                    })
                }));
            },
            restoreItem: (ids, type) => set(state => {
                switch (type) {
                    case 'employees': return { employees: [...state.employees, ...state.deletedEmployees.filter(i => ids.includes(i.id))], deletedEmployees: state.deletedEmployees.filter(i => !ids.includes(i.id)) };
                    case 'clients': return { clients: [...state.clients, ...state.deletedClients.filter(i => ids.includes(i.id))], deletedClients: state.deletedClients.filter(i => !ids.includes(i.id)) };
                    case 'subcontractors': return { subcontractors: [...state.subcontractors, ...state.deletedSubcontractors.filter(i => ids.includes(i.id))], deletedSubcontractors: state.deletedSubcontractors.filter(i => !ids.includes(i.id)) };
                    case 'suppliers': return { suppliers: [...state.suppliers, ...state.deletedSuppliers.filter(i => ids.includes(i.id))], deletedSuppliers: state.deletedSuppliers.filter(i => !ids.includes(i.id)) };
                    default: return {};
                }
            }),
            permanentlyDeleteItem: (ids, type) => set(state => {
                switch (type) {
                    case 'employees': return { deletedEmployees: state.deletedEmployees.filter(i => !ids.includes(i.id)) };
                    case 'clients': return { deletedClients: state.deletedClients.filter(i => !ids.includes(i.id)) };
                    case 'subcontractors': return { deletedSubcontractors: state.deletedSubcontractors.filter(i => !ids.includes(i.id)) };
                    case 'suppliers': return { deletedSuppliers: state.deletedSuppliers.filter(i => !ids.includes(i.id)) };
                    default: return {};
                }
            }),
        }),
        { 
            name: 'people-storage',
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error("Could not rehydrate people store", error);
                    return;
                }
                if (state) {
                    const bockCoExists = state.clients.some(c => c.id === 'client-4');
                    if (!bockCoExists) {
                        const bockCoClient = initialClients.find(c => c.id === 'client-4');
                        if (bockCoClient) {
                            state.clients.push(bockCoClient);
                        }
                    }
                }
            }
        }
    )
);