
import React, { useState } from 'react';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { LeaveRequestType } from '../../types';

import { XCircleIcon } from '../../components/icons/XCircleIcon';
import { CalendarIcon } from '../../components/icons/new/CalendarIcon';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { addLeaveRequest } = usePeopleStore();
    const { currentUser } = useAppStore();

    const [type, setType] = useState<LeaveRequestType>('vacation');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && startDate && endDate) {
            addLeaveRequest({
                employeeId: currentUser.id,
                type,
                startDate,
                endDate,
                reason,
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-blue-600"/>
                        <h2 className="text-xl font-bold">Submit Leave Request</h2>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Leave Type</label>
                            <select value={type} onChange={e => setType(e.target.value as LeaveRequestType)} className="w-full p-2 border rounded">
                                <option value="vacation">Vacation</option>
                                <option value="sick">Sick Leave</option>
                                <option value="personal">Personal</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full p-2 border rounded" />
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-50 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg">Submit</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
