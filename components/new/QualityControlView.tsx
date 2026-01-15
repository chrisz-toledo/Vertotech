import React from 'react';
import type { Jobsite, PunchList } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { ChecklistIcon } from '../icons/new/ChecklistIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface PunchListCardProps {
    punchList: PunchList;
    jobsite: Jobsite;
    onEdit: (punchList: PunchList) => void;
    onDelete: (punchList: PunchList) => void;
}

const PunchListCard: React.FC<PunchListCardProps> = ({ punchList, jobsite, onEdit, onDelete }) => {
    const openItems = punchList.items.filter(i => i.status !== 'completado').length;
    
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-800">{punchList.name}</h4>
                    <p className="text-xs text-gray-500">Creada el {new Date(punchList.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(punchList)} className="p-1.5 hover:bg-gray-200 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(punchList)} className="p-1.5 hover:bg-gray-200 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="mt-2 text-sm">
                <p><strong>{openItems}</strong> Tareas Abiertas / <strong>{punchList.items.length}</strong> Totales</p>
            </div>
        </div>
    );
};

interface QualityControlViewProps {
    jobsites: Jobsite[];
    punchLists: PunchList[];
    onEditPunchList: (punchList: PunchList) => void;
    onDeletePunchList: (punchList: PunchList) => void;
    onSavePunchList: (punchList: PunchList) => void;
}

const QualityControlView: React.FC<QualityControlViewProps> = (props) => {
    const { jobsites, punchLists, onEditPunchList, onDeletePunchList, onSavePunchList } = props;
    const { t } = useTranslation();

    const handleAddNewList = (jobsiteId: string) => {
        const newList: PunchList = {
            id: `pl-${Date.now()}`,
            jobsiteId,
            name: `Nueva Lista para ${jobsites.find(j => j.id === jobsiteId)?.address}`,
            items: [],
            createdAt: new Date().toISOString()
        };
        onSavePunchList(newList);
        onEditPunchList(newList);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{t('tasks')}</h2>
            
            <div className="space-y-8">
                {jobsites.map(jobsite => {
                    const sitePunchLists = punchLists.filter(pl => pl.jobsiteId === jobsite.id);
                    return (
                        <div key={jobsite.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{jobsite.address}</h3>
                            {sitePunchLists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sitePunchLists.map(pl => (
                                        <PunchListCard key={pl.id} punchList={pl} jobsite={jobsite} onEdit={onEditPunchList} onDelete={onDeletePunchList} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No hay listas de tareas para este sitio.</p>
                            )}
                             <button onClick={() => handleAddNewList(jobsite.id)} className="mt-4 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                                {t('addTask')}
                            </button>
                        </div>
                    );
                })}
                 {jobsites.length === 0 && (
                     <div className="text-center py-16 px-6 bg-white border border-dashed border-gray-300 rounded-lg">
                        <ChecklistIcon className="w-12 h-12 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">No hay Sitios de Trabajo</h3>
                        <p className="mt-2 text-gray-500">Cree un sitio de trabajo para añadir listas de tareas.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default QualityControlView;