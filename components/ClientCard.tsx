import React, { useState } from 'react';
import type { Client, ClientRating, Jobsite } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { UserIcon } from './icons/UserIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { RatingStars } from './shared/RatingStars';
import { RatingDetailsPopover } from './shared/RatingDetailsPopover';
import { useTranslation } from '../hooks/useTranslation';
import { InvoiceIcon } from './icons/new/InvoiceIcon';
import { BriefcaseIcon } from './icons/new/BriefcaseIcon';
import { Popover } from './shared/Popover';
import { JobsiteQuickView } from './jobsites/JobsiteQuickView';


interface ClientCardProps {
  client: Client;
  jobsites: Jobsite[];
  onEdit: (client: Client) => void;
  onDeleteRequest: (client: Client) => void;
  onToggleStatus: (id: string) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

const RATING_CRITERIA_LABELS: Record<keyof ClientRating, string> = {
    ppeProvision: 'Proporción de PPE',
    toolProvision: 'Proporción de Herramienta',
    picky: 'Nivel de Exigencia (Picky)',
    payment: 'Pago',
    communication: 'Comunicación',
    problemSolving: 'Solución de Problemas',
};

const calculateAverageRating = (rating: ClientRating): number => {
    if (!rating) return 0;
    const ratings = Object.values(rating);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc: number, val: number) => acc + (val || 0), 0);
    return sum / ratings.length;
};

const ClientCard: React.FC<ClientCardProps> = ({ client, jobsites, onEdit, onDeleteRequest, onToggleStatus, isSelected, onToggleSelection }) => {
    const { t } = useTranslation();
    const [isRatingDetailsVisible, setIsRatingDetailsVisible] = useState(false);
    const averageRating = client.rating ? calculateAverageRating(client.rating) : 0;
    const activeJobsites = jobsites.filter(j => j.clientId === client.id);
    
    return (
        <div 
            onClick={() => onEdit(client)}
            className={`relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${isSelected ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500' : 'border-slate-300/30 dark:border-slate-700/30 shadow-lg'}`}
        >
            <div className="p-4 sm:p-5 flex items-start gap-4">
                <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {e.stopPropagation(); onToggleSelection(client.id);}}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 mt-1 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    aria-label={`Seleccionar ${client.name}`}
                />
                <div className={`flex-shrink-0 mt-1 w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-sm overflow-hidden ${client.type === 'company' ? 'bg-sky-100/80 dark:bg-sky-900/50 border-sky-200/80 dark:border-sky-700/80' : 'bg-indigo-100/80 dark:bg-indigo-900/50 border-indigo-200/80 dark:border-indigo-700/80'}`}>
                    {client.type === 'company' ? <BuildingIcon className="w-8 h-8 text-sky-600 dark:text-sky-400" /> : <UserIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                </div>

                <div className="flex-grow w-full space-y-3">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className={`text-xl font-bold ${client.type === 'company' ? 'text-sky-600 dark:text-sky-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{client.name}</h3>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${client.isActive ? 'bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200/70 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300'}`}>
                                {client.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        {client.type === 'company' && client.contactPerson && <p className="text-sm text-gray-500 dark:text-gray-400">Contacto: {client.contactPerson}</p>}
                    </div>
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="space-y-1">
                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Teléfono 1:</span> <span className="text-gray-800 dark:text-gray-200">{client.phone1 || 'N/A'}</span></p>
                            {client.phone2 && <p><span className="font-semibold text-gray-500 dark:text-gray-400">Teléfono 2:</span> <span className="text-gray-800 dark:text-gray-200">{client.phone2}</span></p>}
                        </div>
                         <div className="space-y-1">
                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Email:</span> <span className="text-gray-800 dark:text-gray-200 truncate">{client.email || 'N/A'}</span></p>
                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Retención:</span> <span className="text-gray-800 dark:text-gray-200">{client.retentionPercentage || 0}%</span></p>
                         </div>
                    </div>
                    <div className="pt-2">
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Dirección:</span> <span className="text-gray-800 dark:text-gray-200">{client.address || 'N/A'}</span></p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                         <div 
                            className="relative flex items-center gap-2 cursor-pointer w-fit"
                            onMouseEnter={() => setIsRatingDetailsVisible(true)}
                            onMouseLeave={() => setIsRatingDetailsVisible(false)}
                        >
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Calificación:</p>
                            <RatingStars rating={averageRating} starClassName="w-5 h-5" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1">{averageRating.toFixed(1)}</span>
                            {isRatingDetailsVisible && client.rating && <RatingDetailsPopover rating={client.rating} labels={RATING_CRITERIA_LABELS} />}
                        </div>
                    </div>
                    {activeJobsites.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Sitios de Trabajo ({activeJobsites.length})</h4>
                            <div className="space-y-2 max-h-28 overflow-y-auto pr-2">
                                {activeJobsites.map(site => (
                                    <div key={site.id} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <LocationMarkerIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0"/>
                                        <Popover
                                            trigger={<span className="underline decoration-dotted cursor-pointer hover:text-blue-600">{site.address}</span>}
                                            content={<JobsiteQuickView jobsite={site} client={client} />}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
                 <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(client); }} title="Mover a Papelera" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100/70 dark:hover:bg-rose-900/50 transition-colors duration-200">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 border-t border-slate-300/30 dark:border-slate-700/30 rounded-b-xl">
                <div className="flex items-center gap-2">
                    {client.type === 'company' && (
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200/70 dark:hover:bg-indigo-900/70">
                           <BriefcaseIcon className="w-4 h-4" /> {t('newJobsite')}
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 rounded-md hover:bg-emerald-200/70 dark:hover:bg-emerald-900/70">
                       <InvoiceIcon className="w-4 h-4" /> {t('newInvoice')}
                    </button>
                </div>
                 <p className="font-mono text-xs text-gray-500 dark:text-gray-500">ID: <span className="select-all">{client.id}</span></p>
            </div>
        </div>
    );
};

export default ClientCard;