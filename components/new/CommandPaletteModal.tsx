import React, { useState, useEffect, useMemo } from 'react';
import type { Command } from '../../hooks/useCommandPalette';
import { SearchIcon } from '../icons/SearchIcon';

interface CommandPaletteModalProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
    query: string;
    setQuery: (query: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, commands, query, setQuery }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const groupedCommands = useMemo(() => {
        return commands.reduce((acc, cmd) => {
            if (!acc[cmd.section]) {
                acc[cmd.section] = [];
            }
            acc[cmd.section].push(cmd);
            return acc;
        }, {} as Record<string, Command[]>);
    }, [commands]);

    const flatCommands = useMemo(() => Object.values(groupedCommands).flat(), [groupedCommands]);

    useEffect(() => {
        if (!isOpen) {
            setActiveIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % flatCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const command = flatCommands[activeIndex];
                if (command) {
                    command.action();
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, flatCommands, onClose]);
    
    useEffect(() => {
        document.getElementById(`command-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center z-50 p-4 pt-[15vh]" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Escriba un comando o busque..."
                        autoFocus
                        className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                    />
                </div>
                <ul className="flex-grow overflow-y-auto max-h-[50vh] p-2">
                    {Object.entries(groupedCommands).length > 0 ? Object.entries(groupedCommands).map(([section, cmds]) => (
                        <li key={section}>
                            <h3 className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">{section}</h3>
                            <ul className="space-y-1">
                                {cmds.map(cmd => {
                                    const index = flatCommands.findIndex(c => c.id === cmd.id);
                                    return (
                                    <li
                                        key={cmd.id}
                                        id={`command-${index}`}
                                        onClick={() => { cmd.action(); onClose(); }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer text-gray-700 dark:text-gray-200 ${activeIndex === index ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                    >
                                        <span className="flex-shrink-0 w-5 h-5">{cmd.icon}</span>
                                        <span>{cmd.name}</span>
                                    </li>
                                )})}
                            </ul>
                        </li>
                    )) : (
                        <p className="p-4 text-center text-gray-500">No se encontraron comandos.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};
