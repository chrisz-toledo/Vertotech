import React from 'react';
import type { Payable, Supplier, PurchaseOrder } from '../../types';
import PayableForm from './PayableForm';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ReceiptIcon } from '../icons/new/ReceiptIcon';

interface PayableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payableData: Omit<Payable, 'id' | 'deletedAt'> | Payable) => void;
    editingPayable: Payable | null;
    categories: string[];
    onAddCategory: (category: string) => void;
    suppliers: Supplier[];
    prefillData?: { fromPO: PurchaseOrder };
}

export const PayableModal: React.FC<PayableModalProps> = (props) => {
    const { isOpen, onClose, onSave, editingPayable, categories, onAddCategory, suppliers, prefillData } = props;

    if (!isOpen) return null;

    const handleSave = (data: Omit<Payable, 'id' | 'deletedAt'> | Payable) => {
        onSave(data);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] max-h-[800px]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <ReceiptIcon className="w-6 h-6 text-rose-600"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {editingPayable ? 'Editar Cuenta por Pagar' : 'Añadir Cuenta por Pagar'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors" aria-label="Cerrar formulario">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="overflow-y-auto bg-white dark:bg-gray-800/50">
                    <div className="p-6 sm:p-8">
                        <PayableForm
                            onSave={handleSave}
                            onCancel={onClose}
                            editingPayable={editingPayable}
                            categories={categories}
                            onAddCategory={onAddCategory}
                            suppliers={suppliers}
                            prefillData={prefillData}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};