import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeRating } from '../types';
import { useAiStore } from '../hooks/stores/useAiStore';
import { TrashIcon } from './icons/TrashIcon';
import { QRCodeDisplay } from './QRCodeDisplay';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { FlagIcon } from './icons/new/FlagIcon';
import { RatingStars } from './shared/RatingStars';
import { RatingDetailsPopover } from './shared/RatingDetailsPopover';
import { formatCurrency } from '../utils/formatters';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDeleteRequest: (employee: Employee) => void;
  onToggleStatus: (id: string) => void;
  onGenerateSummary: (employee: Employee) => void;
  onAnalyzeRisks: (employee: Employee) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

const RATING_CRITERIA_LABELS: Record<keyof EmployeeRating, string> = {
  quality: 'Calidad',
  speed: 'Velocidad',
  proactivity: 'Proactividad',
  autonomy: 'Autonomía',
  punctuality: 'Puntualidad',
  attendance: 'Asistencia',
  availability: 'Disponibilidad',
  obedience: 'Obediencia',
  problemSolving: 'Resolución de Problemas',
  specialty: 'Especialidad',
};

const calculateAverageRating = (rating: EmployeeRating): number => {
    if (!rating) return 0;
    const ratings = Object.values(rating);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc: number, val: number) => acc + (val || 0), 0);
    return sum / ratings.length;
};

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDeleteRequest, onToggleStatus, onGenerateSummary, onAnalyzeRisks, isSelected, onToggleSelection }) => {
    const [isRatingDetailsVisible, setIsRatingDetailsVisible] = useState(false);
    const averageRating = employee.rating ? calculateAverageRating(employee.rating) : 0;

    return (
        <div 
            onClick={() => onEdit(employee)}
            className={`relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${isSelected ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500' : 'border-slate-300/30 dark:border-slate-700/30 shadow-lg'}`}
        >
            <div className="p-4 sm:p-5 flex items-start gap-4">
                <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); onToggleSelection(employee.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 mt-1 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    aria-label={`Seleccionar ${employee.name}`}
                />
                <div className="flex-shrink-0 w-20 h-20 rounded-full border-2 border-white/50 dark:border-gray-600/50 shadow-md overflow-hidden">
                    {employee.photoUrl ? (
                        <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                             <span className="text-2xl font-bold">{employee.name.split(' ').map(n=>n[0]).join('')}</span>
                        </div>
                    )}
                </div>

                <div className="flex-grow w-full space-y-3">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h3>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${employee.isActive ? 'bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200/70 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300'}`}>
                                {employee.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{employee.job}</p>
                    </div>
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Tel:</span> <span className="text-gray-800 dark:text-gray-200">{employee.phone1}</span></p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Pago:</span> <span className="text-gray-800 dark:text-gray-200">{formatCurrency(employee.hourlyRate)}/hr</span></p>
                    </div>
                     <div 
                        className="relative flex items-center gap-2 cursor-pointer w-fit pt-2"
                        onMouseEnter={() => setIsRatingDetailsVisible(true)}
                        onMouseLeave={() => setIsRatingDetailsVisible(false)}
                    >
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Calificación:</p>
                        <RatingStars rating={averageRating} starClassName="w-5 h-5" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1">{averageRating.toFixed(1)}</span>
                        {isRatingDetailsVisible && employee.rating && <RatingDetailsPopover rating={employee.rating} labels={RATING_CRITERIA_LABELS} specialtyFieldName="specialty" specialtyDescription={employee.specialtyDescription} />}
                    </div>
                </div>
                 <div className="flex-shrink-0">
                    <QRCodeDisplay employee={employee} size={80} />
                </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 border-t border-slate-300/30 dark:border-slate-700/30 rounded-b-xl">
                 <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onGenerateSummary(employee); }} title="Generar Resumen de Desempeño" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-100/70 dark:bg-cyan-900/50 rounded-md hover:bg-cyan-200/70 dark:hover:bg-cyan-900/70">
                        <BrainCircuitIcon className="w-4 h-4" /> Resumen
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAnalyzeRisks(employee); }} title="Analizar Riesgos del Empleado" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/50 rounded-md hover:bg-amber-200/70 dark:hover:bg-amber-900/70">
                        <FlagIcon className="w-4 h-4" /> Riesgos
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onToggleStatus(employee.id); }} title={employee.isActive ? 'Marcar como Inactivo' : 'Marcar como Activo'} className={`p-2.5 rounded-full text-white ${employee.isActive ? 'bg-gray-400/80 hover:bg-gray-500/80' : 'bg-emerald-500/80 hover:bg-emerald-600/80'}`}></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(employee); }} title="Mover a Papelera" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100/70 dark:hover:bg-rose-900/50 transition-colors duration-200">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};