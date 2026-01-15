import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    icon?: React.ReactNode;
    confirmButtonText?: string;
    confirmButtonVariant?: 'primary' | 'destructive';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    icon,
    confirmButtonText,
    confirmButtonVariant = 'destructive'
}) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const confirmClass = confirmButtonVariant === 'destructive' 
        ? 'glass-button-destructive' 
        : 'glass-button';

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 border border-gray-200 dark:border-gray-700" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    {icon && (
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            {icon}
                        </div>
                    )}
                    <div className="flex-grow">
                        <h2 id="confirm-modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                        <div className="mt-2 text-gray-600 dark:text-gray-300">{message}</div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button 
                        onClick={onClose} 
                        className="glass-button-secondary"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={confirmClass}
                    >
                        {confirmButtonText || t('yesConfirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};