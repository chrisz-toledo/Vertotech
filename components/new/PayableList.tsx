
import React, { useMemo } from 'react';
import type { Payable, Supplier } from '../../types';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ReceiptIcon } from '../icons/new/ReceiptIcon';
import { formatCurrency } from '../../utils/formatters';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';

interface PayableCardProps {
    payable: Payable;
    supplierName: string;
    onEdit: (payable: Payable) => void;
    onDelete: (payable: Payable) => void;
}

const PayableStatusBadge: React.FC<{ payable: Payable }> = ({ payable }) => {
    const isOverdue = payable.status !== 'paid' && new Date(payable.dueDate) < new Date();
    
    let text = 'Pendiente';
    let styles = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';

    if (isOverdue) {
        text = 'Vencida';
        styles = 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
    } else if (payable.status === 'paid') {
        text = 'Pagada';
        styles = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
    } else if (payable.status === 'partially_paid') {
        text = 'Parcialmente Pagada';
        styles = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }

    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles}`}>{text}</span>;
};


const PayableCard: React.FC<PayableCardProps> = ({ payable, supplierName, onEdit, onDelete }) => {
    const amountRemaining = payable.amountDue - payable.amountPaid;

    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-200 dark:border-rose-700">
                <ReceiptIcon className="w-8 h-8 text-rose-600 dark:text-rose-400"/>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{supplierName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Factura #{payable.invoiceNumber || 'N/A'}</p>
                    </div>
                    <PayableStatusBadge payable={payable} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                     <p className="text-sm text-gray-600 dark:text-gray-300">{payable.description}</p>
                     <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Fecha Venc.:</span> {new Date(payable.dueDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Total:</span> {formatCurrency(payable.amountDue)}</p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Pagado:</span> {formatCurrency(payable.amountPaid)}</p>
                        <p className="font-bold"><span className="font-semibold text-gray-500 dark:text-gray-400">Restante:</span> {formatCurrency(amountRemaining)}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
                {payable.document && (
                    // FIX: Use objectUrl for the href attribute instead of constructing a data URL with the non-existent 'data' property.
                    <a href={payable.document.objectUrl} download={payable.document.name} title="Descargar Factura" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        <PaperclipIcon className="w-5 h-5"/>
                    </a>
                )}
                <button onClick={() => onEdit(payable)} title="Editar" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(payable)} title="Eliminar" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const PayableList: React.FC = () => {
    const financeStore = useFinanceStore();
    const peopleStore = usePeopleStore();
    const appStore = useAppStore();
    const { open: openModal } = useModalManager();

    const { payables } = financeStore;
    const { suppliers } = peopleStore;

    const onEdit = (payable: Payable) => openModal('payable', { payable });
    const onDelete = (payable: Payable) => appStore.confirm({ title: 'Eliminar Cuenta', message: `¿Mover a la papelera?`, onConfirm: () => financeStore.deletePayable([payable.id])});
    const onAdd = () => openModal('payable');

    const supplierMap = useMemo(() => new Map<string, string>(suppliers.map(s => [s.id, s.name])), [suppliers]);

    const sortedPayables = useMemo(() => {
        return [...payables].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [payables]);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cuentas por Pagar</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <ReceiptIcon className="w-5 h-5" />
                    <span>Añadir Factura</span>
                </button>
            </div>
            {sortedPayables.length > 0 ? (
                <div className="space-y-6">
                    {sortedPayables.map(p => (
                        <PayableCard key={p.id} payable={p} supplierName={supplierMap.get(p.supplierId) || 'Proveedor General'} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <ReceiptIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Cuentas por Pagar</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada una nueva factura de proveedor para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default PayableList;