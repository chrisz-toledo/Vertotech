
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Jobsite, TimeLog, ExtraWorkTicket, Tool, Material, Contract, ProductionLog, Bid, PunchList, Vehicle, LegalDocument, SafetyReport, AttendanceRecord, ScheduleEntry, MaintenanceLog, StoreState, TrashableType, ToolAssignmentLog, ToolAssignment, ToolStatus, Comment, DailyLog } from '../../types';
import { getDistance } from '../../utils/geolocation';
import { useAppStore } from './useAppStore';

export interface OperationsState {
    jobsites: Jobsite[];
    timeLogs: TimeLog[];
    extraWorkTickets: ExtraWorkTicket[];
    tools: Tool[];
    materials: Material[];
    contracts: Contract[];
    productionLogs: ProductionLog[];
    bids: Bid[];
    punchLists: PunchList[];
    vehicles: Vehicle[];
    legalDocuments: LegalDocument[];
    safetyReports: SafetyReport[];
    attendanceRecords: AttendanceRecord[];
    schedule: ScheduleEntry[];
    maintenanceLogs: MaintenanceLog[];
    toolAssignmentLogs: ToolAssignmentLog[];
    dailyLogs: DailyLog[];
    
    // Deleted items
    deletedJobsites: Jobsite[];
    deletedTimeLogs: TimeLog[];
    deletedExtraWorkTickets: ExtraWorkTicket[];
    deletedTools: Tool[];
    deletedMaterials: Material[];
    deletedContracts: Contract[];
    deletedProductionLogs: ProductionLog[];
    deletedBids: Bid[];
    deletedPunchLists: PunchList[];
    deletedVehicles: Vehicle[];
    deletedLegalDocuments: LegalDocument[];
    deletedDailyLogs: DailyLog[];
}

interface OperationsActions {
    setJobsites: (jobsites: Jobsite[]) => void;
    setExtraWorkTickets: (tickets: ExtraWorkTicket[]) => void;
    setLegalDocuments: (docs: LegalDocument[]) => void;
    setSchedule: (schedule: ScheduleEntry[]) => void;
    
    saveJobsite: (data: any, id?: string) => void;
    deleteJobsite: (ids: string[]) => void;

    saveTimeLog: (data: any, id?: string) => void;
    deleteTimeLog: (ids: string[]) => void;
    
    registerAttendance: (employeeId: string, jobsiteId: string) => {success: boolean, messageKey: string, messageParams?: any};
    
    saveExtraWorkTicket: (data: any, id?: string) => void;
    deleteExtraWorkTicket: (ids: string[]) => void;
    saveCommentOnTicket: (ticketId: string, content: string) => void;

    saveTool: (data: any, id?: string) => void;
    deleteTool: (ids: string[]) => void;
    checkInTool: (toolId: string) => void;
    checkOutTool: (toolId: string, assignment: ToolAssignment) => void;
    
    saveMaterial: (data: any, id?: string) => void;
    deleteMaterial: (ids: string[]) => void;

    saveContract: (data: any, id?: string) => void;
    deleteContract: (ids: string[]) => void;
    
    saveProductionLog: (data: any, id?: string) => void;
    deleteProductionLog: (ids: string[]) => void;

    saveBid: (data: any, id?: string) => void;
    deleteBid: (ids: string[]) => void;
    
    savePunchList: (data: any, id?: string) => void;
    deletePunchList: (ids: string[]) => void;

    saveVehicle: (data: any, id?: string) => void;
    deleteVehicle: (ids: string[]) => void;
    
    saveLegalDocument: (data: any, id?: string) => void;
    deleteLegalDocument: (ids: string[]) => void;
    
    addSafetyReport: (report: SafetyReport) => void;
    deleteSafetyReport: (id: string) => void;
    
    saveScheduleEntry: (data: any, id?: string) => void;

    saveDailyLog: (data: any, id?: string) => void;
    deleteDailyLog: (ids: string[]) => void;

    restoreItem: (ids: string[], type: TrashableType) => void;
    permanentlyDeleteItem: (ids: string[], type: TrashableType) => void;
}

export const initialState: OperationsState = {
    jobsites: [], timeLogs: [], extraWorkTickets: [], tools: [], materials: [], contracts: [],
    productionLogs: [], bids: [], punchLists: [], vehicles: [], legalDocuments: [],
    safetyReports: [], attendanceRecords: [], schedule: [], maintenanceLogs: [], toolAssignmentLogs: [],
    dailyLogs: [],
    deletedJobsites: [], deletedTimeLogs: [], deletedExtraWorkTickets: [], deletedTools: [],
    deletedMaterials: [], deletedContracts: [], deletedProductionLogs: [], deletedBids: [],
    deletedPunchLists: [], deletedVehicles: [], deletedLegalDocuments: [], deletedDailyLogs: [],
};

