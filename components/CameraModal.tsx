import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { useTranslation } from '../hooks/useTranslation';

interface CameraModalProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'user' } 
                    });
                    streamRef.current = mediaStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } else {
                    setError('Camera access is not supported by this browser.');
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError('Could not access the camera. Please check permissions.');
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                // Flip the canvas horizontally to reverse the mirror effect for the final image
                context.translate(video.videoWidth, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-5">
                    {error ? (
                        <div className="text-center p-8">
                            <h3 className="text-xl font-semibold text-rose-600">Camera Error</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
                            <button onClick={onClose} className="mt-6 px-6 py-2 bg-primary dark:bg-primary-dark text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors">{t('close')}</button>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg bg-gray-900 scale-x-[-1]" muted />
                            <canvas ref={canvasRef} className="hidden" />
                        </>
                    )}
                </div>
                {!error && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 flex justify-center items-center gap-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={handleCapture} 
                            className="flex-grow flex items-center justify-center gap-3 px-6 py-3 text-lg font-bold bg-primary dark:bg-primary-dark text-white rounded-lg shadow-lg hover:bg-primary-hover transition-all transform hover:scale-105"
                        >
                            <CameraIcon className="w-6 h-6" />
                            <span>{t('capturePhoto')}</span>
                        </button>
                         <button 
                            onClick={onClose} 
                            title={t('close')}
                            className="p-3 text-gray-500 bg-gray-200 rounded-full hover:bg-rose-500 hover:text-white transition-colors"
                        >
                            <XCircleIcon className="w-7 h-7" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};