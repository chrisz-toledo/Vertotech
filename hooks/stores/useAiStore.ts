import { create } from 'zustand';
import * as geminiService from '../../services/geminiService';
import type { Employee, ChatMessage, ChatMessagePart, GlobalSearchResult, StoreState } from '../../types';
import { usePeopleStore } from './usePeopleStore';
import { useOperationsStore } from './useOperationsStore';
import { useFinanceStore } from './useFinanceStore';
import { useCrmStore } from './useCrmStore';

interface AiContent {
    isLoading: boolean;
    title: string;
    content: string;
}

export interface AiState {
    chatHistory: ChatMessage[];
    aiContent: AiContent;
    isOpinionsLoading: boolean;
    opinions: string[];
    isGlobalSearchLoading: boolean;
    globalSearchQuery: string;
    globalSearchResults: GlobalSearchResult | null;
}

interface AiActions {
    sendMessage: (parts: ChatMessagePart[]) => Promise<void>;
    getPerformanceSummary: (employee: Employee) => Promise<void>;
    getEmployeeRiskAnalysis: (employee: Employee) => Promise<void>;
    getOpinions: () => Promise<void>;
    getSafetyImageAnalysis: (image: { mimeType: string, data: string }, objectUrl: string, name: string) => Promise<void>;
    getReceiptAnalysis: (image: { mimeType: string, data: string }) => Promise<string>;
    performGlobalSearch: (query: string) => Promise<void>;
    getAssignmentRecommendations: (requirements: string) => Promise<any[]>;
    getClientProgressSummary: (jobsiteId: string) => Promise<void>;
    getVehicleMaintenancePrediction: (vehicleId: string) => Promise<void>;
    getContractScopeSuggestion: (contractTitle: string, clientName: string) => Promise<string>;
    getForemanPerformanceAnalysis: (foreman: Employee, kpis: any) => Promise<void>;
}

const initialState: AiState = {
    chatHistory: [{ id: '1', role: 'model', parts: [{ type: 'text', content: 'Hola, soy Rachy. ¿Cómo puedo ayudarte a gestionar tu proyecto de construcción hoy?' }] }],
    aiContent: { isLoading: false, title: '', content: '' },
    isOpinionsLoading: false,
    opinions: [],
    isGlobalSearchLoading: false,
    globalSearchQuery: '',
    globalSearchResults: null,
};

