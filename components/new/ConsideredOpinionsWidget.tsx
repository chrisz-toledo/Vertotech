

import React from 'react';
import type { ConsideredOpinion } from '../../types';
import { ClipboardCheckIcon } from '../icons/new/ClipboardCheckIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ConsideredOpinionsWidgetProps {
    opinions: ConsideredOpinion[];
    onRemoveOpinion: (id: string) => void;
}

export const ConsideredOpinionsWidget: React.FC<ConsideredOpinionsWidgetProps> = ({ opinions, onRemoveOpinion }) => {
    if (opinions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <ClipboardCheckIcon className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Opiniones Consideradas</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Aquí están los puntos de acción y consejos de Rachy que ha decidido seguir. Elimínelos a medida que los complete.
            </p>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {opinions.map(opinion => (
                    <li 
                        key={opinion.id} 
                        className="flex items-start justify-between gap-4 p-3 bg-emerald-50/70 dark:bg-emerald-900/50 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80"
                    >
                        <p className="text-emerald-800 dark:text-emerald-200">{opinion.text}</p>
                        <button 
                            onClick={() => onRemoveOpinion(opinion.id)}
                            title="Eliminar Opinión"
                            className="p-1.5 rounded-full text-emerald-500 hover:bg-emerald-200 hover:text-emerald-700 transition-colors flex-shrink-0"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};