import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { usePOSStore, getOpenCashSession, type SalePayment } from '../../hooks/stores/usePOSStore';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { useWarehouseStore, getStockLevel } from '../../hooks/stores/useWarehouseStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useBranchStore } from '../../hooks/stores/useBranchStore';
import type { InvoiceLineItem } from '../../types';
import { ProductGrid } from './pos/ProductGrid';
import { CartPanel } from './pos/CartPanel';
import { CheckoutModal, type CheckoutPayload } from './pos/CheckoutModal';
import { CashRegisterModal } from './pos/CashRegisterModal';
import { ReturnsModal, type ReturnPayload } from './pos/ReturnsModal';
import { GiftCardsModal } from './pos/GiftCardsModal';
import { generateReceiptPdf, type ReceiptData } from './pos/receipt';
import {
    type POSProduct, type CartLine, type SaleDiscount,
    computeTotals, lineNet, lineDiscountAmount, round2, todayISO, formatMoney, WALK_IN_CLIENT_ID,
} from './pos/posShared';
import { ShoppingCartIcon } from '../icons/new/ShoppingCartIcon';
import { CashIcon } from '../icons/new/CashIcon';
import { ArrowsRightLeftIcon } from '../icons/new/ArrowsRightLeftIcon';
import { TicketIcon } from '../icons/new/TicketIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { CheckCircleIcon } from '../icons/new/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

let lineSeq = 0;

