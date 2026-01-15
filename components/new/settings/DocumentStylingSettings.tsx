
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import type { DocumentSettings } from '../../../types';

const fonts = [
    { name: 'Figtree (Default)', value: "'Figtree', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Merriweather', value: "'Merriweather', serif" },
];

const DocumentStylingSettings: React.FC = () => {
    const { documentSettings, updateDocumentSettings } = useAppStore();
    const [settings, setSettings] = useState<DocumentSettings>(documentSettings);

    useEffect(() => {
        setSettings(documentSettings);
    }, [documentSettings]);

    const handleSave = () => {
        updateDocumentSettings(settings);
        alert("Document styles updated successfully!");
    };
    
    return (
        <div className="space-y-6">
            <div className="p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Appearance Customization</h3>
                
                <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium mb-1">Accent Color</label>
                    <input 
                        type="color" 
                        id="accentColor"
                        value={settings.accentColor}
                        onChange={(e) => setSettings(s => ({...s, accentColor: e.target.value}))}
                        className="w-full h-10 p-1 border rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Font Family</label>
                    <select
                        value={settings.fontFamily}
                        onChange={(e) => setSettings(s => ({...s, fontFamily: e.target.value}))}
                        className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                        {fonts.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Logo Position</label>
                    <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                        {(['left', 'center', 'right'] as const).map(pos => (
                             <button 
                                key={pos}
                                type="button"
                                onClick={() => setSettings(s => ({...s, logoPosition: pos}))}
                                className={`flex-1 p-2 rounded-md font-semibold text-sm capitalize ${settings.logoPosition === pos ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label htmlFor="showCompanyInfo" className="font-medium">Show Company Info in Header</label>
                    <input 
                        type="checkbox" 
                        id="showCompanyInfo"
                        checked={settings.showCompanyInfo}
                        onChange={(e) => setSettings(s => ({...s, showCompanyInfo: e.target.checked}))}
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                </div>
                
                <div className="text-right border-t pt-4 dark:border-gray-600">
                    <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg">Save Styles</button>
                </div>
            </div>
        </div>
    );
};

export default DocumentStylingSettings;
