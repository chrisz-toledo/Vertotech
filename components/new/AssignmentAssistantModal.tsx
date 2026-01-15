import React, { useState } from 'react';
import type { Employee } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';
import { WandIcon } from '../icons/new/WandIcon';
import { UserIcon } from '../icons/UserIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useAiStore } from '../../hooks/stores/useAiStore';

type Recommendation = {
    employee: Employee;
    reason: string;
};

interface AssignmentAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <svg className="animate-spin h-10 w-10 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium">Analizando empleados y buscando las mejores coincidencias...</p>
    </div>
);

const RecommendationCard: React.FC<{ rec: Recommendation }> = ({ rec }) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) return `${names[0][0] || ''}${names[names.length - 1][0] || ''}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 border-2 border-blue-200 overflow-hidden">
                {rec.employee.photoUrl ? (
                    <img src={rec.employee.photoUrl} alt={rec.employee.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-lg font-bold text-blue-600">{getInitials(rec.employee.name)}</span>
                )}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-blue-700">{rec.employee.name}</h4>
                <p className="text-sm text-gray-500">{rec.employee.job}</p>
                <p className="mt-2 text-sm text-gray-800 italic">"{rec.reason}"</p>
            </div>
        </div>
    );
};

export const AssignmentAssistantModal: React.FC<AssignmentAssistantModalProps> = ({ isOpen, onClose }) => {
    const [requirements, setRequirements] = useState('');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getAssignmentRecommendations } = useAiStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requirements.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            const results = await getAssignmentRecommendations(requirements);
            setRecommendations(results);
        } catch (err) {
            setError('Ocurrió un error al obtener las recomendaciones. Por favor, inténtelo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setRequirements('');
        setRecommendations([]);
        setIsLoading(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <WandIcon className="w-6 h-6 text-violet-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Asistente de Asignación Inteligente</h2>
                    </div>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <label htmlFor="requirements" className="block text-md font-medium text-gray-700 dark:text-gray-200">
                        Describa los requisitos para el puesto:
                    </label>
                    <textarea
                        id="requirements"
                        rows={3}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Ej: Necesito un finisher con alta calificación en calidad y disponibilidad inmediata..."
                        className="w-full p-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!requirements.trim() || isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700 transition-colors disabled:bg-violet-300"
                    >
                        {isLoading ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               Buscando...
                            </>
                        ) : (
                           <>
                            <SparklesIcon className="w-5 h-5"/>
                            <span>Obtener Recomendaciones</span>
                           </>
                        )}
                    </button>
                </form>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 min-h-[200px] max-h-[40vh] overflow-y-auto">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <p className="text-center text-rose-600">{error}</p>
                    ) : recommendations.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">Mejores Candidatos:</h3>
                            {recommendations.map(rec => (
                                <RecommendationCard key={rec.employee.id} rec={rec} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                            <UserIcon className="w-12 h-12 text-gray-300 mb-2"/>
                            <p>Las recomendaciones aparecerán aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};