export const useAiStore = create<AiState & AiActions>()(
    (set, get) => ({
        ...initialState,
        sendMessage: async (parts) => {
            const newUserMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', parts };
            const loadingMessage: ChatMessage = { id: `msg-${Date.now()}-loading`, role: 'model', parts: [{ type: 'text', content: '' }], isLoading: true };
            set(state => ({ chatHistory: [...state.chatHistory, newUserMessage, loadingMessage] }));
            
            // This is a placeholder for a real API call
            setTimeout(() => {
                const responseContent = "Esta es una respuesta simulada de la IA.";
                const responseMessage: ChatMessage = { id: loadingMessage.id, role: 'model', parts: [{ type: 'text', content: responseContent }] };
                set(state => ({ chatHistory: state.chatHistory.map(m => m.id === loadingMessage.id ? responseMessage : m) }));
            }, 1500);
        },
        getPerformanceSummary: async (employee) => {
            set({ aiContent: { isLoading: true, title: `Resumen de Desempeño: ${employee.name}`, content: '' } });
            const summary = await geminiService.generatePerformanceSummary(employee);
            set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: summary } }));
        },
        getEmployeeRiskAnalysis: async (employee) => {
            set({ aiContent: { isLoading: true, title: `Análisis de Riesgos: ${employee.name}`, content: '' } });
            const analysis = await geminiService.analyzeEmployeeRisks(employee);
            set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: analysis } }));
        },
        getOpinions: async () => {
            set({ isOpinionsLoading: true, opinions: [] });
            const { employees, clients } = usePeopleStore.getState();
            const { jobsites, timeLogs } = useOperationsStore.getState();
            const opinionsText = await geminiService.getRachyOpinions(employees, clients, jobsites, timeLogs);
            const opinionsArray = opinionsText.split('* ').filter(op => op.trim() !== '');
            set({ isOpinionsLoading: false, opinions: opinionsArray });
        },
        // FIX: Updated function signature and implementation to handle objectUrl and name for the SafetyReport type.
        getSafetyImageAnalysis: async (image, objectUrl, name) => {
            const { addSafetyReport } = useOperationsStore.getState();
            const analysis = await geminiService.analyzeSafetyImage(image);
            const newReport = { 
                id: `safety-${Date.now()}`, 
                image: { mimeType: image.mimeType, objectUrl, name }, 
                analysis, 
                createdAt: new Date().toISOString() 
            };
            addSafetyReport(newReport);
        },
        getReceiptAnalysis: async (image) => {
            return await geminiService.analyzeReceipt(image);
        },
        performGlobalSearch: async (query) => {
             set({ isGlobalSearchLoading: true, globalSearchQuery: query, globalSearchResults: null });
             
             const { employees, clients, suppliers } = usePeopleStore.getState();
             const { jobsites, extraWorkTickets, tools, materials, contracts, legalDocuments } = useOperationsStore.getState();
             const { invoices, estimates } = useFinanceStore.getState();
             const { prospects, opportunities } = useCrmStore.getState();

             const searchableData: geminiService.SearchableData = {
                employees: employees.map(e => ({ id: e.id, name: e.name, job: e.job, isActive: e.isActive })),
                clients: clients.map(c => ({ id: c.id, name: c.name, type: c.type })),
                jobsites: jobsites.map(j => ({ id: j.id, address: j.address, status: j.status })),
                extraWorkTickets, tools, materials, invoices, estimates, legalDocuments, contracts, prospects, opportunities, suppliers
             };

             const results = await geminiService.performGlobalSearch(query, searchableData);
             set({ isGlobalSearchLoading: false, globalSearchResults: results });
        },
        getAssignmentRecommendations: async (requirements) => {
             const { employees } = usePeopleStore.getState();
             return await geminiService.getAssignmentRecommendations(requirements, employees.filter(e => e.isActive));
        },
        getClientProgressSummary: async (jobsiteId) => {
            set({ aiContent: { isLoading: true, title: `Resumen de Progreso para Cliente`, content: '' } });
            const { jobsites, productionLogs, extraWorkTickets } = useOperationsStore.getState();
            const jobsite = jobsites.find(j => j.id === jobsiteId);
            if (jobsite) {
                const summary = await geminiService.generateClientProgressSummary(jobsite, productionLogs, extraWorkTickets);
                set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: summary } }));
            } else {
                 set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: 'Sitio no encontrado.' } }));
            }
        },
        getVehicleMaintenancePrediction: async (vehicleId) => {
            set({ aiContent: { isLoading: true, title: `Predicción de Mantenimiento`, content: '' } });
            const { vehicles, maintenanceLogs } = useOperationsStore.getState();
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if(vehicle) {
                const prediction = await geminiService.predictVehicleMaintenance(vehicle, maintenanceLogs.filter(l => l.vehicleId === vehicleId));
                set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: prediction } }));
            } else {
                set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: 'Vehículo no encontrado.' } }));
            }
        },
        getContractScopeSuggestion: async (contractTitle, clientName) => {
            const { contracts } = useOperationsStore.getState();
            return await geminiService.generateContractScope(contractTitle, clientName, contracts);
        },
        getForemanPerformanceAnalysis: async (foreman, kpis) => {
            set({ aiContent: { isLoading: true, title: `Análisis de Rendimiento: ${foreman.name}`, content: '' } });
            const analysis = await geminiService.generateForemanPerformanceAnalysis(foreman, kpis);
            set(state => ({ aiContent: { ...state.aiContent, isLoading: false, content: analysis } }));
        },
    })
);