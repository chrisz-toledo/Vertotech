import React, { useMemo } from 'react';
import type { Tool, Employee, ToolStatus, Jobsite } from '../../types';
import { ToolboxIconSimple } from '../icons/new/ToolboxIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { UserIcon } from '../icons/UserIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { Popover } from '../shared/Popover';
import { EmployeeQuickView } from '../employees/EmployeeQuickView';

interface ToolCardProps {
    tool: Tool;
    employeeMap: Map<string, Employee>;
    jobsiteMap: Map<string, Jobsite>;
    onEdit: (tool: Tool) => void;
    onDelete: (tool: Tool) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const StatusBadge: React.FC<{ status: ToolStatus }> = ({ status }) => {
    const styles = {
        available: 'bg-emerald-100 text-emerald-800',
        in_use: 'bg-blue-100 text-blue-800',
        in_maintenance: 'bg-amber-100 text-amber-800',
        broken: 'bg-rose-100 text-rose-800',
    };
    const text = {
        available: 'Disponible',
        in_use: 'En Uso',
        in_maintenance: 'Mantenimiento',
        broken: 'Dañada',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};


const ToolCard: React.FC<ToolCardProps> = ({ tool, employeeMap, jobsiteMap, onEdit, onDelete }) => {
    const assignmentDetails = useMemo(() => {
        const { assignment } = tool;
        const assignedAt = (assignment as any).assignedAt ? `el ${new Date((assignment as any).assignedAt).toLocaleDateString('es-ES', { timeZone: 'UTC' })}` : '';
        
        switch (assignment.type) {
            case 'employee':
                const emp = employeeMap.get(assignment.employeeId);
                return (
                    <div className="flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        {emp ? (
                            <Popover
                                trigger={<span className="underline decoration-dotted cursor-pointer">{emp.name}</span>}
                                content={<EmployeeQuickView employee={emp} />}
                            />
                        ) : (
                            <span>Empleado no encontrado</span>
                        )}
                        <span>({assignedAt})</span>
                    </div>
                );
            case 'jobsite':
                const site = jobsiteMap.get(assignment.jobsiteId);
                return <><LocationMarkerIcon className="w-4 h-4 text-gray-400" /><span>{site ? `${site.address} (${assignedAt})` : 'Sitio no encontrado'}</span></>;
            case 'warehouse':
                return <><BuildingIcon className="w-4 h-4 text-gray-400" /><span>{assignment.warehouseName} ({assignedAt})</span></>;
            case 'unassigned':
                return 'No asignada';
            default:
                return 'Ubicación desconocida';
        }
    }, [tool.assignment, employeeMap, jobsiteMap]);

    const maintenanceSummary = useMemo(() => {
        if (tool.status === 'in_maintenance' && tool.maintenanceDetails) {
            const returnDate = new Date(tool.maintenanceDetails.estimatedReturnDate).toLocaleDateString('es-ES', { timeZone: 'UTC' });
            return `Retorno estimado: ${returnDate} de ${tool.maintenanceDetails.shopName}`;
        }
        return null;
    }, [tool]);

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-5">
             <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
                <ToolboxIconSimple className="w-8 h-8 text-gray-600"/>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{tool.name}</h3>
                        <p className="text-sm text-gray-500">{tool.type}</p>
                    </div>
                    <StatusBadge status={tool.status} />
                </div>
                <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <p><span className="font-semibold text-gray-500">Valor:</span> {formatCurrency(tool.value)}</p>
                    <p><span className="font-semibold text-gray-500">Comprada:</span> {new Date(tool.purchaseDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                    <p><span className="font-semibold text-gray-500">No. Serie:</span> {tool.serialNumber || 'N/A'}</p>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500">Ubicación:</span>
                        <div className="flex items-center gap-1.5">{assignmentDetails}</div>
                    </div>
                     {maintenanceSummary && (
                        <p className="md:col-span-2 mt-2 text-sm text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-200">{maintenanceSummary}</p>
                    )}
                </div>
            </div>
             <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => onEdit(tool)} title="Editar Herramienta" className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(tool)} title="Eliminar Herramienta" className="p-2.5 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

interface ToolListProps {
    tools: Tool[];
    employees: Employee[];
    jobsites: Jobsite[];
    onEdit: (tool: Tool) => void;
    onDelete: (tool: Tool) => void;
}

const ToolList: React.FC<ToolListProps> = ({ tools, employees, jobsites, onEdit, onDelete }) => {
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);
    const jobsiteMap = useMemo(() => new Map(jobsites.map(j => [j.id, j])), [jobsites]);

    return (
        <div>
            {tools.length > 0 ? (
                <div className="space-y-6">
                    {tools.map(tool => (
                        <ToolCard
                            key={tool.id}
                            tool={tool}
                            employeeMap={employeeMap}
                            jobsiteMap={jobsiteMap}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white border border-dashed border-gray-300 rounded-lg">
                    <ToolboxIconSimple className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No hay Herramientas</h3>
                    <p className="mt-2 text-gray-500">Añada una nueva herramienta para empezar a gestionar su inventario.</p>
                </div>
            )}
        </div>
    );
};

export default ToolList;