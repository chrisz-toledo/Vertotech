import React from 'react';
import type { Jobsite, Client } from '../../types';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { BuildingIcon } from '../icons/BuildingIcon';


interface JobsiteQuickViewProps {
  jobsite: Jobsite;
  client?: Client;
}

export const JobsiteQuickView: React.FC<JobsiteQuickViewProps> = ({ jobsite, client }) => {
  const statusInfo = {
    not_started: { text: 'Aún sin empezar', className: 'bg-gray-100 text-gray-800' },
    in_progress: { text: 'En Progreso', className: 'bg-blue-100 text-blue-800' },
    on_hold: { text: 'Suspendido', className: 'bg-amber-100 text-amber-800' },
    completed: { text: 'Terminado', className: 'bg-emerald-100 text-emerald-800' },
    cancelled: { text: 'Cancelado', className: 'bg-rose-100 text-rose-800' },
  };
  const status = statusInfo[jobsite.status] || statusInfo.not_started;
  
  return (
    <div className="p-4 w-72">
      <div className="flex items-start gap-3">
        <LocationMarkerIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100">{jobsite.address}</p>
          <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${status.className}`}>
            {status.text}
          </span>
        </div>
      </div>
       {client && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <BuildingIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{client.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};