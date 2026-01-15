import React, { useState } from 'react';
import { XCircleIcon } from '../icons/XCircleIcon';
import { LightbulbIcon } from '../icons/new/LightbulbIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { useAppStore } from '../../hooks/stores/useAppStore';

interface OpinionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
        <SparklesIcon className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-gray-600 font-medium">Rachy está analizando los datos...</p>
        <p className="text-sm text-gray-500">Esto puede tardar unos segundos.</p>
    </div>
);

export const OpinionsModal: React.FC<OpinionsModalProps> = ({ isOpen, onClose }) => {
    const { isOpinionsLoading, opinions } = useAiStore();
    const { addConsideredOpinions } = useAppStore();
    const [selectedOpinions, setSelectedOpinions] = useState<string[]>([]);
    
    const isLoading = isOpinionsLoading;

    const handleToggleSelection = (opinion: string) => {
        setSelectedOpinions(prev => 
            prev.includes(opinion) 
                ? prev.filter(op => op !== opinion) 
                : [...prev, opinion]
        );
    };

    const handleAddClick = () => {
        addConsideredOpinions(selectedOpinions);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col border border-gray-200 h-[80vh] max-h-[700px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <LightbulbIcon className="w-6 h-6 text-amber-500"/>
                        <h2 className="text-xl font-bold text-gray-900">Opiniones de Rachy</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>

                <main className="p-6 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : opinions.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Rachy ha analizado los datos y sugiere lo siguiente:</h3>
                            <p className="text-sm text-gray-500">Seleccione las opiniones que considere valiosas para darles seguimiento en su panel de resumen.</p>
                            <ul className="space-y-3 pt-4">
                                {opinions.map((opinion, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                        <input 
                                            type="checkbox"
                                            id={`opinion-${index}`}
                                            checked={selectedOpinions.includes(opinion)}
                                            onChange={() => handleToggleSelection(opinion)}
                                            className="h-5 w-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                        />
                                        <label htmlFor={`opinion-${index}`} className="text-gray-700 cursor-pointer">{opinion}</label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
                             <LightbulbIcon className="w-12 h-12 text-gray-300 mb-2"/>
                             <p>No se pudieron generar opiniones en este momento.</p>
                        </div>
                    )}
                </main>

                <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600">{selectedOpinions.length} seleccionada(s)</p>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                         <button 
                            onClick={handleAddClick} 
                            disabled={selectedOpinions.length === 0}
                            className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                        >
                            Añadir a Consideradas ({selectedOpinions.length})
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};