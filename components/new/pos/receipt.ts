import jsPDF from 'jspdf';
import type { SalePayment } from '../../../hooks/stores/usePOSStore';

export interface ReceiptData {
    businessName: string;
    branchName?: string;
    invoiceNumber: string;
    date: string;
    clientName: string;
    salespersonName?: string;
    lines: { description: string; quantity: number; unitPrice: number; discount: number; amount: number }[];
    subtotal: number;
    discountTotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    payments: SalePayment[];
    cashierName?: string;
}

const money = (n: number): string =>
    `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const methodLabel: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    giftcard: 'Tarjeta de regalo',
};

export const generateReceiptPdf = (data: ReceiptData): void => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 220] });
    const width = 80;
    let y = 8;

    const center = (text: string, size = 9, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.text(text, width / 2, y, { align: 'center' });
        y += size * 0.5 + 1.5;
    };
    const line = (left: string, right: string, size = 8) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        doc.text(left, 4, y);
        doc.text(right, width - 4, y, { align: 'right' });
        y += size * 0.5 + 1.8;
    };
    const divider = () => {
        doc.setLineWidth(0.2);
        doc.line(4, y, width - 4, y);
        y += 3;
    };

    center(data.businessName || 'Mi negocio', 11, true);
    if (data.branchName) center(data.branchName, 8);
    center(`Folio: ${data.invoiceNumber}`, 9, true);
    center(data.date, 8);
    divider();
    line('Cliente:', data.clientName.slice(0, 26));
    if (data.salespersonName) line('Vendedor:', data.salespersonName.slice(0, 26));
    if (data.cashierName) line('Cajero:', data.cashierName.slice(0, 26));
    divider();

    data.lines.forEach(l => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const desc = l.description.length > 30 ? l.description.slice(0, 29) + '…' : l.description;
        doc.text(desc, 4, y);
        y += 4;
        const detail = `${l.quantity} x ${money(l.unitPrice)}${l.discount > 0 ? ` (-${money(l.discount)})` : ''}`;
        doc.text(detail, 4, y);
        doc.text(money(l.amount), width - 4, y, { align: 'right' });
        y += 4.5;
    });
    divider();

    line('Subtotal:', money(data.subtotal));
    if (data.discountTotal > 0) line('Descuentos:', `-${money(data.discountTotal)}`);
    line(`IVA (${Math.round(data.taxRate * 100)}%):`, money(data.taxAmount));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL:', 4, y);
    doc.text(money(data.total), width - 4, y, { align: 'right' });
    y += 6;

    divider();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Pagos:', 4, y);
    y += 4;
    data.payments.forEach(p => {
        const label = p.giftCardCode
            ? `${methodLabel[p.method] ?? p.method} (${p.giftCardCode})`
            : (methodLabel[p.method] ?? p.method);
        line(label, money(p.amount));
    });

    y += 4;
    center('¡Gracias por su compra!', 8);

    doc.save(`recibo-${data.invoiceNumber}.pdf`);
};
