

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { XCircleIcon } from '../icons/XCircleIcon';
import { BlueprintIcon } from '../icons/new/BlueprintIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { WandIcon } from '../icons/new/WandIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../hooks/useTranslation';

interface BlueprintInterpreterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const readFileAsBase64 = (file: File): Promise<{ mimeType: string; data: string; name: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => reader.result && typeof reader.result === 'string'
            ? resolve({ mimeType: file.type, data: reader.result.split(',')[1], name: file.name })
            : reject(new Error('No se pudo leer el archivo.'));
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const parseMarkdown = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
        .replace(/^\* (.*$)/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/(<li>.*<\/li>)+/gm, (match) => `<ul class="space-y-1">${match}</ul>`)
        .replace(/\n/g, '<br />');
};

export const BlueprintInterpreterModal: React.FC<BlueprintInterpreterModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [blueprint, setBlueprint] = useState<{ file: File; dataUrl: string; } | null>(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const cooldownTimerRef = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, []);

    const handleFileChange = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setBlueprint({ file, dataUrl: e.target?.result as string });
            setAnswer('');
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!blueprint || !question.trim()) return;
        setIsLoading(true);
        setIsCooldown(true);
        setAnswer('');
        try {
            const image = await readFileAsBase64(blueprint.file);
            const result = await geminiService.interpretBlueprint(image, question);
            setAnswer(result);
        } catch (error) {
            console.error(error);
            setAnswer('Ocurrió un error al analizar el plano.');
        } finally {
            setIsLoading(false);
            cooldownTimerRef.current = window.setTimeout(() => setIsCooldown(false), 5000);
        }
    };
    
    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
    const onDragLeave = useCallback(() => setDragOver(false), []);
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileChange(e.dataTransfer.files);
    }, []);
    
    const handleClose = () => {
        setBlueprint(null);
        setQuestion('');
        setAnswer('');
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col border border-gray-200 dark:border-gray-700 h-[90vh] max-h-[800px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3"><BlueprintIcon className="w-6 h-6 text-blue-600"/><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('blueprintInterpreter')}</h2></div>
                    <button onClick={handleClose} className="p-1 rounded-full"><XCircleIcon className="w-8 h-8"/></button>
                </header>
                <main className="flex-grow flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                    <div className="md:w-1/2 flex flex-col gap-4">
                        <div 
                            className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} className="hidden"/>
                            {blueprint ? (
                                <img src={blueprint.dataUrl} alt="Blueprint preview" className="w-full h-full object-contain rounded-lg p-2" />
                            ) : (
                                <div className="text-center p-4">
                                    <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                                    <p className="mt-2 font-semibold text-gray-700 dark:text-gray-200">Arrastre un plano aquí</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">o</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm font-semibold text-blue-600 hover:underline">{t('uploadPlan')}</button>
                                </div>
                            )}
                        </div>
                        {blueprint && <button type="button" onClick={() => { setBlueprint(null); setAnswer(''); }} className="text-sm text-center text-rose-600 hover:underline">Quitar plano</button>}
                    </div>
                    <div className="md:w-1/2 flex flex-col gap-4">
                        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('askQuestion')} rows={3} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"></textarea>
                        <button onClick={handleAnalyze} disabled={!blueprint || !question.trim() || isLoading || isCooldown} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-300">
                            <WandIcon className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                            <span>{isLoading ? t('analyzing') : (isCooldown ? "Espere..." : t('analyzePlan'))}</span>
                        </button>
                        <div className="flex-grow p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full"><SparklesIcon className="w-8 h-8 text-blue-500 animate-spin"/></div>
                            ) : answer ? (
                                <div className="text-sm text-gray-800 dark:text-gray-200 space-y-2" dangerouslySetInnerHTML={{ __html: parseMarkdown(answer) }}></div>
                            ) : (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-10">La respuesta de la IA aparecerá aquí.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};