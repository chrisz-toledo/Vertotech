import React, { useState, useMemo } from 'react';
import type { Employee, EmployeeFilters } from '../types';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useAiStore } from '../hooks/stores/useAiStore';
import { useModalManager } from '../hooks/useModalManager';
import { useAppStore } from '../hooks/stores/useAppStore';
import { usePeekPanel } from '../hooks/usePeekPanel';

import { EmployeeCard } from './EmployeeCard';
import { EmployeeRow } from './employees/EmployeeRow';
import { BulkActionBar } from './new/BulkActionBar';
import { useTranslation } from '../hooks/useTranslation';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { FilterIcon } from './icons/FilterIcon';
import ViewSwitcher from './shared/ViewSwitcher';


const EmployeeList: React.FC = () => {
    const { t } = useTranslation();
    const { open: openModal } = useModalManager();
    const { open: openPeekPanel } = usePeekPanel();
    const { openFilterPanel, savedViews, viewModes, setViewMode } = useAppStore();

    const { employees, deleteEmployee, toggleEmployeeStatus, bulkToggleEmployeeStatus } = usePeopleStore();
    const { getPerformanceSummary, getEmployeeRiskAnalysis } = useAiStore();
    const { confirm } = useAppStore();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<EmployeeFilters>({});
    const [activeViewId, setActiveViewId] = useState<string>('all');
    
    const viewMode = viewModes.employee || 'grid';

    const employeeViews = [{id: 'all', name: 'Todos'}, ...savedViews.filter(v => v.entity === 'employee')];

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            if (activeFilters.job && employee.job !== activeFilters.job) return false;
            if (activeFilters.isActive !== undefined && employee.isActive !== activeFilters.isActive) return false;
            return true;
        });
    }, [employees, activeFilters]);

    const handleSelectView = (view: {id: string, name: string, filters?: any}) => {
        setActiveViewId(view.id);
        setActiveFilters(view.filters || {});
    };

    const handleGenerateSummary = (employee: Employee) => {
        getPerformanceSummary(employee);
        openModal('aiContent');
    };
    
    const handleAnalyzeRisks = (employee: Employee) => {
        getEmployeeRiskAnalysis(employee);
        openModal('aiContent');
    };
    
    const handleDeleteRequest = (employee: Employee) => {
        confirm({
            title: `Confirmar Eliminación de Empleado`,
            message: `¿Está seguro de que desea mover a ${employee.name} a la papelera?`,
            onConfirm: () => deleteEmployee([employee.id]),
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? filteredEmployees.map(emp => emp.id) : []);
    };

    const handleToggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        confirm({
            title: 'Eliminar Empleados',
            message: `¿Mover ${selectedIds.length} empleados a la papelera?`,
            onConfirm: () => {
                deleteEmployee(selectedIds);
                setSelectedIds([]);
            }
        });
    };

    const handleBulkToggleStatus = (isActive: boolean) => {
        bulkToggleEmployeeStatus(selectedIds, isActive);
        setSelectedIds([]);
    };
    
    const handleBulkEdit = () => {
        openModal('bulkEdit', { itemType: 'employee', ids: selectedIds });
    };

    const isAllSelected = filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length;

    return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('employees')}</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => openFilterPanel('employee')} className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <FilterIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('filters')}</span>
            </button>
            <ViewSwitcher viewMode={viewMode} setViewMode={(mode) => setViewMode('employee', mode)} />
            <button onClick={() => openPeekPanel('employee')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                <UserPlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('addEmployee')}</span>
            </button>
        </div>
      </div>

      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-6">
        {employeeViews.map(view => (
            <button
                key={view.id}
                onClick={() => handleSelectView(view)}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${activeViewId === view.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
                {view.name}
            </button>
        ))}
      </div>

      {filteredEmployees.length > 0 ? (
        viewMode === 'grid' ? (
          <>
            <div className="mb-4 flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <input
                    type="checkbox"
                    id="select-all-employees"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    aria-label="Seleccionar todos los empleados"
                />
                <label htmlFor="select-all-employees" className="font-semibold text-gray-700 dark:text-gray-200 select-none">
                    Seleccionar Todo ({selectedIds.length} / {filteredEmployees.length})
                </label>
            </div>
            <div className="space-y-6">
              {filteredEmployees.map((employee) => (
                <EmployeeCard 
                  key={employee.id} 
                  employee={employee} 
                  onEdit={(empToEdit) => openPeekPanel('employee', { employee: empToEdit })} 
                  onDeleteRequest={handleDeleteRequest} 
                  onToggleStatus={toggleEmployeeStatus} 
                  onGenerateSummary={handleGenerateSummary}
                  onAnalyzeRisks={handleAnalyzeRisks}
                  isSelected={selectedIds.includes(employee.id)}
                  onToggleSelection={handleToggleSelection}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-4 w-12"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}/></th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Oficio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Pago/hr</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map(employee => (
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    isSelected={selectedIds.includes(employee.id)}
                    onToggleSelection={handleToggleSelection}
                    onDeleteRequest={handleDeleteRequest}
                    onNavigate={(empToEdit) => openPeekPanel('employee', { employee: empToEdit })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <UsersGroupIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Empleados para Mostrar</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{Object.keys(activeFilters).length > 0 ? 'Pruebe ajustar sus filtros.' : 'Comience por añadir su primer empleado.'}</p>
        </div>
      )}
      
      <BulkActionBar 
        itemType="empleados"
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onToggleActive={() => handleBulkToggleStatus(true)}
        onToggleInactive={() => handleBulkToggleStatus(false)}
        onDelete={handleBulkDelete}
        onBulkEdit={handleBulkEdit}
      />
    </>
  );
};

export default EmployeeList;