export const useOperationsStore = create<OperationsState & OperationsActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setJobsites: (jobsites) => set({ jobsites }),
            setExtraWorkTickets: (tickets) => set({ extraWorkTickets: tickets }),
            setLegalDocuments: (docs) => set({ legalDocuments: docs }),
            setSchedule: (schedule) => set({ schedule }),

            saveJobsite: (data, id) => set(state => {
                const { street, unit, city, state: st, zipCode, country } = data;
                const formattedAddress = [street, unit, city, st, zipCode, country].filter(Boolean).join(', ');
                const jobsiteData = { ...data, address: formattedAddress };
                
                if (id) {
                    return { jobsites: state.jobsites.map(j => j.id === id ? { ...j, ...jobsiteData } : j) };
                }
                const newJobsite: Jobsite = { ...jobsiteData, id: `jobsite-${Date.now()}` };
                return { jobsites: [...state.jobsites, newJobsite] };
            }),
            deleteJobsite: (ids) => set(state => {
                const toDelete = state.jobsites.filter(j => ids.includes(j.id)).map(j => ({ ...j, deletedAt: new Date().toISOString() }));
                return {
                    jobsites: state.jobsites.filter(j => !ids.includes(j.id)),
                    deletedJobsites: [...state.deletedJobsites, ...toDelete]
                };
            }),
            saveTimeLog: (data, id) => set(state => {
                if (id) {
                    return { timeLogs: state.timeLogs.map(t => t.id === id ? { ...t, ...data } : t) };
                }
                const newTimeLog: TimeLog = { ...data, id: `tl-${Date.now()}` };
                return { timeLogs: [...state.timeLogs, newTimeLog] };
            }),
            deleteTimeLog: (ids) => set(state => {
                const toDelete = state.timeLogs.filter(t => ids.includes(t.id)).map(t => ({...t, deletedAt: new Date().toISOString()}));
                return { timeLogs: state.timeLogs.filter(t => !ids.includes(t.id)), deletedTimeLogs: [...state.deletedTimeLogs, ...toDelete] };
            }),
            registerAttendance: (employeeId, jobsiteId) => {
                let result = { success: false, messageKey: 'checkinSuccess' as string, messageParams: {} as any };
                set(state => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const existingRecord = state.attendanceRecords.find(r => r.employeeId === employeeId && r.date === todayStr);

                    if (existingRecord) {
                        if (!existingRecord.checkOutTime) {
                            const updatedRecords = state.attendanceRecords.map(r => r.id === existingRecord.id ? { ...r, checkOutTime: new Date().toISOString() } : r);
                            result = { success: true, messageKey: 'checkoutSuccess', messageParams: {} };
                            return { attendanceRecords: updatedRecords };
                        }
                        return {};
                    } else {
                        const jobsite = state.jobsites.find(j => j.id === jobsiteId);
                        const now = new Date();
                        if (jobsite?.isWorkTimeEnforced && jobsite.workStartTime) {
                           const [startHour, startMinute] = jobsite.workStartTime.split(':').map(Number);
                           const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
                           if (now < startTime) {
                               result = { success: true, messageKey: 'checkinEarlySuccess', messageParams: {time: now.toLocaleTimeString(), startTime: jobsite.workStartTime} };
                           }
                        }
                        const newRecord: AttendanceRecord = {
                            id: `att-${Date.now()}`,
                            employeeId,
                            jobsiteId,
                            clientId: jobsite?.clientId || '',
                            date: todayStr,
                            checkInTime: now.toISOString(),
                        };
                        return { attendanceRecords: [...state.attendanceRecords, newRecord] };
                    }
                });
                return result;
            },
            saveExtraWorkTicket: (data, id) => set(state => {
                if (id) {
                    return { extraWorkTickets: state.extraWorkTickets.map(t => t.id === id ? { ...t, ...data } : t) };
                }
                const newTicketNumber = (Math.max(0, ...state.extraWorkTickets.map(t => parseInt(t.ticketNumber, 10))) + 1).toString().padStart(4, '0');
                const newTicket: ExtraWorkTicket = { ...data, id: `ewt-${Date.now()}`, ticketNumber: newTicketNumber, createdAt: new Date().toISOString() };
                return { extraWorkTickets: [...state.extraWorkTickets, newTicket] };
            }),
            deleteExtraWorkTicket: (ids) => set(state => {
                const toDelete = state.extraWorkTickets.filter(t => ids.includes(t.id)).map(t => ({...t, deletedAt: new Date().toISOString()}));
                return { extraWorkTickets: state.extraWorkTickets.filter(t => !ids.includes(t.id)), deletedExtraWorkTickets: [...state.deletedExtraWorkTickets, ...toDelete] };
            }),
            saveCommentOnTicket: (ticketId, content) => set(state => {
                const { currentUser } = useAppStore.getState();
                const newComment: Comment = {
                    id: `comment-${Date.now()}`,
                    author: currentUser?.name || 'System',
                    content,
                    createdAt: new Date().toISOString(),
                };
                return {
                    extraWorkTickets: state.extraWorkTickets.map(t =>
                        t.id === ticketId ? { ...t, comments: [...(t.comments || []), newComment] } : t
                    )
                };
            }),
            saveTool: (data, id) => set(state => {
                if (id) {
                    return { tools: state.tools.map(t => t.id === id ? { ...t, ...data } : t) };
                }
                const newTool: Tool = { ...data, id: `tool-${Date.now()}` };
                return { tools: [...state.tools, newTool] };
            }),
            deleteTool: (ids) => set(state => {
                 const toDelete = state.tools.filter(t => ids.includes(t.id)).map(t => ({ ...t, deletedAt: new Date().toISOString() }));
                 return { tools: state.tools.filter(t => !ids.includes(t.id)), deletedTools: [...state.deletedTools, ...toDelete] };
            }),
            checkInTool: (toolId) => set(state => ({
                tools: state.tools.map(t => t.id === toolId ? { ...t, status: 'available' as ToolStatus, assignment: { type: 'warehouse', warehouseName: 'Main Warehouse', assignedAt: new Date().toISOString() } } : t)
            })),
            checkOutTool: (toolId, assignment) => set(state => ({
                tools: state.tools.map(t => t.id === toolId ? { ...t, status: 'in_use' as ToolStatus, assignment } : t)
            })),
            saveMaterial: (data, id) => set(state => {
                if (id) {
                    return { materials: state.materials.map(m => m.id === id ? { ...m, ...data } : m) };
                }
                const newMaterial: Material = { ...data, id: `mat-${Date.now()}` };
                return { materials: [...state.materials, newMaterial] };
            }),
            deleteMaterial: (ids) => set(state => {
                const toDelete = state.materials.filter(m => ids.includes(m.id)).map(m => ({ ...m, deletedAt: new Date().toISOString() }));
                return { materials: state.materials.filter(m => !ids.includes(m.id)), deletedMaterials: [...state.deletedMaterials, ...toDelete] };
            }),
            saveContract: (data, id) => set(state => {
                if (id) {
                    return { contracts: state.contracts.map(c => c.id === id ? { ...c, ...data } : c) };
                }
                const newContract: Contract = { ...data, id: `contract-${Date.now()}`, createdAt: new Date().toISOString() };
                return { contracts: [...state.contracts, newContract] };
            }),
            deleteContract: (ids) => set(state => {
                const toDelete = state.contracts.filter(c => ids.includes(c.id)).map(c => ({...c, deletedAt: new Date().toISOString()}));
                return { contracts: state.contracts.filter(c => !ids.includes(c.id)), deletedContracts: [...state.deletedContracts, ...toDelete] };
            }),
            saveProductionLog: (data, id) => set(state => {
                if (id) {
                    return { productionLogs: state.productionLogs.map(p => p.id === id ? { ...p, ...data } : p) };
                }
                const newLog: ProductionLog = { ...data, id: `plog-${Date.now()}`, createdAt: new Date().toISOString() };
                return { productionLogs: [...state.productionLogs, newLog] };
            }),
            deleteProductionLog: (ids) => set(state => {
                const toDelete = state.productionLogs.filter(p => ids.includes(p.id)).map(p => ({...p, deletedAt: new Date().toISOString()}));
                return { productionLogs: state.productionLogs.filter(p => !ids.includes(p.id)), deletedProductionLogs: [...state.deletedProductionLogs, ...toDelete] };
            }),
            saveBid: (data, id) => set(state => {
                const { bids } = state;
                if (id) {
                    return { bids: bids.map(b => b.id === id ? { ...b, ...data } : b) };
                }
                const newBidNumber = (Math.max(0, ...bids.map(b => parseInt(b.bidNumber, 10))) + 1).toString().padStart(5, '0');
                const newBid: Bid = { ...data, id: `bid-${Date.now()}`, bidNumber: newBidNumber, createdAt: new Date().toISOString() };
                return { bids: [...bids, newBid] };
            }),
            deleteBid: (ids) => set(state => {
                const toDelete = state.bids.filter(b => ids.includes(b.id)).map(b => ({ ...b, deletedAt: new Date().toISOString() }));
                return { bids: state.bids.filter(b => !ids.includes(b.id)), deletedBids: [...state.deletedBids, ...toDelete] };
            }),
            savePunchList: (data, id) => set(state => {
                if (id && state.punchLists.some(p => p.id === id)) {
                    return { punchLists: state.punchLists.map(p => p.id === id ? { ...p, ...data } : p) };
                }
                const newList: PunchList = { ...data, id: id || `pl-${Date.now()}`, createdAt: new Date().toISOString() };
                return { punchLists: [...state.punchLists, newList] };
            }),
            deletePunchList: (ids) => set(state => {
                const toDelete = state.punchLists.filter(p => ids.includes(p.id)).map(p => ({...p, deletedAt: new Date().toISOString()}));
                return { punchLists: state.punchLists.filter(p => !ids.includes(p.id)), deletedPunchLists: [...state.deletedPunchLists, ...toDelete] };
            }),
            saveVehicle: (data, id) => set(state => {
                if (id) {
                    return { vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...data } : v) };
                }
                const newVehicle: Vehicle = { ...data, id: `veh-${Date.now()}` };
                return { vehicles: [...state.vehicles, newVehicle] };
            }),
            deleteVehicle: (ids) => set(state => {
                const toDelete = state.vehicles.filter(v => ids.includes(v.id)).map(v => ({...v, deletedAt: new Date().toISOString()}));
                return { vehicles: state.vehicles.filter(v => !ids.includes(v.id)), deletedVehicles: [...state.deletedVehicles, ...toDelete] };
            }),
            saveLegalDocument: (data, id) => set(state => {
                if (id) {
                    return { legalDocuments: state.legalDocuments.map(d => d.id === id ? { ...d, ...data } : d) };
                }
                const newDoc: LegalDocument = { ...data, id: `legal-${Date.now()}`, createdAt: new Date().toISOString() };
                return { legalDocuments: [...state.legalDocuments, newDoc] };
            }),
            deleteLegalDocument: (ids) => set(state => {
                const toDelete = state.legalDocuments.filter(d => ids.includes(d.id)).map(d => ({...d, deletedAt: new Date().toISOString()}));
                return { legalDocuments: state.legalDocuments.filter(d => !ids.includes(d.id)), deletedLegalDocuments: [...state.deletedLegalDocuments, ...toDelete] };
            }),
            addSafetyReport: (report) => set(state => ({
                safetyReports: [...state.safetyReports, report]
            })),
            deleteSafetyReport: (id) => set(state => ({
                safetyReports: state.safetyReports.filter(r => r.id !== id)
            })),
            saveScheduleEntry: (data, id) => set(state => {
                if (id) {
                    return { schedule: state.schedule.map(s => s.id === id ? { ...s, ...data } : s) };
                }
                const newEntry: ScheduleEntry = { ...data, id: `sched-${Date.now()}` };
                return { schedule: [...state.schedule, newEntry] };
            }),
            saveDailyLog: (data, id) => set(state => {
                if (id && state.dailyLogs.some(l => l.id === id)) {
                    return { dailyLogs: state.dailyLogs.map(l => l.id === id ? { ...l, ...data } : l) };
                }
                const newLog: DailyLog = { ...data, id: id || `${data.date}-${data.jobsiteId}`, createdAt: new Date().toISOString() };
                return { dailyLogs: [...state.dailyLogs.filter(l => l.id !== newLog.id), newLog] };
            }),
            deleteDailyLog: (ids) => set(state => {
                const toDelete = state.dailyLogs.filter(l => ids.includes(l.id)).map(l => ({ ...l, deletedAt: new Date().toISOString() }));
                return { dailyLogs: state.dailyLogs.filter(l => !ids.includes(l.id)), deletedDailyLogs: [...state.deletedDailyLogs, ...toDelete] };
            }),
            restoreItem: (ids, type) => set(state => {
                switch (type) {
                    case 'jobsites': return { jobsites: [...state.jobsites, ...state.deletedJobsites.filter(i => ids.includes(i.id))], deletedJobsites: state.deletedJobsites.filter(i => !ids.includes(i.id)) };
                    case 'timeLogs': return { timeLogs: [...state.timeLogs, ...state.deletedTimeLogs.filter(i => ids.includes(i.id))], deletedTimeLogs: state.deletedTimeLogs.filter(i => !ids.includes(i.id)) };
                    case 'extraWorkTickets': return { extraWorkTickets: [...state.extraWorkTickets, ...state.deletedExtraWorkTickets.filter(i => ids.includes(i.id))], deletedExtraWorkTickets: state.deletedExtraWorkTickets.filter(i => !ids.includes(i.id)) };
                    case 'tools': return { tools: [...state.tools, ...state.deletedTools.filter(i => ids.includes(i.id))], deletedTools: state.deletedTools.filter(i => !ids.includes(i.id)) };
                    case 'materials': return { materials: [...state.materials, ...state.deletedMaterials.filter(i => ids.includes(i.id))], deletedMaterials: state.deletedMaterials.filter(i => !ids.includes(i.id)) };
                    case 'contracts': return { contracts: [...state.contracts, ...state.deletedContracts.filter(i => ids.includes(i.id))], deletedContracts: state.deletedContracts.filter(i => !ids.includes(i.id)) };
                    case 'productionLogs': return { productionLogs: [...state.productionLogs, ...state.deletedProductionLogs.filter(i => ids.includes(i.id))], deletedProductionLogs: state.deletedProductionLogs.filter(i => !ids.includes(i.id)) };
                    case 'bids': return { bids: [...state.bids, ...state.deletedBids.filter(i => ids.includes(i.id))], deletedBids: state.deletedBids.filter(i => !ids.includes(i.id)) };
                    case 'punchLists': return { punchLists: [...state.punchLists, ...state.deletedPunchLists.filter(i => ids.includes(i.id))], deletedPunchLists: state.deletedPunchLists.filter(i => !ids.includes(i.id)) };
                    case 'vehicles': return { vehicles: [...state.vehicles, ...state.deletedVehicles.filter(i => ids.includes(i.id))], deletedVehicles: state.deletedVehicles.filter(i => !ids.includes(i.id)) };
                    case 'legalDocuments': return { legalDocuments: [...state.legalDocuments, ...state.deletedLegalDocuments.filter(i => ids.includes(i.id))], deletedLegalDocuments: state.deletedLegalDocuments.filter(i => !ids.includes(i.id)) };
                    case 'dailyLogs': return { dailyLogs: [...state.dailyLogs, ...state.deletedDailyLogs.filter(i => ids.includes(i.id))], deletedDailyLogs: state.deletedDailyLogs.filter(i => !ids.includes(i.id)) };
                    default: return {};
                }
            }),
            permanentlyDeleteItem: (ids, type) => set(state => {
                switch (type) {
                    case 'jobsites': return { deletedJobsites: state.deletedJobsites.filter(i => !ids.includes(i.id)) };
                    case 'timeLogs': return { deletedTimeLogs: state.deletedTimeLogs.filter(i => !ids.includes(i.id)) };
                    case 'extraWorkTickets': return { deletedExtraWorkTickets: state.deletedExtraWorkTickets.filter(i => !ids.includes(i.id)) };
                    case 'tools': return { deletedTools: state.deletedTools.filter(i => !ids.includes(i.id)) };
                    case 'materials': return { deletedMaterials: state.deletedMaterials.filter(i => !ids.includes(i.id)) };
                    case 'contracts': return { deletedContracts: state.deletedContracts.filter(i => !ids.includes(i.id)) };
                    case 'productionLogs': return { deletedProductionLogs: state.deletedProductionLogs.filter(i => !ids.includes(i.id)) };
                    case 'bids': return { deletedBids: state.deletedBids.filter(i => !ids.includes(i.id)) };
                    case 'punchLists': return { deletedPunchLists: state.deletedPunchLists.filter(i => !ids.includes(i.id)) };
                    case 'vehicles': return { deletedVehicles: state.deletedVehicles.filter(i => !ids.includes(i.id)) };
                    case 'legalDocuments': return { deletedLegalDocuments: state.deletedLegalDocuments.filter(i => !ids.includes(i.id)) };
                    case 'dailyLogs': return { deletedDailyLogs: state.deletedDailyLogs.filter(i => !ids.includes(i.id)) };
                    default: return {};
                }
            }),
        }),
        {
            name: 'operations-storage',
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error("Could not rehydrate operations store", error);
                }
            }
        }
    )
);