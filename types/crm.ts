export interface Prospect {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  source?: string; // e.g., 'Referral', 'Website', 'Cold Call'
  createdAt: string;
  deletedAt?: string;
}

export type OpportunityStatus = 'lead' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export interface CommunicationLog {
  id: string;
  date: string; // ISO String
  type: 'call' | 'email' | 'meeting' | 'text';
  notes: string;
}

export interface Opportunity {
  id: string;
  title: string;
  prospectId: string;
  estimatedValue: number;
  status: OpportunityStatus;
  source?: string;
  communicationLogs: CommunicationLog[];
  createdAt: string;
  deletedAt?: string;
}
