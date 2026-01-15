import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SafetyReport } from '../../types';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { ShieldCheckIcon } from '../icons/new/ShieldCheckIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import * as geminiService from '../../services/geminiService';
import { ShareIcon } from '../icons/ShareIcon';
import { PrinterIcon } from '../icons/new/PrinterIcon';
import { generatePdfFileFromElement } from '../../utils/pdfGenerator';
import ComplianceReport from './ComplianceReport';

const readFileAsBase64 = (file: File): Promise<{ mimeType: string; data: string; name: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result && typeof reader.result === 'string') {
                resolve({ mimeType: file.type, data: reader.result.split(',')[1], name: file.name });
            } else {
                reject(new Error(`Could not read file: ${file.name}`));
            }
        };
        reader.onerror = () => reject(reader.error || new Error('Unknown file reading error.'));
        reader.readAsDataURL(file);
    });
};

const parseSimpleMarkdown = (text: string): string => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
        .replace(/\n/g, '<br />');

    // Wrap list items in <ul>
    html = html.replace(/(\* (.*?)<br \/>)/g, '<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)+/g, (match) => `<ul class="list-disc list-inside space-y-1">${match}</ul>`);

    // Handle paragraphs for lines that are not list items
    const lines = html.split('<br />');
    html = lines.map(line => {
        if (line.startsWith('<ul>') || line.startsWith('<li>') || line.trim() === '') return line;
        return `<p>${line}</p>`;
    }).join('');

    return html;
};


