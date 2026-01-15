import React, { useState, useRef } from 'react';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import { useTranslation } from '../../../hooks/useTranslation';
import type { CompanyInfo } from '../../../types';

import { BuildingIcon } from '../../icons/BuildingIcon';
import { LocationMarkerIcon } from '../../icons/LocationMarkerIcon';
import { PhoneIcon } from '../../icons/PhoneIcon';
import { IdCardIcon } from '../../icons/IdCardIcon';
import { ImageIcon } from '../../icons/ImageIcon';
import { SunIcon } from '../../icons/new/SunIcon';
import { MoonIcon } from '../../icons/new/MoonIcon';

const InputField: React.FC<{id: string, name: string, label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, icon: React.ReactNode, placeholder?: string, type?: string}> = ({ id, label, icon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">{icon}</span>
            <input id={id} {...props} className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
    </div>
);

const PersonalizationSettings: React.FC = () => {
    const { t } = useTranslation();
    const appStore = useAppStore();
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(appStore.companyInfo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInfoSave = () => {
        appStore.updateCompanyInfo(companyInfo);
        alert("Company information saved.");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                if (loadEvent.target?.result && typeof loadEvent.target.result === 'string') {
                    setCompanyInfo(p => ({ ...p, logoUrl: loadEvent.target.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold">{t('companyInformation')}</h3>
                <InputField id="companyName" name="name" label="Name" value={companyInfo.name} onChange={e => setCompanyInfo(p => ({...p, name: e.target.value}))} icon={<BuildingIcon className="w-5 h-5" />} />
                <InputField id="companyAddress" name="address" label="Address" value={companyInfo.address || ''} onChange={e => setCompanyInfo(p => ({...p, address: e.target.value}))} icon={<LocationMarkerIcon className="w-5 h-5" />} />
                <InputField id="companyPhone" name="phone" label="Phone" value={companyInfo.phone || ''} onChange={e => setCompanyInfo(p => ({...p, phone: e.target.value}))} icon={<PhoneIcon className="w-5 h-5" />} />
                <InputField id="companyTaxId" name="taxId" label="Tax ID" value={companyInfo.taxId || ''} onChange={e => setCompanyInfo(p => ({...p, taxId: e.target.value}))} icon={<IdCardIcon className="w-5 h-5" />} />
                <div>
                    <label className="block text-sm font-medium mb-1">Logo</label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                            <span className="absolute left-3.5 top-3.5 text-gray-400"><ImageIcon className="w-5 h-5" /></span>
                            <input name="logoUrl" value={companyInfo.logoUrl || ''} onChange={e => setCompanyInfo(p => ({...p, logoUrl: e.target.value}))} className="w-full pl-11 py-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="https://... or upload a file"/>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">Upload</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                    </div>
                </div>
                <div className="text-right border-t pt-4 dark:border-gray-600">
                    <button onClick={handleInfoSave} className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg">Save Information</button>
                </div>
            </div>

            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border rounded-lg">
                <h3 className="text-lg font-semibold">{t('appearance')}</h3>
                <div className="flex items-center justify-between">
                    <label className="font-medium">Theme</label>
                    <button onClick={appStore.toggleTheme} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full bg-gray-200 dark:bg-gray-600">
                        {appStore.theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                        <span>{appStore.theme === 'light' ? 'Dark' : 'Light'}</span>
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label className="font-medium">Language</label>
                    <select value={appStore.language} onChange={e => appStore.setLanguage(e.target.value as any)} className="p-1.5 text-sm font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white">
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PersonalizationSettings;