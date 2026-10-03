import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IndustryId } from '../../types/industry';
import { useBranchStore } from './useBranchStore';

export interface IndustryState {
    /** Company-wide industry used when the current branch has no override. */
    defaultIndustryId: IndustryId;
}

interface IndustryActions {
    setDefaultIndustryId: (id: IndustryId) => void;
}

export const initialState: IndustryState = {
    defaultIndustryId: 'construccion',
};

export const useIndustryStore = create<IndustryState & IndustryActions>()(
    persist(
        (set) => ({
            ...initialState,

            setDefaultIndustryId: (id) => set({ defaultIndustryId: id }),
        }),
        {
            name: 'industry-storage',
        }
    )
);

/**
 * Resolves the effective industry for the current session:
 * current branch's `industryId` override -> company's `defaultIndustryId` -> 'construccion'.
 */
export const useCurrentIndustryId = (): IndustryId => {
    const currentBranchId = useBranchStore((s) => s.currentBranchId);
    const branches = useBranchStore((s) => s.branches);
    const defaultIndustryId = useIndustryStore((s) => s.defaultIndustryId);
    const branch = branches.find((b) => b.id === currentBranchId);
    return branch?.industryId ?? defaultIndustryId ?? 'construccion';
};
