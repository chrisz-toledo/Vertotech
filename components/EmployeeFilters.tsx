import React from 'react';
import type { EmployeeFilters } from '../types';
import { useAppStore } from '../hooks/stores/useAppStore';

interface EmployeeFiltersProps {
    filters: EmployeeFilters;
    onFilterChange: (filters: EmployeeFilters) => void;
}

const EmployeeFiltersComponent: React.FC<EmployeeFiltersProps> = ({ filters, onFilterChange }) => {
    const { jobRoles } = useAppStore();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | boolean | undefined = value;
        if (name === 'isActive') {
            processedValue = value === '' ? undefined : value === 'true';
        }

        onFilterChange({
            ...filters,
            [name]: processedValue,
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="job" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oficio</label>
                <select id="job" name="job" value={filters.job || ''} onChange={handleChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                    <option value="">Todos</option>
                    {jobRoles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select id="isActive" name="isActive" value={filters.isActive === undefined ? '' : String(filters.isActive)} onChange={handleChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                </select>
            </div>
        </div>
    );
};

export default EmployeeFiltersComponent;