const POSView: React.FC = () => {
    const { t } = useTranslation();

    const branchId = useBranchStore(s => s.currentBranchId) ?? '';
    const branches = useBranchStore(s => s.branches);
    const warehouses = useWarehouseStore(s => s.warehouses);
    const saveStockMovement = useWarehouseStore(s => s.saveStockMovement);
    const materials = useOperationsStore(s => s.materials);
    const tools = useOperationsStore(s => s.tools);
    const clients = usePeopleStore(s => s.clients);
    const employees = usePeopleStore(s => s.employees);
    const saveInvoice = useFinanceStore(s => s.saveInvoice);

    const posPrices = usePOSStore(s => s.prices);
    const taxRate = usePOSStore(s => s.taxRate);
    const setTaxRate = usePOSStore(s => s.setTaxRate);
    const redeemGiftCard = usePOSStore(s => s.redeemGiftCard);
    const recordSale = usePOSStore(s => s.recordSale);
    const recordReturn = usePOSStore(s => s.recordReturn);
    const addCashMovement = usePOSStore(s => s.addCashMovement);

    const [warehouseId, setWarehouseId] = useState('');
    const [cart, setCart] = useState<CartLine[]>([]);
    const [clientId, setClientId] = useState(WALK_IN_CLIENT_ID);
    const [salespersonId, setSalespersonId] = useState('');
    const [saleDiscount, setSaleDiscount] = useState<SaleDiscount>({ type: 'percent', value: 0 });
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [cashOpen, setCashOpen] = useState(false);
    const [returnsOpen, setReturnsOpen] = useState(false);
    const [giftCardsOpen, setGiftCardsOpen] = useState(false);
    const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const branchWarehouses = useMemo(() => {
        const active = warehouses.filter(w => w.isActive);
        const scoped = active.filter(w => w.branchId === branchId);
        return scoped.length > 0 ? scoped : active;
    }, [warehouses, branchId]);

    const effectiveWarehouseId = warehouseId || branchWarehouses[0]?.id || '';

    const products: POSProduct[] = useMemo(() => {
        const list: POSProduct[] = [];
        materials.forEach(m => list.push({
            id: m.id,
            name: m.name,
            productType: 'material',
            unit: m.unit,
            price: posPrices[m.id] ?? 0,
            stock: effectiveWarehouseId ? getStockLevel(m.id, effectiveWarehouseId) : 0,
        }));
        tools.forEach(tl => list.push({
            id: tl.id,
            name: tl.name,
            productType: 'tool',
            unit: 'pza',
            price: posPrices[tl.id] ?? tl.value ?? 0,
            stock: effectiveWarehouseId ? getStockLevel(tl.id, effectiveWarehouseId) : 0,
        }));
        return list;
    }, [materials, tools, posPrices, effectiveWarehouseId]);

    const totals = useMemo(() => computeTotals(cart, saleDiscount, taxRate), [cart, saleDiscount, taxRate]);

    const addToCart = (p: POSProduct) => {
        setCart(prev => {
            const existing = prev.find(l => l.productId === p.id);
            if (existing) {
                return prev.map(l => l.key === existing.key ? { ...l, quantity: l.quantity + 1 } : l);
            }
            return [...prev, {
                key: `cl-${++lineSeq}-${Date.now()}`,
                productId: p.id,
                productType: p.productType,
                description: p.name,
                quantity: 1,
                unitPrice: p.price,
                discountType: 'percent' as const,
                discountValue: 0,
            }];
        });
    };

    const updateLine = (key: string, patch: Partial<CartLine>) =>
        setCart(prev => prev.map(l => l.key === key ? { ...l, ...patch } : l));

    const handleCheckout = () => {
        setError(null);
        if (!effectiveWarehouseId) { setError(t('posSelectWarehouse' as any)); return; }
        setCheckoutOpen(true);
    };

    const handleConfirmSale = (payload: CheckoutPayload) => {
        setError(null);
        const { payments, newSessionId } = payload;

        // Deduct gift card balances (already validated in the modal; re-check here).
        for (const p of payments) {
            if (p.method === 'giftcard' && p.giftCardCode) {
                if (!redeemGiftCard(p.giftCardCode, p.amount)) {
                    setError(t('posInsufficientBalance' as any));
                    return;
                }
            }
        }

        const folio = `POS-${Date.now()}`;
        const today = todayISO();
        const lineItems: InvoiceLineItem[] = cart.map(l => ({
            id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            amount: lineNet(l),
            sourceId: l.productId,
        }));

        const branch = branches.find(b => b.id === branchId);
        saveInvoice({
            id: `manual-pos-${Date.now()}`,
            clientId,
            status: 'paid',
            issueDate: today,
            dueDate: today,
            lineItems,
            subtotal: totals.subtotal,
            taxRate,
            taxAmount: totals.taxAmount,
            total: totals.total,
            notes: `[${folio}] Venta POS${saleDiscount.value > 0 ? ` · descuento ${saleDiscount.value}${saleDiscount.type === 'percent' ? '%' : ''}` : ''}`,
            branchId,
        });

        // saveInvoice's create path overrides id/invoiceNumber; locate the new record and set our folio.
        const created = useFinanceStore.getState().invoices.find(i => i.notes.includes(folio));
        let invoiceId = '';
        if (created) {
            saveInvoice({ ...created, invoiceNumber: folio });
            invoiceId = created.id;
        }

        cart.forEach(l => {
            saveStockMovement({
                productId: l.productId,
                productType: l.productType,
                warehouseId: effectiveWarehouseId,
                type: 'salida',
                quantity: l.quantity,
                date: today,
                reference: folio,
                notes: 'Venta POS',
            });
        });

        const session = getOpenCashSession(branchId);
        const cashSessionId = newSessionId ?? session?.id;
        recordSale({
            invoiceId,
            branchId,
            salespersonId: salespersonId || undefined,
            payments,
            discountTotal: totals.lineDiscounts + totals.saleDiscount,
            cashSessionId,
            lines: cart.map(l => ({
                productId: l.productId,
                productType: l.productType,
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
            })),
        });

        const client = clients.find(c => c.id === clientId);
        const salesperson = employees.find(e => e.id === salespersonId);
        const netSum = cart.reduce((s, l) => s + lineNet(l), 0);
        const receipt: ReceiptData = {
            businessName: branch?.name ?? 'Mi negocio',
            branchName: branch?.address,
            invoiceNumber: folio,
            date: new Date().toLocaleString('es-MX'),
            clientName: client?.name ?? t('posWalkIn' as any),
            salespersonName: salesperson?.name,
            lines: cart.map(l => {
                const ln = lineNet(l);
                const saleShare = netSum > 0 ? round2((totals.saleDiscount * ln) / netSum) : 0;
                return {
                    description: l.description,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    discount: round2(lineDiscountAmount(l) + saleShare),
                    amount: round2(ln - saleShare),
                };
            }),
            subtotal: totals.subtotal,
            discountTotal: totals.lineDiscounts + totals.saleDiscount,
            taxRate,
            taxAmount: totals.taxAmount,
            total: totals.total,
            payments,
            cashierName: session?.openedBy,
        };
        generateReceiptPdf(receipt);
        setLastReceipt(receipt);

        setCart([]);
        setSaleDiscount({ type: 'percent', value: 0 });
        setCheckoutOpen(false);
    };

    const handleConfirmReturn = (p: ReturnPayload) => {
        const { sale, quantities, method } = p;
        const today = todayISO();
        const returnLines = sale.lines
            .map((l, idx) => ({ ...l, idx }))
            .filter(({ idx }) => (quantities[idx] ?? 0) > 0)
            .map(({ idx, ...l }) => ({
                description: l.description,
                quantity: Math.min(quantities[idx], l.quantity),
                unitPrice: l.unitPrice,
                productId: l.productId,
                productType: l.productType,
            }));
        const refundAmount = Math.round(returnLines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) * 100) / 100;

        returnLines.forEach(l => {
            if (l.productId && l.productType) {
                saveStockMovement({
                    productId: l.productId,
                    productType: l.productType,
                    warehouseId: effectiveWarehouseId || sale.branchId,
                    type: 'entrada',
                    quantity: l.quantity,
                    date: today,
                    reference: `DEV-${Date.now()}`,
                    notes: 'Devolución POS',
                });
            }
        });

        recordReturn({ originalInvoiceId: sale.invoiceId, lines: returnLines, refundAmount, method });

        if (method === 'efectivo') {
            const session = getOpenCashSession(sale.branchId);
            if (session) addCashMovement(session.id, 'retiro', refundAmount, `Devolución venta ${sale.invoiceId}`);
        }
        setReturnsOpen(false);
    };

    const openSession = getOpenCashSession(branchId);

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mr-auto">
                    <ShoppingCartIcon className="w-7 h-7" /> {t('pos' as any)}
                </h1>
                <select
                    value={effectiveWarehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                    {branchWarehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </select>
                <button onClick={() => setCashOpen(true)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg ${openSession ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    <CashIcon className="w-4 h-4" />
                    {openSession ? t('posCashOpen' as any) : t('posCashRegister' as any)}
                </button>
                <button onClick={() => setReturnsOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    <ArrowsRightLeftIcon className="w-4 h-4" /> {t('posReturns' as any)}
                </button>
                <button onClick={() => setGiftCardsOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    <TicketIcon className="w-4 h-4" /> {t('posGiftCards' as any)}
                </button>
            </div>

            {error && (
                <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-2.5">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><XCircleIcon className="w-5 h-5" /></button>
                </div>
            )}

            {lastReceipt && (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium rounded-xl px-4 py-2.5">
                    <span className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        {t('posSaleCompleted' as any)} · {lastReceipt.invoiceNumber} · {formatMoney(lastReceipt.total)}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => generateReceiptPdf(lastReceipt)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <PrinterIcon className="w-4 h-4" /> {t('posDownloadReceipt' as any)}
                        </button>
                        <button onClick={() => setLastReceipt(null)}><XCircleIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
                <div className="lg:col-span-3 min-h-[24rem]">
                    <ProductGrid products={products} onAdd={addToCart} />
                </div>
                <div className="lg:col-span-2 min-h-[24rem]">
                    <CartPanel
                        lines={cart}
                        onUpdateLine={updateLine}
                        onRemoveLine={(key) => setCart(prev => prev.filter(l => l.key !== key))}
                        onClear={() => setCart([])}
                        clientId={clientId}
                        onClientChange={setClientId}
                        salespersonId={salespersonId}
                        onSalespersonChange={setSalespersonId}
                        saleDiscount={saleDiscount}
                        onSaleDiscountChange={setSaleDiscount}
                        totals={totals}
                        taxRate={taxRate}
                        onTaxRateChange={setTaxRate}
                        onCheckout={handleCheckout}
                    />
                </div>
            </div>

            <CheckoutModal
                open={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                total={totals.total}
                branchId={branchId}
                onConfirm={handleConfirmSale}
            />
            <CashRegisterModal open={cashOpen} onClose={() => setCashOpen(false)} branchId={branchId} />
            <ReturnsModal open={returnsOpen} onClose={() => setReturnsOpen(false)} onConfirm={handleConfirmReturn} />
            <GiftCardsModal open={giftCardsOpen} onClose={() => setGiftCardsOpen(false)} />
        </div>
    );
};

export default POSView;
