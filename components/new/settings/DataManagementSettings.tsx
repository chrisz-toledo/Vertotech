import React, { useRef } from 'react';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { AlertTriangleIcon } from '../../icons/AlertTriangleIcon';
import { DatabaseIcon } from '../../icons/new/DatabaseIcon';

const DataManagementSettings: React.FC = () => {
    const { t } = useTranslation();
    const { exportData, importData, loadDemoData, confirm, resetData } = useAppStore();
    const importFileRef = useRef<HTMLInputElement>(null);

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importData(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold">Import & Export</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p>Export a backup of all your data.</p>
                    <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg">
                        <DatabaseIcon className="w-4 h-4"/>Export
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p>Import from a backup file.</p>
                    <input type="file" ref={importFileRef} onChange={handleFileImport} className="hidden" accept=".json,.zip"/>
                    <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg">
                        <DatabaseIcon className="w-4 h-4"/>Import
                    </button>
                </div>
            </div>

            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold">Demo Data</h3>
                <div className="flex items-center justify-between">
                    <p>Fill the application with sample data.</p>
                    <button 
                        onClick={() => confirm({ title: 'Load Demo Data', message: 'This will add sample data without deleting existing data. Continue?', onConfirm: loadDemoData })} 
                        className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                    >
                        Load Demo
                    </button>
                </div>
            </div>

            <div className="space-y-4 p-5 bg-rose-50 dark:bg-rose-900/20 border-2 border-dashed border-rose-300 dark:border-rose-700 rounded-lg">
                <div className="flex items-center gap-3">
                    <AlertTriangleIcon className="w-6 h-6 text-rose-500"/>
                    <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300">{t('dangerZone')}</h3>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Reset Data</p>
                        <p className="text-sm">This action is irreversible.</p>
                    </div>
                    <button 
                        onClick={() => confirm({title: 'Reset Data', message: 'Are you sure? This will delete ALL data.', onConfirm: resetData})} 
                        className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataManagementSettings;