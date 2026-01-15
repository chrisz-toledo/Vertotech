import { create } from 'zustand';
import type { Employee, Client } from '../types';

type PeekPanelType = 'employee' | 'client';

interface PeekPanelProps {
    employee?: Employee | null;
    client?: Client | null;
}

interface PeekPanelState {
    isOpen: boolean;
    type: PeekPanelType | null;
    props: PeekPanelProps;
    open: (type: PeekPanelType, props?: PeekPanelProps) => void;
    close: () => void;
}

export const usePeekPanel = create<PeekPanelState>((set) => ({
    isOpen: false,
    type: null,
    props: {},
    open: (type, props = {}) => set({ isOpen: true, type, props }),
    close: () => set({ isOpen: false }),
}));