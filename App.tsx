
import React, { useEffect } from 'react';

// Store Hooks
import { useAppStore } from './hooks/stores/useAppStore';
import { usePeopleStore } from './hooks/stores/usePeopleStore';

// UI Components
import { AIChatWidget } from './components/new/AIChatWidget';
import DetailsPeekPanel from './components/DetailsPeekPanel';
import { ModalRoot } from './components/ModalRoot';
import { Layout } from './components/Layout';
import FilterPanel from './components/shared/FilterPanel';

const App: React.FC = () => {
    const theme = useAppStore(state => state.theme);
    const currentUser = useAppStore(state => state.currentUser);
    const employees = usePeopleStore(state => state.employees);
    const documentSettings = useAppStore(state => state.documentSettings);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        // Set the initial current user if one isn't set and employees exist
        // This runs after stores have rehydrated from localStorage
        if (!currentUser && employees.length > 0) {
            useAppStore.setState({ currentUser: employees[0] });
        }
    }, [currentUser, employees]);

    useEffect(() => {
        const styleEl = document.getElementById('document-styles');
        if (styleEl) {
            const css = `
                :root {
                    --doc-accent-color: ${documentSettings.accentColor};
                    --doc-font-family: ${documentSettings.fontFamily};
                }
            `;
            styleEl.innerHTML = css;
        }
    }, [documentSettings]);
    
    return (
        <>
            <Layout />
            
            {/* Panels & Widgets that overlay the layout */}
            <DetailsPeekPanel />
            <AIChatWidget />
            <FilterPanel />

            {/* A single place to render all modals */}
            <ModalRoot />
        </>
    );
};

export default App;