import React, { useState } from 'react';
import type { Opportunity, Prospect, OpportunityStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { OpportunityCard } from './OpportunityCard';

interface KanbanColumnProps {
    status: OpportunityStatus;
    opportunities: Opportunity[];
    prospectMap: Map<string, Prospect>;
    onOpenOpportunity: (opportunity: Opportunity) => void;
    onDrop: (status: OpportunityStatus) => void;
    setDraggingOpportunityId: (id: string | null) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, opportunities, prospectMap, onOpenOpportunity, onDrop, setDraggingOpportunityId }) => {
    const { t } = useTranslation();
    const [isDragOver, setIsDragOver] = useState(false);

    const getColumnHeaderStyle = (status: OpportunityStatus) => {
        switch(status) {
            case 'lead': return 'border-t-gray-400';
            case 'contacted': return 'border-t-blue-400';
            case 'proposal_sent': return 'border-t-sky-400';
            case 'negotiation': return 'border-t-amber-400';
            case 'won': return 'border-t-emerald-400';
            case 'lost': return 'border-t-rose-400';
            default: return 'border-t-gray-400';
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrop(status);
        setIsDragOver(false);
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col w-72 flex-shrink-0 transition-colors ${isDragOver ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
        >
            <div className={`p-4 border-t-4 ${getColumnHeaderStyle(status)}`}>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-sm tracking-wider">
                    {t(status as any)} ({opportunities.length || 0})
                </h3>
            </div>
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                {opportunities.map(opp => (
                    <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        prospect={prospectMap.get(opp.prospectId)}
                        onOpen={onOpenOpportunity}
                        onDragStart={() => setDraggingOpportunityId(opp.id)}
                    />
                ))}
            </div>
        </div>
    );
};