import React from 'react';
import type { Prospect } from '../../types';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { BullhornIcon } from '../../components/icons/new/BullhornIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { PhoneIcon } from '../../components/icons/PhoneIcon';
import { MailIcon } from '../../components/icons/MailIcon';
import { CheckCircleIcon } from '../../components/icons/new/CheckCircleIcon';

interface ProspectCardProps {
    prospect: Prospect;
    onEdit: (prospect: Prospect) => void;
    onDelete: (prospect: Prospect) => void;
    onConvert: (prospect: Prospect) => void;
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onEdit, onDelete, onConvert }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <BullhornIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{prospect.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Source: {prospect.source || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                    {prospect.contactPerson && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <UserIcon className="w-4 h-4 text-gray-400"/>
                            <span>{prospect.contactPerson}</span>
                        </div>
                    )}
                     {prospect.phone && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <PhoneIcon className="w-4 h-4 text-gray-400"/>
                            <span>{prospect.phone}</span>
                        </div>
                    )}
                    {prospect.email && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MailIcon className="w-4 h-4 text-gray-400"/>
                            <span>{prospect.email}</span>
                        </div>
                    )}
                </div>
            </div>
             <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(prospect)} title="Edit Prospect" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        <PencilIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onDelete(prospect)} title="Delete Prospect" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
                <button 
                    onClick={() => onConvert(prospect)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900"
                >
                    <CheckCircleIcon className="w-4 h-4" />
                    Convert to Client
                </button>
            </div>
        </div>
    );
};