import React from 'react';
import type { Employee } from '../../types';
import { UserIcon } from '../icons/UserIcon';
import { PhoneIcon } from '../icons/PhoneIcon';

interface EmployeeQuickViewProps {
  employee: Employee;
}

export const EmployeeQuickView: React.FC<EmployeeQuickViewProps> = ({ employee }) => {
  return (
    <div className="p-4 w-64">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 border-2 dark:border-gray-600">
          {employee.photoUrl ? (
            <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100">{employee.name}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">{employee.job}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">{employee.phone1 || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${employee.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            {employee.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
};