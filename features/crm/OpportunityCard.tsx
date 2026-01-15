import React, { useState } from 'react';
import type { Opportunity, Prospect } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OpportunityCardProps {
    opportunity: Opportunity;
    prospect?: Prospect;
    onOpen: (opportunity: Opportunity) => void;
    onDragStart: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, prospect, onOpen, onDragStart }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div 
            onClick={() => onOpen(opportunity)}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''}`}
        >
            <h4 className="font-bold text-gray-800 dark:text-gray-100">{opportunity.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{prospect?.name || 'Prospecto Desconocido'}</p>
            <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(opportunity.estimatedValue)}</p>
        </div>
    );
};