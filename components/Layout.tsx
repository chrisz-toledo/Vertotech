

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../hooks/stores/useAppStore';
import { useModalManager } from '../hooks/useModalManager';
import { useTranslation } from '../hooks/useTranslation';
import { getNavGroupDefinitions, NavGroup } from '../config/navigation';
import Header from './Header';
import AppRouter from './AppRouter';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ViewType } from '../types';
import { GlobeIcon } from './icons/GlobeIcon';
import { CheckIcon } from './icons/CheckIcon';

export const Layout: React.FC = () => {
    const { t, language, setLanguage } = useTranslation();
    const { open: openModal } = useModalManager();
    const { currentView, setCurrentView, currentUser } = useAppStore();

    const [expandedGroups, setExpandedGroups] = useState<string[]>(['general', 'people', 'finance', 'operations', 'sales-crm']);
    const [isLangPopoverOpen, setIsLangPopoverOpen] = useState(false);
    const langPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (langPopoverRef.current && !langPopoverRef.current.contains(event.target as Node)) {
            setIsLangPopoverOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [langPopoverRef]);

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => 
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const navGroupDefinitions = useMemo(() => getNavGroupDefinitions(), []);
    
    const navGroups = useMemo(() => {
        const userRole = currentUser?.role || 'Labor'; // Default role if none is set
        return navGroupDefinitions
            .filter(group => {
                if (!group.requiredRoles) return true; // Accessible to all
                if (!currentUser) return false; // Hide if no user
                return group.requiredRoles.includes(userRole);
            })
            .map(group => ({
                ...group,
                label: t(group.labelKey as any),
                items: group.items.map(item => ({...item, label: t(item.id === 'crm' ? 'opportunities' : item.id as any)}))
            }));
    }, [t, navGroupDefinitions, currentUser]);
    
    const handleItemClick = (item: NavGroup['items'][0]) => {
        if (item.action?.type === 'modal') {
            openModal(item.action.id);
        } else {
            setCurrentView(item.id as ViewType);
        }
    };
    
    return (
        <div className="flex h-screen bg-transparent text-slate-800 dark:text-slate-200 font-sans">
            <nav className="w-64 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-300/30 dark:border-slate-700/30 flex flex-col">
                <div className="p-4 border-b border-slate-300/30 dark:border-slate-700/30 text-center">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">VertoTech</span>
                </div>
                <ul className="flex-grow p-2 space-y-1 overflow-y-auto">
                    {navGroups.map(group => (
                        <li key={group.id}>
                           <button 
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center justify-between p-3 text-left rounded-lg text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    {group.icon}
                                    <span className="font-bold">{group.label}</span>
                                </div>
                                <ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedGroups.includes(group.id) ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedGroups.includes(group.id) && (
                                <ul className="pl-4 mt-1 space-y-1">
                                    {group.items.map(item => (
                                         <li key={item.id}>
                                            <button
                                                onClick={() => handleItemClick(item)}
                                                className={`w-full flex items-center gap-3 text-left p-2 rounded-md transition-colors ${currentView === item.id ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                            >
                                                {item.icon}
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
                <div ref={langPopoverRef} className="relative p-4 border-t border-slate-300/30 dark:border-slate-700/30">
                    {isLangPopoverOpen && (
                         <div className="absolute bottom-full left-4 mb-2 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-slate-300/30 dark:border-slate-700/30 rounded-lg shadow-lg p-2 animate-popover">
                            <button onClick={() => { setLanguage('es'); setIsLangPopoverOpen(false); }} className={`w-full flex justify-between items-center p-2 rounded-md text-sm ${language === 'es' ? 'font-bold text-blue-600' : ''}`}>
                                Español {language === 'es' && <CheckIcon className="w-4 h-4" />}
                            </button>
                            <button onClick={() => { setLanguage('en'); setIsLangPopoverOpen(false); }} className={`w-full flex justify-between items-center p-2 rounded-md text-sm ${language === 'en' ? 'font-bold text-blue-600' : ''}`}>
                                English {language === 'en' && <CheckIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsLangPopoverOpen(prev => !prev)}
                        className="w-full flex items-center gap-3 text-left p-2 rounded-md font-semibold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <GlobeIcon className="w-5 h-5" />
                        <span>{language === 'es' ? 'Idioma' : 'Language'}</span>
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Header />
                    <AppRouter />
                </main>
            </div>
        </div>
    );
};