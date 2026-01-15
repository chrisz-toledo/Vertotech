import React, { useMemo } from 'react';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useModalManager } from '../../hooks/useModalManager';
import { useTranslation } from '../../hooks/useTranslation';
import type { LeaveRequest, LeaveRequestStatus } from '../../types';

import { CalendarIcon } from '../../components/icons/new/CalendarIcon';

const StatusBadge: React.FC<{ status: LeaveRequestStatus }> = ({ status }) => {
    const { t } = useTranslation();
    const styles = {
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        denied: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{t(status)}</span>;
};

export const LeaveRequestView: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { leaveRequests, employees, updateLeaveRequestStatus } = usePeopleStore();
    const { currentUser } = useAppStore();

    const employeeMap = useMemo<Map<string, string>>(() => new Map(employees.map(e => [e.id, e.name])), [employees]);

    const isManager = currentUser?.role === 'Owner' || currentUser?.role === 'Project Manager';

    const requestsToShow = useMemo(() => {
        const sorted = [...leaveRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (isManager) return sorted;
        return sorted.filter(req => req.employeeId === currentUser?.id);
    }, [leaveRequests, isManager, currentUser]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Leave Requests</h2>
                <button 
                    onClick={() => openModal('leaveRequest')}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                >
                    <CalendarIcon className="w-5 h-5" />
                    <span>Submit Request</span>
                </button>
            </div>

            {requestsToShow.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                {isManager && <th className="p-4 text-left text-xs font-medium uppercase">Employee</th>}
                                <th className="p-4 text-left text-xs font-medium uppercase">Type</th>
                                <th className="p-4 text-left text-xs font-medium uppercase">Dates</th>
                                <th className="p-4 text-left text-xs font-medium uppercase">Status</th>
                                {isManager && <th className="p-4"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {requestsToShow.map(req => (
                                <tr key={req.id}>
                                    {isManager && <td className="p-4 font-medium">{employeeMap.get(req.employeeId) || 'Unknown'}</td>}
                                    <td className="p-4">{t(req.type)}</td>
                                    <td className="p-4">{new Date(req.startDate + 'T00:00:00').toLocaleDateString()} - {new Date(req.endDate + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="p-4"><StatusBadge status={req.status} /></td>
                                    {isManager && (
                                        <td className="p-4 text-right">
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => updateLeaveRequestStatus(req.id, 'approved')} className="px-3 py-1 text-sm font-semibold text-white bg-emerald-600 rounded">Approve</button>
                                                    <button onClick={() => updateLeaveRequestStatus(req.id, 'denied')} className="px-3 py-1 text-sm font-semibold text-white bg-rose-600 rounded">Deny</button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Leave Requests</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Submit a new request to get started.</p>
                </div>
            )}
        </div>
    );
};