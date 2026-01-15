import React from 'react';
import { XCircleIcon } from '../icons/XCircleIcon';

interface AIGeneratedContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    title: string;
    content: string;
    icon?: React.ReactNode;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-10 w-10 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium">Analizando con IA...</p>
    </div>
);

const parseSimpleMarkdown = (text: string): string => {
    const lines = text.split('\n').map(line => {
        if (line.trim() === '') return '';
        
        // Bold **text**
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        
        // List items * item
        if (line.trim().startsWith('* ')) {
            return `<li class="ml-5 list-disc">${line.trim().substring(2)}</li>`;
        }
        // Paragraphs
        return `<p class="mb-2 last:mb-0">${line}</p>`;
    });

    let html = lines.filter(line => line).join('');
    html = html.replace(/(<li>.*?<\/li>)+/g, (match) => `<ul class="space-y-1">${match}</ul>`);
    
    return html;
};


export const AIGeneratedContentModal: React.FC<AIGeneratedContentModalProps> = ({
    isOpen,
    onClose,
    isLoading,
    title,
    content,
    icon
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors" aria-label="Cerrar resumen">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <main className="p-6 min-h-[200px] flex items-center justify-center w-full">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                         <div 
                            className="w-full text-left text-gray-700 leading-relaxed space-y-4"
                            dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(content) }}
                        />
                    )}
                </main>
                 <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
};