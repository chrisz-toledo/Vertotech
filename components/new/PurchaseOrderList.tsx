import React, { useMemo } from 'react';
import type { PurchaseOrder, Supplier, Payable } from '../../types';
import { useFinanceStore } from '../../hooks/stores/useFinanceStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { ShoppingCartIcon } from '../icons/new/ShoppingCartIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { formatCurrency } from '../../utils/formatters';
import { ReceiptIcon } from '../icons/new/ReceiptIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface PurchaseOrderCardProps {
    po: PurchaseOrder;
    supplierName: string;
    onEdit: (po: PurchaseOrder) => void;
    onDelete: (po: PurchaseOrder) => void;
    payable?: Payable;
}

const StatusBadge: React.FC<{ status: PurchaseOrder['status'] }> = ({ status }) => {
    const styles = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        partially_received: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
        received: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
        cancelled: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
    };
    const text = {
        draft: 'Borrador',
        sent: 'Enviada',
        partially_received: 'Recibido Parcial',
        received: 'Recibida',
        cancelled: 'Cancelada',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const PurchaseOrderCard: React.FC<PurchaseOrderCardProps> = ({ po, supplierName, onEdit, onDelete, payable }) => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();

    const handleCreateBill = () => {
        openModal('payable', {
            prefillData: {
                fromPO: po
            }
        });
    };
    
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{po.poNumber}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Proveedor: {supplierName}</p>
                    </div>
                    <StatusBadge status={po.status} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Fecha: {new Date(po.date).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100 mt-1">Total: {formatCurrency(po.total)}</p>
                </div>
            </div>
            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex justify-between items-center">
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button onClick={() => onEdit(po)} title="Editar OC" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        <PencilIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onDelete(po)} title="Eliminar OC" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
                 {(po.status === 'received' || po.payableId) && (
                    <div className="flex justify-end">
                        {po.payableId && payable ? (
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                               {t('billForPO')} {payable.invoiceNumber || payable.id.substring(0,8)}
                            </p>
                        ) : po.status === 'received' ? (
                            <button onClick={handleCreateBill} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900">
                                <ReceiptIcon className="w-4 h-4" />
                                {t('createBill')}
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

const PurchaseOrderList: React.FC = () => {
    const { purchaseOrders, deletePurchaseOrder, payables } = useFinanceStore();
    const { suppliers } = usePeopleStore();
    const { confirm } = useAppStore();
    const { open: openModal } = useModalManager();

    const onEdit = (po: PurchaseOrder) => openModal('purchaseOrder', { po });
    const onDelete = (po: PurchaseOrder) => confirm({ title: 'Eliminar OC', message: `¿Mover OC #${po.poNumber} a la papelera?`, onConfirm: () => deletePurchaseOrder([po.id]) });
    const onAdd = () => openModal('purchaseOrder');

    const supplierMap = useMemo(() => new Map<string, string>(suppliers.map(s => [s.id, s.name])), [suppliers]);
    const payableMap = useMemo(() => new Map<string, Payable>(payables.map(p => [p.id, p])), [payables]);
    
    const sortedPOs = useMemo(() =>
        [...purchaseOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [purchaseOrders]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Órdenes de Compra</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>Nueva Orden de Compra</span>
                </button>
            </div>
            {sortedPOs.length > 0 ? (
                <div className="space-y-6">
                    {sortedPOs.map(po => <PurchaseOrderCard 
                        key={po.id} 
                        po={po} 
                        supplierName={supplierMap.get(po.supplierId) || 'N/A'} 
                        onEdit={onEdit} 
                        onDelete={onDelete}
                        payable={po.payableId ? payableMap.get(po.payableId) : undefined}
                    />)}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <ShoppingCartIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Órdenes de Compra</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Cree una nueva orden de compra para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderList;