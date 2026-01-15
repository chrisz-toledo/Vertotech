import React, { useState, useMemo } from 'react';
import type { Client, ClientFilters } from '../types';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../hooks/stores/useOperationsStore';
import { useAppStore } from '../hooks/stores/useAppStore';
import { usePeekPanel } from '../hooks/usePeekPanel';

import ClientCard from './ClientCard';
import { ClientRow } from './clients/ClientRow';
import { BulkActionBar } from './new/BulkActionBar';
import { useTranslation } from '../hooks/useTranslation';
import { BuildingIcon } from './icons/BuildingIcon';
import { FilterIcon } from './icons/FilterIcon';
import ViewSwitcher from './shared/ViewSwitcher';

const ClientList: React.FC = () => {
  const { t } = useTranslation();
  const { open: openPeekPanel } = usePeekPanel();
  
  const { clients, deleteClient, bulkToggleClientStatus, toggleClientStatus } = usePeopleStore();
  const { jobsites } = useOperationsStore();
  const { confirm, openFilterPanel, savedViews, viewModes, setViewMode } = useAppStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<ClientFilters>({});
  const [activeViewId, setActiveViewId] = useState<string>('all');
  
  const viewMode = viewModes.client || 'grid';

  const clientViews = [{id: 'all', name: 'Todos'}, ...savedViews.filter(v => v.entity === 'client')];

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
        if (activeFilters.type && client.type !== activeFilters.type) return false;
        if (activeFilters.isActive !== undefined && client.isActive !== activeFilters.isActive) return false;
        return true;
    });
  }, [clients, activeFilters]);

  const handleSelectView = (view: {id: string, name: string, filters?: any}) => {
    setActiveViewId(view.id);
    setActiveFilters(view.filters || {});
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? filteredClients.map(c => c.id) : []);
  };

  const handleToggleSelection = (id: string) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
      );
  };
  
  const handleDeleteRequest = (client: Client) => {
      confirm({
          title: `Confirmar Eliminación de Cliente`,
          message: `¿Está seguro de que desea mover a ${client.name} a la papelera?`,
          onConfirm: () => deleteClient([client.id]),
      });
  };
  
  const handleBulkDelete = () => {
    confirm({
        title: 'Eliminar Clientes',
        message: `¿Mover ${selectedIds.length} clientes a la papelera?`,
        onConfirm: () => {
            deleteClient(selectedIds);
            setSelectedIds([]);
        }
    });
  };

  const handleBulkToggleStatus = (isActive: boolean) => {
      bulkToggleClientStatus(selectedIds, isActive);
      setSelectedIds([]);
  };

  const isAllSelected = filteredClients.length > 0 && selectedIds.length === filteredClients.length;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('clients')}</h2>
        <div className="flex items-center gap-2">
             <button onClick={() => openFilterPanel('client')} className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <FilterIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('filters')}</span>
            </button>
            <ViewSwitcher viewMode={viewMode} setViewMode={(mode) => setViewMode('client', mode)} />
            <button onClick={() => openPeekPanel('client')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                <BuildingIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('addClient')}</span>
            </button>
        </div>
      </div>

      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-6">
        {clientViews.map(view => (
            <button
                key={view.id}
                onClick={() => handleSelectView(view)}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${activeViewId === view.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
                {view.name}
            </button>
        ))}
      </div>

      {filteredClients.length > 0 ? (
        viewMode === 'grid' ? (
        <>
          <div className="mb-4 flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <input
                  type="checkbox"
                  id="select-all-clients"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  aria-label="Seleccionar todos los clientes"
              />
              <label htmlFor="select-all-clients" className="font-semibold text-gray-700 dark:text-gray-200 select-none">
                  Seleccionar Todo ({selectedIds.length} / {filteredClients.length})
              </label>
          </div>
          <div className="space-y-6">
            {filteredClients.map((client) => (
              <ClientCard 
                key={client.id} 
                client={client} 
                jobsites={jobsites}
                onEdit={(clientToEdit) => openPeekPanel('client', { client: clientToEdit })}
                onDeleteRequest={handleDeleteRequest} 
                onToggleStatus={toggleClientStatus}
                isSelected={selectedIds.includes(client.id)}
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
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Sitios</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map(client => (
                  <ClientRow
                    key={client.id}
                    client={client}
                    jobsiteCount={jobsites.filter(j => j.clientId === client.id).length}
                    isSelected={selectedIds.includes(client.id)}
                    onToggleSelection={handleToggleSelection}
                    onDeleteRequest={handleDeleteRequest}
                    onNavigate={(clientToEdit) => openPeekPanel('client', { client: clientToEdit })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <BuildingIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('noClientsFound')}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{Object.keys(activeFilters).length > 0 ? 'Pruebe ajustar sus filtros.' : t('addFirstClient')}</p>
        </div>
      )}
      
      <BulkActionBar 
        itemType="clientes"
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onToggleActive={() => handleBulkToggleStatus(true)}
        onToggleInactive={() => handleBulkToggleStatus(false)}
        onDelete={handleBulkDelete}
      />
    </>
  );
};

export default ClientList;