import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { XCircleIcon } from '../icons/XCircleIcon';

interface SignaturePadProps {
    value: string; // Data URL
    onChange: (dataUrl: string) => void;
    disabled?: boolean;
}

export const SignaturePadComponent: React.FC<SignaturePadProps> = ({ value, onChange, disabled = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const resizeCanvas = () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                const canvas = canvasRef.current;
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext('2d')?.scale(ratio, ratio);
                signaturePadRef.current?.clear();
                if (value && signaturePadRef.current) {
                    signaturePadRef.current.fromDataURL(value);
                }
            }
        };
        
        signaturePadRef.current = new SignaturePad(canvasRef.current, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
        });

        if (disabled) {
            signaturePadRef.current.off();
        } else {
            signaturePadRef.current.onEnd = () => {
                if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                    onChange(signaturePadRef.current.toDataURL());
                }
            };
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            signaturePadRef.current?.off();
        };
    }, [disabled]);
    
    useEffect(() => {
        if (signaturePadRef.current) {
            if (value) {
                signaturePadRef.current.fromDataURL(value);
            } else {
                signaturePadRef.current.clear();
            }
        }
    }, [value]);


    const handleClear = () => {
        signaturePadRef.current?.clear();
        onChange('');
    };

    return (
        <div className="relative w-full h-48 border border-gray-300 rounded-lg bg-white">
            <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
            {!disabled && (
                 <button 
                    type="button" 
                    onClick={handleClear} 
                    className="absolute top-2 right-2 p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-rose-500 hover:text-white transition-colors"
                    title="Limpiar Firma"
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export { SignaturePadComponent as SignaturePad };