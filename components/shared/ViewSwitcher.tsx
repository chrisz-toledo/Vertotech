import React from 'react';
import { GridIcon } from '../icons/GridIcon';
import { ListIcon } from '../icons/ListIcon';

interface ViewSwitcherProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex items-center gap-1 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
            <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700'}`}
                title="Vista de Cuadrícula"
            >
                <GridIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700'}`}
                title="Vista de Lista"
            >
                <ListIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ViewSwitcher;