import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import jsQR from 'jsqr';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../hooks/stores/useOperationsStore';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../hooks/stores/useAppStore';

import { XCircleIcon } from './icons/XCircleIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { CameraIcon } from './icons/CameraIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import type { Client, Employee } from '../types';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const parseEmployeeIdFromVCard = (vCard: string): string | null => {
    const vCardContent = vCard.split('BEGIN:VCARD')[1] || '';
    const noteLine = vCardContent.split(/\r?\n/).find(line => line.startsWith('NOTE:Employee ID:'));
    if (noteLine) {
        const idPart = noteLine.substring('NOTE:Employee ID:'.length).split('\\n')[0];
        return idPart.trim();
    }
    if (!vCard.includes('BEGIN:VCARD') && vCard.includes('$') && vCard.length > 10) {
        return vCard.trim();
    }
    return null;
};

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
    const { employees, clients } = usePeopleStore();
    const { jobsites, registerAttendance } = useOperationsStore();
    const { getRandomSafetyTip } = useAppStore();
    const { t } = useTranslation();
    
    const [selectedJobsiteId, setSelectedJobsiteId] = useState<string>('');
    const [feedback, setFeedback] = useState<{ message: string, type: 'info' | 'success' | 'error' }>({ message: 'Seleccione un sitio de trabajo para comenzar.', type: 'info' });
    const [isScanning, setIsScanning] = useState(false);
    const [activeFacingMode, setActiveFacingMode] = useState<'user' | 'environment' | null>(null);
    const [isForemanMode, setIsForemanMode] = useState(false);
    const [safetyBriefing, setSafetyBriefing] = useState<{ tip: string, onConfirm: () => void } | null>(null);
    const [lastScan, setLastScan] = useState<{ name: string, time: string } | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | undefined>(undefined);
    const flashRef = useRef<HTMLDivElement>(null);

    const clientMap = useMemo(() => new Map<string, Client>(clients.map(c => [c.id, c])), [clients]);

    const jobsitesWithClients = useMemo(() => {
        return jobsites
            .filter(j => j.status === 'in_progress' || j.status === 'not_started')
            .map(jobsite => ({
                ...jobsite,
                clientName: clientMap.get(jobsite.clientId)?.name || 'Cliente Desconocido'
            }))
            .sort((a, b) => a.clientName.localeCompare(b.clientName) || a.address.localeCompare(b.address));
    }, [jobsites, clientMap]);
    
    const triggerFlash = (type: 'success' | 'error') => {
        const flashEl = flashRef.current;
        if (flashEl) {
            const color = type === 'success' ? 'bg-emerald-500/50' : 'bg-rose-500/50';
            flashEl.className = `absolute inset-0 ${color} opacity-100 transition-opacity duration-500`;
            setTimeout(() => {
                flashEl.className = `absolute inset-0 ${color} opacity-0 transition-opacity duration-500`;
            }, 100);
        }
    };

    const stopScan = useCallback(() => {
        if (typeof animationFrameId.current === 'number') {
            cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = undefined;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsScanning(false);
        setActiveFacingMode(null);
    }, []);

    const handleScan = useCallback((decodedText: string) => {
        if (!isForemanMode) {
            setIsScanning(false);
        }
        
        const employeeId = parseEmployeeIdFromVCard(decodedText);
        const employee = employees.find(e => e.id === employeeId);

        if (!employee) {
            setFeedback({ message: 'QR de empleado no reconocido.', type: 'error' });
            triggerFlash('error');
            if (isForemanMode) setTimeout(() => setFeedback({ message: 'Listo para escanear...', type: 'info' }), 2000);
            return;
        }

        const confirmCheckIn = () => {
            const result = registerAttendance(employeeId, selectedJobsiteId);
            const message = t(result.messageKey as any, result.messageParams);
            setFeedback({ message, type: result.success ? 'success' : 'error' });
            triggerFlash(result.success ? 'success' : 'error');
            
            if (isForemanMode) {
                setLastScan({ name: employee.name, time: new Date().toLocaleTimeString() });
                setTimeout(() => setFeedback({ message: 'Listo para escanear...', type: 'info' }), 2000);
            }
        };

        const tip = getRandomSafetyTip();
        setSafetyBriefing({ tip, onConfirm: () => {
            confirmCheckIn();
            setSafetyBriefing(null);
        }});

    }, [employees, selectedJobsiteId, isForemanMode, registerAttendance, t, getRandomSafetyTip]);
    
    const tick = useCallback(() => {
        if (isScanning && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            if (canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    if (video.videoWidth > 0 && video.videoHeight > 0) {
                        canvas.height = video.videoHeight;
                        canvas.width = video.videoWidth;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "dontInvert",
                        });

                        if (code) {
                            handleScan(code.data);
                        }
                    }
                }
            }
        }
        if (isScanning) {
            animationFrameId.current = requestAnimationFrame(tick);
        }
    }, [isScanning, handleScan]);

    const startScan = useCallback(async (facingMode: 'user' | 'environment') => {
        stopScan();
        setFeedback({ message: 'Iniciando cámara...', type: 'info' });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsScanning(true);
            setActiveFacingMode(facingMode);
            setFeedback({ message: 'Listo para escanear...', type: 'info' });
        } catch (err) {
            console.error("Error accessing camera:", err);
            setFeedback({ message: 'No se pudo acceder a la cámara. Verifique los permisos.', type: 'error' });
            stopScan();
        }
    }, [stopScan]);

    useEffect(() => {
        if (isScanning) {
            animationFrameId.current = requestAnimationFrame(tick);
        } else {
            if (typeof animationFrameId.current === 'number') {
                cancelAnimationFrame(animationFrameId.current);
            }
        }
        return () => {
            if (typeof animationFrameId.current === 'number') {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isScanning, tick]);

    useEffect(() => {
        if (!isOpen) {
            stopScan();
            setSelectedJobsiteId('');
            setFeedback({ message: 'Seleccione un sitio de trabajo para comenzar.', type: 'info' });
            setIsForemanMode(false);
            setLastScan(null);
        }
    }, [isOpen, stopScan]);

    if (!isOpen) return null;

    const canScan = !!selectedJobsiteId;
    
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh] max-h-[800px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <QrCodeIcon className="w-6 h-6 text-teal-600"/>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Escáner QR de Asistencia</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>

                <main className="p-6 flex-grow flex flex-col gap-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-grow">
                            <label htmlFor="jobsite-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sitio de Trabajo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400"><LocationMarkerIcon className="w-5 h-5"/></span>
                                <select id="jobsite-select" value={selectedJobsiteId} onChange={(e) => setSelectedJobsiteId(e.target.value)} className="w-full pl-11 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500">
                                    <option value="" disabled>-- Seleccione Sitio de Trabajo --</option>
                                    {jobsitesWithClients.map(site => (<option key={site.id} value={site.id}>{site.clientName} - {site.address}</option>))}
                                </select>
                            </div>
                        </div>
                         <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                            <label htmlFor="foreman-mode" className="text-sm font-semibold">{t('foremanMode')}</label>
                            <input type="checkbox" id="foreman-mode" checked={isForemanMode} onChange={e => setIsForemanMode(e.target.checked)} className="h-5 w-5 rounded"/>
                        </div>
                    </div>

                    <div className="flex-grow bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center">
                        <div ref={flashRef} className="absolute inset-0 opacity-0 pointer-events-none"></div>
                        <video ref={videoRef} className={`w-full h-full object-cover ${activeFacingMode === 'user' ? 'scale-x-[-1]' : ''}`} playsInline autoPlay muted />
                        <canvas ref={canvasRef} className="hidden" />
                        {(!isScanning && !safetyBriefing) && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><QrCodeIcon className="w-24 h-24 text-white/30" /></div>)}
                         {safetyBriefing && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center text-white">
                                <h3 className="text-xl font-bold mb-4">{t('safetyBriefing')}</h3>
                                <p className="text-lg italic mb-6">"{safetyBriefing.tip}"</p>
                                <button onClick={safetyBriefing.onConfirm} className="px-8 py-3 font-bold bg-emerald-600 rounded-lg text-white">{t('acknowledge')}</button>
                            </div>
                        )}
                    </div>
                    
                    <div className={`p-3 text-center rounded-lg font-semibold transition-colors ${
                        feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                        feedback.type === 'error' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {feedback.message}
                    </div>
                     {isForemanMode && lastScan && (
                        <p className="text-center text-sm text-gray-500">{t('lastScan')}: {lastScan.name} at {lastScan.time}</p>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center gap-4">
                    {isScanning ? (
                        <button onClick={stopScan} className="w-full flex items-center justify-center gap-3 px-6 py-3 text-lg font-bold bg-rose-600 text-white rounded-lg shadow-lg hover:bg-rose-700">
                            <XCircleIcon className="w-6 h-6"/><span>Detener Escaneo</span></button>
                    ) : (
                        <><button onClick={() => startScan('user')} disabled={!canScan} className="w-full flex items-center justify-center gap-3 px-6 py-3 font-semibold bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-teal-400"><CameraIcon className="w-6 h-6"/><span>Cámara Frontal</span></button>
                         <button onClick={() => startScan('environment')} disabled={!canScan} className="w-full flex items-center justify-center gap-3 px-6 py-3 font-semibold bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-teal-400"><CameraIcon className="w-6 h-6"/><span>Cámara Trasera</span></button></>
                    )}
                </footer>
            </div>
        </div>
    );
};