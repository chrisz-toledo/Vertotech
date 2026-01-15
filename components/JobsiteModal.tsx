import React from 'react';
import { JobsiteModal as NewJobsiteModal } from './new/JobsiteModal';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { useAppStore } from '../../hooks/stores/useAppStore';

// This component is now a wrapper for the new JobsiteModal
// It ensures that any old references to this component still work while we transition.
// The actual logic is now in components/new/JobsiteModal.tsx

interface JobsiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingJobsite: any | null;
    prefillData?: { clientId: string } | null;
}

export const JobsiteModal: React.FC<JobsiteModalProps> = (props) => {
    
    // Although the props are passed down, the new modal gets its data directly from the stores.
    // This is just to maintain the component signature.
    
    return (
        <NewJobsiteModal 
            isOpen={props.isOpen}
            onClose={props.onClose}
            editingJobsite={props.editingJobsite}
            prefillData={props.prefillData}
        />
    );
};
