import React, { useMemo } from 'react';
import type { Opportunity, Prospect, OpportunityStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency } from '../../utils/formatters';

interface OpportunityCardProps {
    opportunity: Opportunity;
    prospect?: Prospect;
    onOpen: (opportunity: Opportunity) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, prospect, onOpen }) => {
    return (
        <div 
            onClick={() => onOpen(opportunity)}
            className="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all"
        >
            <h4 className="font-bold text-gray-800 dark:text-gray-100">{opportunity.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{prospect?.name || 'Prospecto Desconocido'}</p>
            <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(opportunity.estimatedValue)}</p>
        </div>
    );
};

interface CRMViewProps {
    opportunities: Opportunity[];
    prospects: Prospect[];
    onOpenOpportunity: (opportunity: Opportunity) => void;
}

const CRMView: React.FC<CRMViewProps> = ({ opportunities, prospects, onOpenOpportunity }) => {
    const { t } = useTranslation();
    const prospectMap = useMemo(() => new Map(prospects.map(p => [p.id, p])), [prospects]);

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
    
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('opportunities')}</h2>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 overflow-x-auto pb-4">
                {columns.map(status => (
                    <div key={status} className="bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col w-72 flex-shrink-0">
                        <div className={`p-4 border-t-4 ${getColumnHeaderStyle(status)}`}>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-sm tracking-wider">
                                {t(status as any)} ({opportunitiesByStatus.get(status)?.length || 0})
                            </h3>
                        </div>
                        <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                            {opportunitiesByStatus.get(status)?.map(opp => (
                                <OpportunityCard
                                    key={opp.id}
                                    opportunity={opp}
                                    prospect={prospectMap.get(opp.prospectId)}
                                    onOpen={onOpenOpportunity}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CRMView;