const SafetyReportCard: React.FC<{ 
    report: SafetyReport; 
    onDelete: (id: string) => void;
    onShare: (report: SafetyReport) => Promise<void>;
    onSavePdf: (report: SafetyReport) => Promise<void>;
}> = ({ report, onDelete, onShare, onSavePdf }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            <div id={`report-${report.id}`} className="printable-area">
                <div className="flex flex-col md:flex-row">
                    <img
                        src={report.image.objectUrl}
                        alt="Safety report"
                        className="w-full md:w-1/3 h-48 md:h-auto object-cover"
                    />
                    <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Análisis de Seguridad</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Generado el {new Date(report.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div
                            className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2"
                            dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(report.analysis) }}
                        />
                    </div>
                </div>
            </div>
             <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 no-print">
                <button onClick={() => onShare(report)} title="Compartir Reporte" className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700">
                    <ShareIcon className="w-4 h-4" /> Compartir
                </button>
                <button onClick={() => onSavePdf(report)} title="Guardar como PDF" className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-gray-600 rounded-lg shadow-sm hover:bg-gray-700">
                    <PrinterIcon className="w-4 h-4" /> Guardar PDF
                </button>
                 <button onClick={() => onDelete(report.id)} title="Eliminar Reporte" className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const SiteAnalysis: React.FC = () => {
    const operationsStore = useOperationsStore();
    const aiStore = useAiStore();
    const appStore = useAppStore();
    const { safetyReports: reports } = operationsStore;

    const [isUploading, setIsUploading] = useState(false);
    const [isOnCooldown, setIsOnCooldown] = useState(false);
    const cooldownTimer = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [trendAnalysis, setTrendAnalysis] = useState<string | null>(null);
    const [isTrendLoading, setIsTrendLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (cooldownTimer.current) {
                clearTimeout(cooldownTimer.current);
            }
        };
    }, []);

    const onAnalyze = aiStore.getSafetyImageAnalysis;
    const onDelete = (id: string) => {
        appStore.confirm({
            title: 'Eliminar Reporte',
            message: '¿Eliminar este reporte de seguridad?',
            onConfirm: () => operationsStore.deleteSafetyReport(id)
        });
    };

    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        setIsUploading(true);
        setIsOnCooldown(true);
        try {
            const objectUrl = URL.createObjectURL(file);
            const imageForApi = await readFileAsBase64(file);
            // FIX: Pass objectUrl and file name to the analysis function.
            await onAnalyze(imageForApi, objectUrl, file.name);
        } catch (error) {
            console.error("Error analyzing image:", error);
            alert("Hubo un error al procesar la imagen.");
        } finally {
            setIsUploading(false);
            cooldownTimer.current = window.setTimeout(() => {
                setIsOnCooldown(false);
            }, 5000); // 5-second cooldown
        }
    };

    const handleGenerateTrends = async () => {
        setIsTrendLoading(true);
        setTrendAnalysis(null);
        try {
            const result = await geminiService.analyzeSafetyTrends(reports);
            setTrendAnalysis(result);
        } catch (error) {
            console.error("Error generating trend report:", error);
            setTrendAnalysis("No se pudo generar el reporte de tendencias.");
        } finally {
            setIsTrendLoading(false);
        }
    };
    
    const handleSavePdf = async (report: SafetyReport) => {
        const element = document.getElementById(`report-${report.id}`);
        if (!element) {
            alert('No se pudo encontrar el contenido del reporte para guardar.');
            return;
        }
        const pdfFile = await generatePdfFileFromElement(element, `SafetyReport-${report.id.substring(0,8)}.pdf`);

        if (pdfFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfFile);
            link.download = pdfFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else {
            alert('No se pudo generar el PDF.');
        }
    };

    const handleShare = async (report: SafetyReport) => {
        const element = document.getElementById(`report-${report.id}`);
        if (!element) {
            alert('No se pudo encontrar el contenido del reporte para compartir.');
            return;
        }
        
        const pdfFile = await generatePdfFileFromElement(element, `SafetyReport-${report.id.substring(0,8)}.pdf`);
        if (!pdfFile) {
            alert('No se pudo generar el PDF para compartir.');
            return;
        }

        const shareData = {
            title: `Reporte de Seguridad - ${new Date(report.createdAt).toLocaleDateString()}`,
            text: `Aquí está el reporte de seguridad generado.`,
            files: [pdfFile],
        };

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error al compartir el reporte:', error);
                    alert('Error al compartir el reporte.');
                }
            }
        } else {
            alert('La compartición de archivos no es compatible. En su lugar, se descargará el PDF.');
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfFile);
            link.download = pdfFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const onDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileChange(e.dataTransfer.files);
    }, []);

    return (
        <div className="space-y-8">
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                Suba una foto de su sitio de trabajo para que Rachy identifique posibles peligros de seguridad y sugiera acciones correctivas.
            </p>

            <div 
                className={`p-8 border-2 border-dashed rounded-xl text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                    disabled={isUploading || isOnCooldown}
                />
                <ShieldCheckIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {isUploading ? "Analizando Imagen..." : (isOnCooldown ? "Por favor espere..." : "Arrastre una imagen o haga clic para subir")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isUploading ? "La IA está procesando la imagen, esto puede tardar unos segundos." : (isOnCooldown ? "El análisis de imágenes tiene un tiempo de reutilización de 5 segundos." : "Busque fotos de andamios, arneses, zanjas o áreas de trabajo.")}
                </p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isOnCooldown}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-wait"
                >
                    <UploadIcon className="w-5 h-5" />
                    <span>{isUploading ? "Analizando..." : (isOnCooldown ? "Espere..." : "Seleccionar Archivo")}</span>
                </button>
            </div>
            
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reporte de Tendencias</h3>
                    <button 
                        onClick={handleGenerateTrends} 
                        disabled={isTrendLoading || reports.length < 2}
                        className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700 transition-colors disabled:bg-violet-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className={`w-5 h-5 ${isTrendLoading ? 'animate-spin' : ''}`} />
                        <span>{isTrendLoading ? 'Generando...' : 'Generar Reporte de Tendencias'}</span>
                    </button>
                </div>
                {trendAnalysis && (
                     <div 
                        className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2 p-4 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(trendAnalysis) }}
                    />
                )}
                 {reports.length < 2 && !trendAnalysis && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Se necesitan al menos 2 reportes para generar un análisis de tendencias.</p>}
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reportes Anteriores</h3>
                {reports.length > 0 ? (
                    reports.map(report => <SafetyReportCard key={report.id} report={report} onDelete={onDelete} onShare={handleShare} onSavePdf={handleSavePdf} />)
                ) : (
                    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <ShieldCheckIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay reportes de seguridad</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Suba una imagen para generar su primer reporte.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const SafetyView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'site' | 'compliance'>('site');
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Análisis de Seguridad IA</h2>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('site')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'site' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Análisis del Sitio
                    </button>
                    <button
                        onClick={() => setActiveTab('compliance')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'compliance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Cumplimiento de Documentos
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'site' && <SiteAnalysis />}
                {activeTab === 'compliance' && <ComplianceReport />}
            </div>
        </div>
    );
};

export default SafetyView;