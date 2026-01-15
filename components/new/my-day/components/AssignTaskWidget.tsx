import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { usePeopleStore } from '../../../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../../../hooks/stores/useOperationsStore';
import type { PunchListItem, PunchList } from '../../../../types';

const AssignTaskWidget: React.FC = () => {
    const { t } = useTranslation();
    const { employees } = usePeopleStore();
    const { jobsites, punchLists, savePunchList } = useOperationsStore();

    const [selectedForemanId, setSelectedForemanId] = useState('');
    const [selectedJobsiteId, setSelectedJobsiteId] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskLocation, setTaskLocation] = useState('');

    const foremen = useMemo(() => employees.filter(e => e.job === 'Foreman' && e.isActive), [employees]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedForemanId || !selectedJobsiteId || !taskDescription || !taskLocation) {
            alert('Please fill out all fields.');
            return;
        }

        const newTaskItem: PunchListItem = {
            id: `pli-${Date.now()}`,
            description: taskDescription,
            location: taskLocation,
            status: 'abierto',
            assignedTo: selectedForemanId,
            createdAt: new Date().toISOString(),
        };

        const existingPunchList = punchLists.find(pl => pl.jobsiteId === selectedJobsiteId && pl.name === 'General Tasks');
        
        if (existingPunchList) {
            const updatedList = { ...existingPunchList, items: [...existingPunchList.items, newTaskItem] };
            savePunchList(updatedList, existingPunchList.id);
        } else {
            const newList: PunchList = {
                id: `pl-${Date.now()}`,
                jobsiteId: selectedJobsiteId,
                name: 'General Tasks',
                items: [newTaskItem],
                createdAt: new Date().toISOString(),
            };
            savePunchList(newList, newList.id);
        }
        
        // Reset form
        setSelectedForemanId('');
        setSelectedJobsiteId('');
        setTaskDescription('');
        setTaskLocation('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Assign Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Foreman</label>
                        <select value={selectedForemanId} onChange={e => setSelectedForemanId(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required>
                            <option value="" disabled>Select a Foreman</option>
                            {foremen.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Jobsite</label>
                        <select value={selectedJobsiteId} onChange={e => setSelectedJobsiteId(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required>
                            <option value="" disabled>Select a Jobsite</option>
                            {jobsites.map(j => <option key={j.id} value={j.id}>{j.address}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Description</label>
                        <input type="text" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Location within Jobsite</label>
                        <input type="text" value={taskLocation} onChange={e => setTaskLocation(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white" required />
                    </div>
                 </div>
                <div className="text-right">
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg">Assign Task</button>
                </div>
            </form>
        </div>
    );
};

export default AssignTaskWidget;