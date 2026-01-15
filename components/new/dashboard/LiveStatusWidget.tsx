import React, { useState, useMemo } from 'react';
import type { Employee } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePeopleStore } from '../../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../../hooks/stores/useOperationsStore';
import { useAppStore } from '../../../hooks/stores/useAppStore';


const LiveStatusWidget: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'present' | 'absent' | 'checkedOut'>('present');
    const { setCurrentView } = useAppStore();

    const { employees } = usePeopleStore();
    const { attendanceRecords } = useOperationsStore();

    const statusLists = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const activeEmployees = employees.filter(e => e.isActive);
        const checkedInTodayIds = new Set(attendanceRecords.filter(r => r.date === todayStr).map(r => r.employeeId));
        
        const present = activeEmployees.filter(e => {
            const record = attendanceRecords.find(r => r.employeeId === e.id && r.date === todayStr);
            return record && !record.checkOutTime;
        });

        const checkedOut = activeEmployees.filter(e => {
            const record = attendanceRecords.find(r => r.employeeId === e.id && r.date === todayStr);
            return record && !!record.checkOutTime;
        });

        const absent = activeEmployees.filter(e => !checkedInTodayIds.has(e.id));

        return { present, absent, checkedOut };
    }, [employees, attendanceRecords]);

    const lists = {
        present: statusLists.present,
        absent: statusLists.absent,
        checkedOut: statusLists.checkedOut,
    };
    
    const activeList = lists[activeTab];

    const EmployeeRow: React.FC<{employee: Employee}> = ({ employee }) => (
        <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 text-xs font-bold flex items-center justify-center text-gray-600 dark:text-gray-300">
                {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{employee.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{employee.job}</p>
            </div>
        </li>
    );

    const handleTabClick = (tab: 'present' | 'absent' | 'checkedOut') => {
        setActiveTab(tab);
        setCurrentView('employees');
    };

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 p-4 border-b border-slate-300/30 dark:border-slate-700/30">{t('liveStatus')}</h3>
            <div className="p-2 border-b border-slate-300/30 dark:border-slate-700/30">
                <div className="flex bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-1">
                    <button onMouseEnter={() => setActiveTab('present')} onClick={() => handleTabClick('present')} className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${activeTab === 'present' ? 'bg-white dark:bg-gray-700 shadow text-emerald-600' : 'text-gray-500 hover:bg-white/50'}`}>{t('present')} ({statusLists.present.length})</button>
                    <button onMouseEnter={() => setActiveTab('absent')} onClick={() => handleTabClick('absent')} className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${activeTab === 'absent' ? 'bg-white dark:bg-gray-700 shadow text-rose-600' : 'text-gray-500 hover:bg-white/50'}`}>{t('absent')} ({statusLists.absent.length})</button>
                    <button onMouseEnter={() => setActiveTab('checkedOut')} onClick={() => handleTabClick('checkedOut')} className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${activeTab === 'checkedOut' ? 'bg-white dark:bg-gray-700 shadow text-gray-600' : 'text-gray-500 hover:bg-white/50'}`}>{t('checkedOut')} ({statusLists.checkedOut.length})</button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {activeList.length > 0 ? (
                    <ul className="space-y-3">
                        {activeList.map(emp => <EmployeeRow key={emp.id} employee={emp} />)}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">No hay empleados en esta categoría.</p>
                )}
            </div>
        </div>
    );
};
export default LiveStatusWidget;