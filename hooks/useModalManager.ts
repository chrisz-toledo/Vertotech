import { create } from 'zustand';

export type ModalId =
    | 'jobsite' | 'timeLog' | 'qrScanner' | 'trash'
    | 'aiContent' | 'assignmentAssistant' | 'opinions' | 'extraWorkTicket'
    | 'invoiceGenerator' | 'invoiceDetails' | 'tool' | 'material'
    | 'expense' | 'payable' | 'scheduleEntry' | 'blueprintInterpreter'
    | 'purchaseOrder' | 'pettyCash' | 'runPayroll' | 'printChecks'
    | 'subcontractor' | 'specialPayment' | 'contract' | 'productionLog' | 'bid'
    | 'punchList' | 'quizGenerator' | 'vehicle' | 'globalSearch' | 'prices' | 'estimate' | 'legal' | 'priceItem'
    | 'prospect' | 'opportunity' | 'dailyLog'
    // New Modals
    | 'supplier' | 'toolCheckin' | 'quoteRequest' | 'bulkEdit' | 'controlPanel' | 'leaveRequest' | 'balanceHistory';

interface ModalState {
    activeModal: ModalId | null;
    props: any;
    open: (id: ModalId, props?: any) => void;
    close: () => void;
}

export const useModalManager = create<ModalState>((set) => ({
    activeModal: null,
    props: {},
    open: (id, props = {}) => set({ activeModal: id, props }),
    close: () => set({ activeModal: null, props: {} }),
}));