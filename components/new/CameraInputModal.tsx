
import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon } from '../icons/CameraIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

interface CameraInputModalProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

export const CameraInputModal: React.FC<CameraInputModalProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'environment' } 
                    });
                    streamRef.current = mediaStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } else {
                    setError('El acceso a la cámara no es compatible.');
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError('No se pudo acceder a la cámara.');
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
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4">
                    {error ? (
                        <div className="text-center p-4">
                            <p className="text-rose-600">{error}</p>
                            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Cerrar</button>
                        </div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded bg-gray-900" muted />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                {!error && (
                    <div className="bg-gray-100 p-3 flex justify-center items-center gap-4 border-t">
                        <button 
                            onClick={handleCapture} 
                            className="flex items-center justify-center gap-2 px-5 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <CameraIcon className="w-5 h-5" />
                            <span>Capturar</span>
                        </button>
                         <button onClick={onClose} className="p-2 text-gray-500 hover:text-rose-600">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
