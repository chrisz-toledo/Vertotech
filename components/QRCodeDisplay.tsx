
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { Employee } from '../types';

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

interface QRCodeDisplayProps {
  employee: Employee;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ employee, size = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [employee.photoUrl]);

  useEffect(() => {
    const generateQR = async () => {
        if (canvasRef.current && employee) {
            const nameParts = employee.name.trim().split(/\s+/);
            const lastName = nameParts.length > 1 ? nameParts.pop() as string : nameParts[0] || '';
            const firstName = nameParts.join(' ');
            
            const note = `Employee ID: ${employee.id}${employee.ssn ? `\\nSSN: ${employee.ssn}` : ''}`;
            
            let photoVCardPart: string | null = null;
            if (employee.photoUrl && !imageLoadError) {
                try {
                    let base64Data: string;
                    let mimeType: string = 'image/jpeg';

                    if (employee.photoUrl.startsWith('data:image')) {
                        const parts = employee.photoUrl.split(',');
                        const meta = parts[0];
                        base64Data = parts[1];
                        mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
                    } else if (employee.photoUrl.startsWith('blob:')) {
                        base64Data = await blobUrlToBase64(employee.photoUrl);
                    } else {
                        base64Data = '';
                    }

                    if (base64Data) {
                        const imageType = mimeType.split('/')[1].toUpperCase();
                        photoVCardPart = `PHOTO;ENCODING=B;TYPE=${imageType}:${base64Data}`;
                    }
                } catch(error) {
                    console.error("Error processing employee photo for QR Code:", error);
                    setImageLoadError(true);
                }
            }

            const vCardParts = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `N:${lastName};${firstName};;;`,
                `FN:${employee.name}`,
                `ORG:VertoTech`,
                `TITLE:${employee.job}`,
                photoVCardPart,
                (employee.phone1 && employee.phone1.toLowerCase() !== 'n/a') ? `TEL;TYPE=WORK,VOICE:${employee.phone1.replace(/\D/g, '')}` : null,
                (employee.phone2 && employee.phone2.toLowerCase() !== 'n/a') ? `TEL;TYPE=CELL:${employee.phone2.replace(/\D/g, '')}` : null,
                `NOTE:${note}`,
                'END:VCARD',
            ];
            
            const vCard = vCardParts.filter(Boolean).join('\r\n');

            QRCode.toCanvas(canvasRef.current, vCard, {
                width: size,
                margin: 1.5,
                color: {
                    dark: '#1f2937', // gray-800
                    light: '#00000000' // transparent
                }
            }, (error) => {
                if (error) console.error('Failed to generate QR code:', error);
            });
        }
    }
    generateQR();
  }, [employee, size, imageLoadError]);

  return (
    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
        <canvas ref={canvasRef} />
    </div>
    );
};