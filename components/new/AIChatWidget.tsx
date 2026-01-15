import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatMessagePart } from '../../types';
import { useAiStore } from '../../hooks/stores/useAiStore';
import { BotIcon } from '../icons/new/BotIcon';
import { UserIcon } from '../icons/UserIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { PaperclipIcon } from '../icons/new/PaperclipIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { MicrophoneIcon } from '../icons/new/MicrophoneIcon';
import { CameraInputModal } from './CameraInputModal';
import { VolumeUpIcon } from '../icons/new/VolumeUpIcon';
import { VolumeOffIcon } from '../icons/new/VolumeOffIcon';
import { SendIcon } from '../icons/new/SendIcon';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const textPart = message.parts.find(p => p.type === 'text')?.content as string || '';
    const fileParts = message.parts.filter(p => p.type === 'file' && p.content.mimeType.startsWith('image/'));

    return (
        <div className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-violet-100 border border-violet-200">
                    <BotIcon className="w-5 h-5 text-violet-600" />
                </div>
            )}
            <div className={`flex flex-col gap-1 max-w-xs sm:max-w-sm`}>
                 {fileParts.length > 0 && (
                    <div className="p-1 bg-gray-200 rounded-lg">
                        {fileParts.map((part, index) => (
                           part.type === 'file' && <img key={index} src={`data:${part.content.mimeType};base64,${part.content.data}`} alt="Attached" className="max-w-full h-auto rounded-md" />
                        ))}
                    </div>
                )}
                { textPart && (
                    <div className={`p-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                        {message.isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap break-words">{textPart}</p>
                        )}
                    </div>
                )}
            </div>
             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 border border-blue-200">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
            )}
        </div>
    );
};

export const AIChatWidget: React.FC = () => {
    const { chatHistory, sendMessage } = useAiStore();

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isOpen]);
    
    useEffect(() => {
        const getVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };
        getVoices();
        window.speechSynthesis.onvoiceschanged = getVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (isOpen && !isMuted && voices.length > 0 && lastMessage?.role === 'model' && !lastMessage.isLoading) {
            const textToSpeak = lastMessage.parts.find(p => p.type === 'text')?.content as string;
            if (textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
                let selectedVoice: SpeechSynthesisVoice | null = null;
                const preferredVoiceNames = ['Paulina', 'Mónica', 'Google español de Estados Unidos', 'Marisol', 'Laura'];
                for (const name of preferredVoiceNames) {
                    const voice = spanishVoices.find(v => v.name === name);
                    if (voice) { selectedVoice = voice; break; }
                }
                if (!selectedVoice) selectedVoice = spanishVoices.find(v => v.name.includes('Google')) || null;
                if (!selectedVoice) selectedVoice = spanishVoices.find(v => v.default) || null;
                if (!selectedVoice) selectedVoice = spanishVoices[0];
                if (selectedVoice) { utterance.voice = selectedVoice; utterance.lang = selectedVoice.lang; }
                else { utterance.lang = 'es-US'; }
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }
        }
        return () => { window.speechSynthesis.cancel(); };
    }, [chatHistory, isMuted, isOpen, voices]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-US';
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event: any) => {
                setInput(prev => prev ? `${prev} ${event.results[0][0].transcript}` : event.results[0][0].transcript);
            };
            recognitionRef.current.onerror = (event: any) => { console.error('Speech recognition error:', event.error); setIsListening(false); };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const handleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setInput('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const readFileAsBase64 = useCallback((file: File): Promise<{ mimeType: string; data: string; name: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => reader.result && typeof reader.result === 'string' ? resolve({ mimeType: file.type, data: reader.result.split(',')[1], name: file.name }) : reject(new Error(`No se pudo leer el archivo: ${file.name}`));
            reader.onerror = () => reject(reader.error || new Error('Error desconocido al leer archivo.'));
            reader.readAsDataURL(file);
        });
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim() === '' && attachments.length === 0) return;
        const processedParts: ChatMessagePart[] = [];
        if (input.trim()) processedParts.push({ type: 'text', content: input.trim() });
        try {
            const filePromises = attachments.map(readFileAsBase64);
            const fileResults = await Promise.all(filePromises);
            fileResults.forEach(result => processedParts.push({ type: 'file', content: result as any }));
            sendMessage(processedParts);
            setInput('');
            setAttachments([]);
        } catch (error) {
            console.error("Error processing attachments:", error);
            alert(`Error al procesar archivos adjuntos: ${error instanceof Error ? error.message : "Ocurrió un error desconocido."}`);
            setAttachments([]);
        }
    }, [input, attachments, sendMessage, readFileAsBase64]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files as FileList)]);
        e.target.value = '';
    };

    const handleCameraCapture = async (imageSrc: string) => {
        try {
            const blob = await (await fetch(imageSrc)).blob();
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setAttachments(prev => [...prev, file]);
        } catch (error) {
            console.error("Error converting camera capture to file:", error);
        }
    };
    
    return (
        <>
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                {!isOpen && (
                    <button onClick={() => setIsOpen(true)} className="bg-violet-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-violet-700 transition-transform transform hover:scale-110" title="Abrir Asistente Rachy">
                        <BotIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 rounded-t-2xl flex-shrink-0">
                        <div className="flex items-center gap-2"><BotIcon className="w-6 h-6 text-violet-600"/><h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Rachy</h3></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMuted(prev => !prev)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title={isMuted ? 'Activar voz' : 'Silenciar voz'}>
                                {isMuted ? <VolumeOffIcon className="w-6 h-6"/> : <VolumeUpIcon className="w-6 h-6"/>}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XCircleIcon className="w-6 h-6"/></button>
                        </div>
                    </header>
                    <main className="flex-grow p-4 overflow-y-auto space-y-4">
                        {chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                        <div ref={messagesEndRef} />
                    </main>
                    <footer className="p-3 bg-white dark:bg-gray-800 border-t rounded-b-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><PaperclipIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/></button>
                                <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="hidden" />
                                <button type="button" onClick={() => setIsCameraOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><CameraIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/></button>
                                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()} placeholder={isListening ? 'Escuchando...' : "Pregúntale a Rachy..."} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                                <button type="button" onClick={handleVoiceInput} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-rose-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><MicrophoneIcon className="w-6 h-6"/></button>
                                <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300"><SendIcon className="w-5 h-5"/></button>
                            </div>
                        </form>
                    </footer>
                </div>
            )}
            {isCameraOpen && <CameraInputModal onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
        </>
    );
};