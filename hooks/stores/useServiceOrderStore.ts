import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceOrder, ServiceOrderStatus } from '../../types/serviceOrder';

export interface ServiceOrderState {
    serviceOrders: ServiceOrder[];
}

interface ServiceOrderActions {
    saveServiceOrder: (data: Partial<ServiceOrder> & { lines: ServiceOrder['lines'] }, id?: string) => void;
    deleteServiceOrder: (id: string) => void;
    setStatus: (id: string, status: ServiceOrderStatus) => void;
}

export const initialState: ServiceOrderState = {
    serviceOrders: [],
};

export const useServiceOrderStore = create<ServiceOrderState & ServiceOrderActions>()(
    persist(
        (set) => ({
            ...initialState,

            saveServiceOrder: (data, id) => set(state => {
                if (id) {
                    return { serviceOrders: state.serviceOrders.map(o => o.id === id ? { ...o, ...data } : o) };
                }
                const newOrder: ServiceOrder = {
                    id: `so-${Date.now()}`,
                    branchId: data.branchId,
                    vehicleId: data.vehicleId ?? '',
                    clientId: data.clientId ?? '',
                    description: data.description ?? '',
                    status: data.status ?? 'recibida',
                    lines: data.lines ?? [],
                    createdAt: new Date().toISOString(),
                    promisedDate: data.promisedDate,
                };
                return { serviceOrders: [...state.serviceOrders, newOrder] };
            }),

            deleteServiceOrder: (id) => set(state => ({
                serviceOrders: state.serviceOrders.filter(o => o.id !== id),
            })),

            setStatus: (id, status) => set(state => ({
                serviceOrders: state.serviceOrders.map(o => o.id === id ? { ...o, status } : o),
            })),
        }),
        { name: 'serviceorder-storage' }
    )
);
