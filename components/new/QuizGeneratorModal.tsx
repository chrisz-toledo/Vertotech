import React, { useState } from 'react';
import type { Quiz } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import * as geminiService from '../../services/geminiService';
import { XCircleIcon } from '../icons/XCircleIcon';
import { WandIcon } from '../icons/new/WandIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface QuizGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuizGeneratorModal: React.FC<QuizGeneratorModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [manualText, setManualText] = useState('');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!manualText.trim()) return;
        setIsLoading(true);
        setQuiz(null);
        try {
            const result = await geminiService.generateQuizFromManual(manualText);
            setQuiz(result);
        } catch (error) {
            console.error(error);
            alert('Error al generar el cuestionario.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setManualText('');
        setQuiz(null);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh] max-h-[800px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <WandIcon className="w-6 h-6 text-violet-600"/>
                        <h2 className="text-xl font-bold">Generador de Cuestionarios con IA</h2>
                    </div>
                    <button onClick={handleClose}><XCircleIcon className="w-7 h-7"/></button>
                </header>
                <main className="flex-grow p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium mb-1">Pegue el texto del manual aquí:</label>
                        <textarea 
                            value={manualText}
                            onChange={e => setManualText(e.target.value)}
                            rows={8}
                            className="w-full p-2 border rounded"
                            placeholder="Ej: Todos los empleados deben usar casco en todo momento en el sitio de trabajo..."
                        />
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading || !manualText.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg disabled:bg-violet-400">
                        <SparklesIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Generando...' : 'Generar Cuestionario'}
                    </button>

                    {quiz && (
                        <div className="pt-4 border-t mt-4">
                            <h3 className="text-2xl font-bold mb-4">{quiz.title}</h3>
                            <div className="space-y-6">
                                {quiz.questions.map((q, qIndex) => (
                                    <div key={qIndex}>
                                        <p className="font-semibold">{qIndex + 1}. {q.questionText}</p>
                                        <ul className="mt-2 space-y-1 pl-4">
                                            {q.options.map((option, oIndex) => (
                                                <li key={oIndex} className={`flex items-center gap-2 p-2 rounded ${oIndex === q.correctAnswerIndex ? 'bg-emerald-100 font-medium' : ''}`}>
                                                    <span className="font-mono">{String.fromCharCode(97 + oIndex)})</span>
                                                    <span>{option}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};