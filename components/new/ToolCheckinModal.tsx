import React, { useState, useMemo } from 'react';
import type { Tool, Employee, Jobsite, ToolAssignment } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ArrowsRightLeftIcon } from '../icons/new/ArrowsRightLeftIcon';
import { ToolboxIconSimple } from '../icons/new/ToolboxIcon';
import { UserIcon } from '../icons/UserIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';

interface ToolCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    tools: Tool[];
    employees: Employee[];
    jobsites: Jobsite[];
    onCheckIn: (toolId: string) => void;
    onCheckOut: (toolId: string, assignment: ToolAssignment) => void;
}

export const ToolCheckinModal: React.FC<ToolCheckinModalProps> = (props) => {
    const { isOpen, onClose, tools, employees, jobsites, onCheckIn, onCheckOut } = props;
    const { t } = useTranslation();
    
    const [selectedToolId, setSelectedToolId] = useState('');
    const [action, setAction] = useState<'check-in' | 'check-out'>('check-out');
    const [assignmentType, setAssignmentType] = useState<'employee' | 'jobsite'>('employee');
    const [assignmentId, setAssignmentId] = useState('');

    const selectedTool = useMemo(() => tools.find(t => t.id === selectedToolId), [selectedToolId, tools]);

    const availableToolsForCheckout = useMemo(() => tools.filter(t => t.status === 'available'), [tools]);
    const availableToolsForCheckin = useMemo(() => tools.filter(t => t.status === 'in_use'), [tools]);

    const handleActionChange = (newAction: 'check-in' | 'check-out') => {
        setAction(newAction);
        setSelectedToolId('');
        setAssignmentId('');
    };

    const handleSubmit = () => {
        if (!selectedToolId) return;

        if (action === 'check-in') {
            onCheckIn(selectedToolId);
        } else {
            if (!assignmentId) return;
            
            let assignment: ToolAssignment;
            if (assignmentType === 'employee') {
                assignment = {
                    type: 'employee',
                    employeeId: assignmentId,
                    assignedAt: new Date().toISOString()
                };
            } else { // 'jobsite'
                assignment = {
                    type: 'jobsite',
                    jobsiteId: assignmentId,
                    assignedAt: new Date().toISOString()
                };
            }
            onCheckOut(selectedToolId, assignment);
        }
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <ArrowsRightLeftIcon className="w-6 h-6 text-emerald-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('registerMovement')}</h2>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                        <button onClick={() => handleActionChange('check-out')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${action === 'check-out' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>Check-out</button>
                        <button onClick={() => handleActionChange('check-in')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${action === 'check-in' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>Check-in</button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">{t('tools')}</label>
                        <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400"><ToolboxIconSimple className="w-5 h-5"/></span>
                            <select value={selectedToolId} onChange={e => setSelectedToolId(e.target.value)} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                                <option value="" disabled>Select a tool</option>
                                {(action === 'check-out' ? availableToolsForCheckout : availableToolsForCheckin).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {action === 'check-out' && (
                        <>
                         <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Assign to</label>
                             <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                                <button onClick={() => setAssignmentType('employee')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${assignmentType === 'employee' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>{t('employee')}</button>
                                <button onClick={() => setAssignmentType('jobsite')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${assignmentType === 'jobsite' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>{t('jobsite')}</button>
                            </div>
                         </div>
                         <div>
                             <div className="relative"><span className="absolute left-3.5 top-3.5 text-gray-400">{assignmentType === 'employee' ? <UserIcon className="w-5 h-5"/> : <LocationMarkerIcon className="w-5 h-5"/>}</span>
                                <select value={assignmentId} onChange={e => setAssignmentId(e.target.value)} className="w-full pl-11 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                                    <option value="" disabled>Select...</option>
                                    {(assignmentType === 'employee' ? employees : jobsites).map(item => <option key={item.id} value={item.id}>{'name' in item ? item.name : item.address}</option>)}
                                </select>
                             </div>
                         </div>
                        </>
                    )}
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                     <button onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                     <button onClick={handleSubmit} disabled={!selectedToolId || (action === 'check-out' && !assignmentId)} className="px-6 py-2 font-semibold text-white bg-primary rounded-lg disabled:opacity-50">{t('confirm')}</button>
                </footer>
            </div>
        </div>
    );
};