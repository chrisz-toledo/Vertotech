import React, { useMemo, useState } from 'react';
import type { Opportunity, Prospect, OpportunityStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useCrmStore } from '../../hooks/stores/useCrmStore';
import { KanbanColumn } from './KanbanColumn';

interface CRMViewProps {
    opportunities: Opportunity[];
    prospects: Prospect[];
    onOpenOpportunity: (opportunity: Opportunity) => void;
}

const CRMView: React.FC<CRMViewProps> = ({ opportunities, prospects, onOpenOpportunity }) => {
    const { t } = useTranslation();
    const prospectMap = useMemo(() => new Map(prospects.map(p => [p.id, p])), [prospects]);
    const { saveOpportunity } = useCrmStore();
    const [draggingOpportunityId, setDraggingOpportunityId] = useState<string | null>(null);

    const columns: OpportunityStatus[] = ['lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost'];
    
    const opportunitiesByStatus = useMemo(() => {
        const grouped = new Map<OpportunityStatus, Opportunity[]>();
        columns.forEach(status => grouped.set(status, []));
        opportunities.forEach(opp => {
            if (grouped.has(opp.status)) {
                grouped.get(opp.status)!.push(opp);
            }
        });
        return grouped;
    }, [opportunities]);

    const handleDrop = (newStatus: OpportunityStatus) => {
        if (draggingOpportunityId) {
            const opportunity = opportunities.find(opp => opp.id === draggingOpportunityId);
            if (opportunity && opportunity.status !== newStatus) {
                saveOpportunity({ ...opportunity, status: newStatus }, opportunity.id);
            }
        }
        setDraggingOpportunityId(null);
    };
    
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('opportunities')}</h2>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 overflow-x-auto pb-4">
                {columns.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        opportunities={opportunitiesByStatus.get(status) || []}
                        prospectMap={prospectMap}
                        onOpenOpportunity={onOpenOpportunity}
                        onDrop={handleDrop}
                        setDraggingOpportunityId={setDraggingOpportunityId}
                    />
                ))}
            </div>
        </div>
    );
};

export default CRMView;