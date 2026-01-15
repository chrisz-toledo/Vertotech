
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prospect, Opportunity, TrashableType, StoreState } from '../../types';
import { usePeopleStore } from './usePeopleStore';

export interface CrmState {
    prospects: Prospect[];
    opportunities: Opportunity[];
    deletedProspects: Prospect[];
    deletedOpportunities: Opportunity[];
}

interface CrmActions {
    setProspects: (prospects: Prospect[]) => void;
    setOpportunities: (opportunities: Opportunity[]) => void;
    saveProspect: (data: any, id?: string) => void;
    deleteProspect: (ids: string[]) => void;
    convertProspectToClient: (prospect: Prospect) => void;
    saveOpportunity: (data: any, id?: string) => void;
    deleteOpportunity: (ids: string[]) => void;
    restoreItem: (ids: string[], type: TrashableType) => void;
    permanentlyDeleteItem: (ids: string[], type: TrashableType) => void;
}

export const initialState: CrmState = {
    prospects: [],
    opportunities: [],
    deletedProspects: [],
    deletedOpportunities: [],
};

export const useCrmStore = create<CrmState & CrmActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setProspects: (prospects) => set({ prospects }),
            setOpportunities: (opportunities) => set({ opportunities }),
            saveProspect: (data, id) => set(state => {
                if (id) {
                    return { prospects: state.prospects.map(p => p.id === id ? { ...p, ...data } : p) };
                }
                const newProspect: Prospect = { ...data, id: `prospect-${Date.now()}`, createdAt: new Date().toISOString() };
                return { prospects: [...state.prospects, newProspect] };
            }),
            deleteProspect: (ids) => set(state => {
                const toDelete = state.prospects.filter(p => ids.includes(p.id)).map(p => ({ ...p, deletedAt: new Date().toISOString() }));
                return {
                    prospects: state.prospects.filter(p => !ids.includes(p.id)),
                    deletedProspects: [...state.deletedProspects, ...toDelete]
                };
            }),
            convertProspectToClient: (prospect) => {
                usePeopleStore.getState().convertProspectToClient(prospect);
                get().deleteProspect([prospect.id]);
            },
            saveOpportunity: (data, id) => {
                if (data.status === 'won') {
                    const prospect = get().prospects.find(p => p.id === data.prospectId);
                    if (prospect) {
                        usePeopleStore.getState().convertProspectToClient(prospect);
                    }
                }

                set(state => {
                    if (id) {
                        return { opportunities: state.opportunities.map(o => o.id === id ? { ...o, ...data } : o) };
                    }
                    const newOpp: Opportunity = { ...data, id: `opp-${Date.now()}`, createdAt: new Date().toISOString() };
                    return { opportunities: [...state.opportunities, newOpp] };
                });
            },
            deleteOpportunity: (ids) => set(state => {
                const toDelete = state.opportunities.filter(o => ids.includes(o.id)).map(o => ({ ...o, deletedAt: new Date().toISOString() }));
                return {
                    opportunities: state.opportunities.filter(o => !ids.includes(o.id)),
                    deletedOpportunities: [...state.deletedOpportunities, ...toDelete]
                };
            }),
            restoreItem: (ids, type) => set(state => {
                switch (type) {
                    case 'prospects':
                        return { prospects: [...state.prospects, ...state.deletedProspects.filter(i => ids.includes(i.id))], deletedProspects: state.deletedProspects.filter(i => !ids.includes(i.id)) };
                    case 'opportunities':
                         return { opportunities: [...state.opportunities, ...state.deletedOpportunities.filter(i => ids.includes(i.id))], deletedOpportunities: state.deletedOpportunities.filter(i => !ids.includes(i.id)) };
                    default: return {};
                }
            }),
             permanentlyDeleteItem: (ids, type) => set(state => {
                switch (type) {
                    case 'prospects':
                        return { deletedProspects: state.deletedProspects.filter(i => !ids.includes(i.id)) };
                    case 'opportunities':
                        return { deletedOpportunities: state.deletedOpportunities.filter(i => !ids.includes(i.id)) };
                    default: return {};
                }
            }),
        }),
        { name: 'crm-storage' }
    )
);