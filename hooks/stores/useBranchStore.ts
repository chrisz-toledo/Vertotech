import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch } from '../../types';

export interface BranchState {
    branches: Branch[];
    deletedBranches: Branch[];
    currentBranchId: string | null;
}

interface BranchActions {
    saveBranch: (data: any, id?: string) => void;
    deleteBranch: (ids: string[]) => void;
    setCurrentBranch: (id: string) => void;
}

// Lazily seeded default branch: created here in the initializer so it exists
// on first load without a migration step.
const defaultBranch: Branch = {
    id: 'branch-central',
    name: 'Oficina Central',
    address: '',
    phone: '',
    isActive: true,
    createdAt: new Date().toISOString(),
};

export const initialState: BranchState = {
    branches: [defaultBranch],
    deletedBranches: [],
    currentBranchId: defaultBranch.id,
};

export const useBranchStore = create<BranchState & BranchActions>()(
    persist(
        (set) => ({
            ...initialState,

            saveBranch: (data, id) => set(state => {
                if (id) {
                    return { branches: state.branches.map(b => b.id === id ? { ...b, ...data } : b) };
                }
                const newBranch: Branch = { ...data, id: `branch-${Date.now()}`, createdAt: new Date().toISOString() };
                return { branches: [...state.branches, newBranch] };
            }),
            deleteBranch: (ids) => set(state => {
                const toDelete = state.branches.filter(b => ids.includes(b.id)).map(b => ({ ...b, deletedAt: new Date().toISOString() }));
                const remaining = state.branches.filter(b => !ids.includes(b.id));
                const newCurrentId = remaining.some(b => b.id === state.currentBranchId)
                    ? state.currentBranchId
                    : (remaining.find(b => b.isActive)?.id ?? null);
                return {
                    branches: remaining,
                    deletedBranches: [...state.deletedBranches, ...toDelete],
                    currentBranchId: newCurrentId,
                };
            }),
            setCurrentBranch: (id) => set({ currentBranchId: id }),
        }),
        {
            name: 'branch-storage',
            // Safety net: if rehydrated state somehow has no branches (e.g. all deleted),
            // fall back to the seeded default instead of leaving the store empty.
            merge: (persisted, current) => {
                const p = (persisted || {}) as Partial<BranchState>;
                const mergedBranches = p.branches && p.branches.length > 0 ? p.branches : [defaultBranch];
                let mergedCurrentId = p.currentBranchId ?? null;
                if (!mergedCurrentId || !mergedBranches.some(b => b.id === mergedCurrentId)) {
                    mergedCurrentId = mergedBranches.find(b => b.isActive)?.id ?? mergedBranches[0].id;
                }
                return {
                    ...current,
                    branches: mergedBranches,
                    deletedBranches: p.deletedBranches ?? [],
                    currentBranchId: mergedCurrentId,
                };
            },
        }
    )
);
