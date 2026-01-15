

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { DailyLog, LogPhoto, ProductionLog } from '../../types';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useModalManager } from '../../hooks/useModalManager';
import { useTranslation } from '../../hooks/useTranslation';
import * as geminiService from '../../services/geminiService';
import { XCircleIcon } from '../icons/XCircleIcon';
import { BookOpenIcon } from '../icons/new/BookOpenIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';

// FIX: Replaced readFileAsBase64 with readFileAsObjectUrl to align with the Document type definition.
const readFileAsObjectUrl = (file: File): { mimeType: string; objectUrl: string; name: string } => {
    return { mimeType: file.type, objectUrl: URL.createObjectURL(file), name: file.name };
};

// FIX: Added helper to convert object URL to base64 for Gemini API.
const blobUrlToBase64 = (blobUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fetch(blobUrl)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error("Failed to read blob as Base64"));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            })
            .catch(reject);
    });
};

interface DailyLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose }) => {
    const { props: modalProps, open: openModal } = useModalManager();
    const { date, jobsiteId } = modalProps;
    const { t } = useTranslation();

    const operationsStore = useOperationsStore();
    const peopleStore = usePeopleStore();

    const [logData, setLogData] = useState<DailyLog | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);
    const [isPhotoCooldown, setIsPhotoCooldown] = useState(false);
    const photoCooldownTimer = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        return () => {
            if (photoCooldownTimer.current) clearTimeout(photoCooldownTimer.current);
        };
    }, []);

    const aggregatedData = useMemo(() => {
        const personnel = operationsStore.attendanceRecords.filter(r => r.date === date && r.jobsiteId === jobsiteId);
        const tickets = operationsStore.extraWorkTickets.filter(t => t.date === date && t.jobsiteId === jobsiteId);
        const safetyReports = operationsStore.safetyReports.filter(r => r.createdAt.startsWith(date)); // Simplified check
        return { personnel, tickets, safetyReports };
    }, [date, jobsiteId, operationsStore]);
    
     const productionLogsForDate = useMemo(() => {
        if (!date || !jobsiteId) return [];
        return operationsStore.productionLogs.filter(log => log.date === date && log.jobsiteId === jobsiteId);
    }, [date, jobsiteId, operationsStore.productionLogs]);

    const getResponsibleName = (log: ProductionLog) => {
        const { employees, subcontractors } = peopleStore;
        if (log.responsible.type === 'subcontractor') {
            return subcontractors.find(s => s.id === log.responsible.ids[0])?.name || 'Subcontratista Desconocido';
        }
        return log.responsible.ids.map(id => employees.find(e => e.id === id)?.name).filter(Boolean).join(', ');
    };

    useEffect(() => {
        if (isOpen && date && jobsiteId) {
            const existingLog = operationsStore.dailyLogs.find(l => l.id === `${date}-${jobsiteId}`);
            if (existingLog) {
                setLogData(existingLog);
            } else {
                setLogData({
                    id: `${date}-${jobsiteId}`,
                    jobsiteId,
                    date,
                    notes: '',
                    photos: [],
                    createdAt: new Date().toISOString(),
                });
            }
        } else {
            setLogData(null);
        }
    }, [isOpen, date, jobsiteId, operationsStore.dailyLogs]);

    const handleSave = () => {
        if (logData) {
            operationsStore.saveDailyLog(logData, logData.id);
            onClose();
        }
    };

    // FIX: Use readFileAsObjectUrl and construct LogPhoto correctly.
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !logData) return;

        const newPhotos: LogPhoto[] = Array.from(files).map(file => {
            const docData = readFileAsObjectUrl(file);
            return {
                id: `photo-${Date.now()}-${Math.random()}`,
                file: { mimeType: docData.mimeType, objectUrl: docData.objectUrl, name: docData.name },
            };
        });

        setLogData(prev => prev ? { ...prev, photos: [...prev.photos, ...newPhotos] } : null);
    };

    // FIX: Use blobUrlToBase64 to get data for the Gemini API.
    const handleAnalyzePhoto = async (photoId: string) => {
        if (!logData) return;
        const photo = logData.photos.find(p => p.id === photoId);
        if (!photo) return;
        
        setAnalyzingPhotoId(photoId);
        setIsPhotoCooldown(true);
        try {
            const base64Data = await blobUrlToBase64(photo.file.objectUrl);
            const imageForApi = { mimeType: photo.file.mimeType, data: base64Data };
            const analysis = await geminiService.analyzeJobsitePhoto(imageForApi);
            setLogData(prev => prev ? { ...prev, photos: prev.photos.map(p => p.id === photoId ? { ...p, analysis } : p) } : prev);
        } finally {
            setAnalyzingPhotoId(null);
            photoCooldownTimer.current = window.setTimeout(() => setIsPhotoCooldown(false), 5000);
        }
    };
    
    const handleGenerateSummary = async () => {
        if(!logData) return;
        setIsGeneratingSummary(true);
        try {
            const summary = await geminiService.generateDailyLogSummary({
                notes: logData.notes, photosWithAnalysis: logData.photos,
                personnelCount: aggregatedData.personnel.length,
                tickets: aggregatedData.tickets, safetyReports: aggregatedData.safetyReports
            });
            setLogData(prev => prev ? {...prev, summary} : null);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleShare = async () => {
        const printableElement = document.getElementById('printable-content');
        if (!logData || !printableElement) return;
        
        const pdfFile = await generatePdfFileFromElement(printableElement, `DailyLog-${logData.date}.pdf`);
        if (!pdfFile) {
            alert('Failed to generate PDF for sharing.');
            return;
        }

        const jobsiteAddress = operationsStore.jobsites.find(j => j.id === jobsiteId)?.address || 'N/A';
        const shareData = {
            title: `Bitácora Diaria - ${jobsiteAddress}`,
            text: `Aquí está la bitácora diaria para ${jobsiteAddress} del ${new Date(date + 'T00:00:00Z').toLocaleDateString()}.`,
            files: [pdfFile],
        };

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error("Error al compartir la bitácora:", error);
                }
            }
        } else {
             const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfFile);
            link.download = pdfFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            alert('La compartición de archivos no es compatible. En su lugar, se ha descargado el PDF.');
        }
    };

    if (!isOpen || !logData) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[95vh] max-h-[900px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 no-print">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="w-6 h-6 text-blue-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bitácora para {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-8 h-8"/></button>
                </header>
                <main id="printable-content" className="flex-grow p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
                    <div className="md:col-span-2 space-y-4">
                        <div><label className="font-semibold dark:text-gray-200">Notas del Supervisor</label><textarea value={logData.notes} onChange={e => setLogData({...logData, notes: e.target.value})} rows={5} className="w-full mt-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/></div>
                        <div>
                            <label className="font-semibold dark:text-gray-200">Fotos del Sitio</label>
                            <input type="file" ref={fileInputRef} multiple onChange={handlePhotoUpload} accept="image/*" className="hidden"/>
                            <button onClick={() => fileInputRef.current?.click()} className="w-full mt-1 p-3 border-2 border-dashed dark:border-gray-600 rounded-md text-center text-gray-600 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 no-print">Añadir Fotos</button>
                             <div className="mt-2 grid grid-cols-2 gap-4">
                                {logData.photos.map(photo => (
                                    <div key={photo.id} className="border dark:border-gray-600 rounded-lg overflow-hidden">
                                        {/* FIX: Use objectUrl for image src. */}
                                        <img src={photo.file.objectUrl} alt="Jobsite" className="w-full h-32 object-cover"/>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 text-xs">
                                            {photo.analysis && <p className="italic">"{photo.analysis}"</p>}
                                            <button onClick={() => handleAnalyzePhoto(photo.id)} disabled={!!analyzingPhotoId || isPhotoCooldown} className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold mt-1 no-print disabled:opacity-50">
                                                <SparklesIcon className={`w-3 h-3 ${analyzingPhotoId === photo.id ? 'animate-spin' : ''}`} />
                                                {analyzingPhotoId === photo.id ? 'Analizando...' : (isPhotoCooldown ? "Espere..." : photo.analysis ? 'Re-analizar' : 'Analizar con IA')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold dark:text-gray-200">{t('dailyProduction')}</label>
                            <div className="mt-1 space-y-2">
                                {productionLogsForDate.map(log => (
                                    <div key={log.id} className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('responsible')}: {getResponsibleName(log)}</p>
                                        <ul className="list-disc pl-5 mt-1 text-xs text-gray-600 dark:text-gray-300">
                                            {log.tasks.map(task => (
                                                <li key={task.id}>{task.description} - {task.quantity} {task.unit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {productionLogsForDate.length === 0 && (
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">No hay registros de producción para este día.</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => openModal('productionLog', { prefillData: { date, jobsiteId } })}
                                className="w-full mt-2 p-2 text-sm font-semibold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 no-print"
                            >
                                + {t('addProductionLog')}
                            </button>
                        </div>
                        <div>
                            <label className="font-semibold dark:text-gray-200">Resumen del Día (Generado por IA)</label>
                             <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="w-full flex items-center justify-center gap-2 mt-1 mb-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg disabled:bg-violet-400 no-print">
                                <SparklesIcon className={`w-5 h-5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                                {isGeneratingSummary ? 'Generando...' : 'Generar Resumen con IA'}
                            </button>
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[100px] text-sm italic">{logData.summary}</div>
                        </div>
                    </div>
                    <aside className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-600">
                        <h4 className="font-bold dark:text-gray-100">Datos Agregados</h4>
                        <div>
                            <h5 className="font-semibold text-sm dark:text-gray-200">Personal Presente ({aggregatedData.personnel.length})</h5>
                            <ul className="text-xs list-disc pl-5 mt-1 dark:text-gray-300">
                                {aggregatedData.personnel.map(p => <li key={p.employeeId}>{peopleStore.employees.find(e => e.id === p.employeeId)?.name}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold text-sm dark:text-gray-200">Tickets de Trabajo Extra ({aggregatedData.tickets.length})</h5>
                             <ul className="text-xs list-disc pl-5 mt-1 dark:text-gray-300">
                                {aggregatedData.tickets.map(t => <li key={t.id}>#{t.ticketNumber}: {t.description}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h5 className="font-semibold text-sm dark:text-gray-200">Reportes de Seguridad ({aggregatedData.safetyReports.length})</h5>
                             <ul className="text-xs list-disc pl-5 mt-1 dark:text-gray-300">
                                {aggregatedData.safetyReports.map(r => <li key={r.id}>Reporte creado</li>)}
                            </ul>
                        </div>
                    </aside>
                </main>
                <footer className="p-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 no-print">
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                        <ShareIcon className="w-5 h-5"/> Compartir
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">
                        <PrinterIcon className="w-5 h-5"/> Imprimir
                    </button>
                    <button onClick={onClose} className="px-6 py-2 font-semibold bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg">Guardar Bitácora</button>
                </footer>
            </div>
        </div>
    );
};