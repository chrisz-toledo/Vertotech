import React, { useMemo } from 'react';
import type { Material, Jobsite } from '../../types';
import { BoxIcon } from '../icons/new/BoxIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface MaterialCardProps {
    material: Material;
    jobsite?: Jobsite;
    onEdit: (material: Material) => void;
    onDelete: (material: Material) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, jobsite, onEdit, onDelete }) => {
    const locationDisplay = useMemo(() => {
        if (material.location.type === 'warehouse') {
            return material.location.name;
        }
        if (material.location.type === 'jobsite') {
            return jobsite?.address || `Sitio ID: ${material.location.jobsiteId}`;
        }
        return 'Ubicación desconocida';
    }, [material.location, jobsite]);
    
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center bg-lime-100 border-2 border-lime-200">
                <BoxIcon className="w-8 h-8 text-lime-600"/>
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-800">{material.name}</h3>
                <p className="text-sm text-gray-500">SKU: {material.sku || 'N/A'}</p>
                <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <p><span className="font-semibold text-gray-500">Cantidad:</span> {material.quantity} {material.unit}</p>
                    <p><span className="font-semibold text-gray-500">Ubicación:</span> {locationDisplay}</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 self-center flex-shrink-0">
                <button onClick={() => onEdit(material)} title="Editar Material" className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(material)} title="Eliminar Material" className="p-2.5 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

interface MaterialListProps {
    materials: Material[];
    jobsites: Jobsite[];
    onEdit: (material: Material) => void;
    onDelete: (material: Material) => void;
}

const MaterialList: React.FC<MaterialListProps> = ({ materials, jobsites, onEdit, onDelete }) => {
    const jobsiteMap = useMemo(() => new Map(jobsites.map(j => [j.id, j])), [jobsites]);
    
    return (
        <div>
            {materials.length > 0 ? (
                <div className="space-y-6">
                    {materials.map(material => (
                        <MaterialCard
                            key={material.id}
                            material={material}
                            jobsite={material.location.type === 'jobsite' ? jobsiteMap.get(material.location.jobsiteId) : undefined}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white border border-dashed border-gray-300 rounded-lg">
                    <BoxIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No hay Materiales</h3>
                    <p className="mt-2 text-gray-500">Añada un nuevo material para empezar a gestionar su inventario.</p>
                </div>
            )}
        </div>
    );
};

export default MaterialList;