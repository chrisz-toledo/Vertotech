import React from 'react';
import type { ClientFilters } from '../types';

interface ClientFiltersProps {
    filters: ClientFilters;
    onFilterChange: (filters: ClientFilters) => void;
}

const ClientFiltersComponent: React.FC<ClientFiltersProps> = ({ filters, onFilterChange }) => {

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
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Cliente</label>
                <select id="type" name="type" value={filters.type || ''} onChange={handleChange} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                    <option value="">Todos</option>
                    <option value="company">Compañía</option>
                    <option value="individual">Individual</option>
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

export default ClientFiltersComponent;