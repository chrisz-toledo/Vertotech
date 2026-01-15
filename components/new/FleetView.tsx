import React from 'react';
import type { Vehicle, MaintenanceLog } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { TruckIcon } from '../icons/new/TruckIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { WandIcon } from '../icons/new/WandIcon';

interface VehicleCardProps {
    vehicle: Vehicle;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicle: Vehicle) => void;
    onPredictMaintenance: (vehicle: Vehicle) => void;
}

const StatusBadge: React.FC<{ status: Vehicle['status'] }> = ({ status }) => {
    const styles = {
        operational: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
        in_repair: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
        out_of_service: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
    };
    const text = {
        operational: 'Operacional',
        in_repair: 'En Reparación',
        out_of_service: 'Fuera de Servicio',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onEdit, onDelete, onPredictMaintenance }) => (
    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5">
        <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <TruckIcon className="w-8 h-8 text-gray-600 dark:text-gray-300"/>
        </div>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{vehicle.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.type}</p>
                </div>
                <StatusBadge status={vehicle.status} />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <p><span className="font-semibold text-gray-500 dark:text-gray-400">Placa:</span> {vehicle.licensePlate || 'N/A'}</p>
                <p><span className="font-semibold text-gray-500 dark:text-gray-400">VIN:</span> {vehicle.vin || 'N/A'}</p>
            </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
            <button onClick={() => onPredictMaintenance(vehicle)} title="Predecir Mantenimiento" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/50">
                <WandIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => onEdit(vehicle)} title="Editar Vehículo" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                <PencilIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => onDelete(vehicle)} title="Eliminar Vehículo" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);

interface FleetViewProps {
    vehicles: Vehicle[];
    maintenanceLogs: MaintenanceLog[];
    onAdd: () => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicle: Vehicle) => void;
    onPredictMaintenance: (vehicle: Vehicle) => void;
}

const FleetView: React.FC<FleetViewProps> = ({ vehicles, maintenanceLogs, onAdd, onEdit, onDelete, onPredictMaintenance }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('fleet')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <TruckIcon className="w-5 h-5" />
                    <span>{t('addVehicle')}</span>
                </button>
            </div>
            {vehicles.length > 0 ? (
                <div className="space-y-6">
                    {vehicles.map(vehicle => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={onEdit} onDelete={onDelete} onPredictMaintenance={onPredictMaintenance} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <TruckIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Vehículos en la Flota</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada un nuevo vehículo para empezar a gestionar su flota.</p>
                </div>
            )}
        </div>
    );
};

export default FleetView;