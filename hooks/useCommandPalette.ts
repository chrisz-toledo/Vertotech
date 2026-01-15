import { useState, useEffect, useCallback } from 'react';

export interface Command {
    id: string;
    name: string;
    section: string;
    action: () => void;
    icon: React.ReactNode;
}

export const useCommandPalette = (commands: Command[]) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const openPalette = useCallback(() => setIsOpen(true), []);
    const closePalette = useCallback(() => {
        setIsOpen(false);
        setQuery('');
    }, []);
    
    const togglePalette = useCallback(() => {
        setIsOpen(prev => !prev);
        if (isOpen) setQuery('');
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                togglePalette();
            }
            if (e.key === 'Escape' && isOpen) {
                closePalette();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, togglePalette, closePalette]);

    const filteredCommands = query
        ? commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase()) || 
            cmd.section.toLowerCase().includes(query.toLowerCase())
          )
        : commands;

    return {
        isOpen,
        openPalette,
        closePalette,
        query,
        setQuery,
        filteredCommands,
    };
};
