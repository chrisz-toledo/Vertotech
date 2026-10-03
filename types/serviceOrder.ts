export type ServiceLineKind = 'repuesto' | 'mano_obra';

export type ServiceOrderStatus = 'recibida' | 'en_proceso' | 'lista' | 'entregada';

export interface ServiceLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    kind: ServiceLineKind;
}

export interface ServiceOrder {
    id: string;
    branchId?: string;
    vehicleId: string;
    clientId: string;
    description: string;
    status: ServiceOrderStatus;
    lines: ServiceLine[];
    createdAt: string;
    promisedDate?: string;
}
