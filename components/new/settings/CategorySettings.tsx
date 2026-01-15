import React, { useState } from 'react';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { PencilIcon } from '../../icons/PencilIcon';
import { CheckIcon } from '../../icons/CheckIcon';
import { XCircleIcon } from '../../icons/XCircleIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import { BriefcaseIcon } from '../../icons/new/BriefcaseIcon';
import { RulerIcon } from '../../icons/new/RulerIcon';
import { BoxIcon } from '../../icons/new/BoxIcon';
import { CreditCardIcon } from '../../icons/new/CreditCardIcon';
import { ReceiptIcon } from '../../icons/new/ReceiptIcon';
import { CashIcon } from '../../icons/new/CashIcon';

const CategoryManager: React.FC<{
    title: string;
    items: string[];
    onAdd: (item: string) => void;
    onUpdate: (oldItem: string, newItem: string) => void;
    onRemove: (item: string) => void;
    icon: React.ReactNode;
}> = ({ title, items, onAdd, onUpdate, onRemove, icon }) => {
    const [newItem, setNewItem] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleAdd = () => {
        if (newItem.trim() && !items.find(i => i.toLowerCase() === newItem.trim().toLowerCase())) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };

    const handleStartEdit = (item: string) => { setEditingItem(item); setEditValue(item); };
    const handleCancelEdit = () => { setEditingItem(null); setEditValue(''); };
    const handleSaveEdit = () => { if (editingItem && editValue.trim() && editingItem !== editValue.trim()) { onUpdate(editingItem, editValue.trim()); } handleCancelEdit(); };

    return (
        <div className="space-y-3 p-4 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">{icon}{title}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50 dark:bg-gray-900/50">
                {items.map(item => (
                    <div key={item} className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-800 rounded shadow-sm">
                        {editingItem === item ? 
                            <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }} onBlur={handleCancelEdit} className="flex-grow p-1 border rounded bg-white dark:bg-gray-700 dark:text-white" autoFocus /> 
                            : <span className="dark:text-gray-200 px-1">{item}</span> 
                        }
                        <div className="flex items-center gap-1">
                            {editingItem === item ? (<>
                                <button onClick={handleSaveEdit} className="p-1 text-emerald-500" title="Save"><CheckIcon className="w-4 h-4" /></button>
                                <button onClick={handleCancelEdit} className="p-1 text-gray-500" title="Cancel"><XCircleIcon className="w-4 h-4" /></button>
                            </>) : (<>
                                <button onClick={() => handleStartEdit(item)} className="p-1 text-blue-500" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onRemove(item)} className="p-1 text-rose-500" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                            </>)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder={`Add new...`} className="flex-grow p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                <button onClick={handleAdd} className="px-4 py-2 font-semibold text-white bg-primary rounded-lg text-sm">Add</button>
            </div>
        </div>
    );
};


const CategorySettings: React.FC = () => {
    const appStore = useAppStore();
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryManager title={t('jobRoles')} items={appStore.jobRoles} onAdd={appStore.addJobRole} onUpdate={appStore.updateJobRole} onRemove={appStore.removeJobRole} icon={<BriefcaseIcon className="w-5 h-5"/>}/>
            <CategoryManager title={t('productivityUnits')} items={appStore.productivityUnits} onAdd={appStore.addProductivityUnit} onUpdate={appStore.updateProductivityUnit} onRemove={appStore.removeProductivityUnit} icon={<RulerIcon className="w-5 h-5"/>}/>
            <CategoryManager title={t('materialUnits')} items={appStore.materialUnits} onAdd={appStore.addMaterialUnit} onUpdate={appStore.updateMaterialUnit} onRemove={appStore.removeMaterialUnit} icon={<BoxIcon className="w-5 h-5"/>}/>
            <CategoryManager title={t('expenseCategories')} items={appStore.expenseCategories} onAdd={appStore.addExpenseCategory} onUpdate={appStore.updateExpenseCategory} onRemove={appStore.removeExpenseCategory} icon={<CreditCardIcon className="w-5 h-5"/>}/>
            <CategoryManager title={t('payableCategories')} items={appStore.payableCategories} onAdd={appStore.addPayableCategory} onUpdate={appStore.updatePayableCategory} onRemove={appStore.removePayableCategory} icon={<ReceiptIcon className="w-5 h-5"/>}/>
            <CategoryManager title={t('pettyCashCategories')} items={appStore.pettyCashCategories} onAdd={appStore.addPettyCashCategory} onUpdate={appStore.updatePettyCashCategory} onRemove={appStore.removePettyCashCategory} icon={<CashIcon className="w-5 h-5"/>}/>
        </div>
    );
};

export default CategorySettings;