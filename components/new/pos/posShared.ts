export interface POSProduct {
    id: string;
    name: string;
    productType: 'material' | 'tool';
    unit: string;
    price: number;
    stock: number;
}

export type LineDiscountType = 'percent' | 'fixed';

export interface CartLine {
    key: string;
    productId: string;
    productType: 'material' | 'tool';
    description: string;
    quantity: number;
    unitPrice: number;
    discountType: LineDiscountType;
    discountValue: number;
}

export interface SaleDiscount {
    type: LineDiscountType;
    value: number;
}

export interface CartTotals {
    subtotal: number;
    lineDiscounts: number;
    saleDiscount: number;
    taxable: number;
    taxAmount: number;
    total: number;
}

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const lineGross = (l: CartLine): number => round2(l.quantity * l.unitPrice);

export const lineDiscountAmount = (l: CartLine): number => {
    const gross = lineGross(l);
    const d = l.discountType === 'percent' ? gross * (l.discountValue / 100) : l.discountValue;
    return round2(Math.min(Math.max(0, d), gross));
};

export const lineNet = (l: CartLine): number => round2(lineGross(l) - lineDiscountAmount(l));

export const computeTotals = (lines: CartLine[], saleDiscount: SaleDiscount, taxRate: number): CartTotals => {
    const subtotal = round2(lines.reduce((s, l) => s + lineGross(l), 0));
    const lineDiscounts = round2(lines.reduce((s, l) => s + lineDiscountAmount(l), 0));
    const afterLines = round2(subtotal - lineDiscounts);
    const rawSale = saleDiscount.type === 'percent' ? afterLines * (saleDiscount.value / 100) : saleDiscount.value;
    const saleDisc = round2(Math.min(Math.max(0, rawSale), afterLines));
    const taxable = round2(afterLines - saleDisc);
    const taxAmount = round2(taxable * taxRate);
    const total = round2(taxable + taxAmount);
    return { subtotal, lineDiscounts, saleDiscount: saleDisc, taxable, taxAmount, total };
};

export const formatMoney = (n: number): string =>
    `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const todayISO = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const WALK_IN_CLIENT_ID = 'mostrador';

export const PAYMENT_METHODS = [
    { id: 'efectivo', labelKey: 'posEfectivo' },
    { id: 'tarjeta', labelKey: 'posTarjeta' },
    { id: 'transferencia', labelKey: 'posTransferencia' },
    { id: 'giftcard', labelKey: 'posGiftcard' },
] as const;
