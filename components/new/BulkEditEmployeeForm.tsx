import React, { useState } from 'react';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

interface BulkEditEmployeeFormProps {
    ids: string[];
    onComplete: () => void;
}

const BulkEditEmployeeForm: React.FC<BulkEditEmployeeFormProps> = ({ ids, onComplete }) => {
    const { t } = useTranslation();
    const { jobRoles } = useAppStore();
    const { bulkUpdateEmployees } = usePeopleStore();
    
    const [updateJob, setUpdateJob] = useState(false);
    const [job, setJob] = useState('');
    const [updateRate, setUpdateRate] = useState(false);
    const [hourlyRate, setHourlyRate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates: { job?: string; hourlyRate?: number } = {};
        if (updateJob && job) {
            updates.job = job;
        }
        if (updateRate && hourlyRate) {
            updates.hourlyRate = parseFloat(hourlyRate);
        }

        if (Object.keys(updates).length > 0) {
            bulkUpdateEmployees(ids, updates);
        }
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 border dark:border-gray-600 rounded-lg flex items-start gap-3">
                <input
                    id="updateJob"
                    type="checkbox"
                    checked={updateJob}
                    onChange={(e) => setUpdateJob(e.target.checked)}
                    className="h-5 w-5 mt-1"
                />
                <div className="flex-grow">
                    <label htmlFor="updateJob" className="font-medium dark:text-gray-200">Change Job Title</label>
                    <select
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        disabled={!updateJob}
                        className="w-full p-2 border dark:border-gray-600 rounded-md mt-1 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 dark:text-white"
                    >
                        <option value="" disabled>Select a job title</option>
                        {jobRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="p-3 border dark:border-gray-600 rounded-lg flex items-start gap-3">
                <input
                    id="updateRate"
                    type="checkbox"
                    checked={updateRate}
                    onChange={(e) => setUpdateRate(e.target.checked)}
                    className="h-5 w-5 mt-1"
                />
                <div className="flex-grow">
                    <label htmlFor="updateRate" className="font-medium dark:text-gray-200">Change Hourly Rate</label>
                    <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        disabled={!updateRate}
                        className="w-full p-2 border dark:border-gray-600 rounded-md mt-1 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onComplete} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-primary rounded-lg">Apply Changes</button>
            </div>
        </form>
    );
};

export default BulkEditEmployeeForm;