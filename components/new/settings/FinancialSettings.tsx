import React, { useState } from 'react';
import { useAppStore } from '../../../hooks/stores/useAppStore';
import { useTranslation } from '../../../hooks/useTranslation';
import type { FinancialSettings as FinancialSettingsType } from '../../../types';
import { PercentageIcon } from '../../icons/PercentageIcon';
import { PrinterIcon } from '../../icons/new/PrinterIcon';
import { InvoiceIcon } from '../../icons/new/InvoiceIcon';
import { BuildingIcon } from '../../icons/BuildingIcon';
import { LocationMarkerIcon } from '../../icons/LocationMarkerIcon';
import { HashIcon } from '../../icons/new/HashIcon';

const InputField: React.FC<{id: string, name: string, label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, icon: React.ReactNode, placeholder?: string, type?: string, step?: string}> = ({ id, label, icon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">{icon}</span>
            <input id={id} {...props} className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
    </div>
);

const FinancialSettings: React.FC = () => {
    const { t } = useTranslation();
    const { financialSettings: initialSettings, updateFinancialSettings } = useAppStore();
    const [settings, setSettings] = useState<FinancialSettingsType>(initialSettings);
    
    const handleSave = () => {
        updateFinancialSettings(settings);
        alert("Financial settings saved.");
    };

    const handlePayrollChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(p => ({...p, payrollSettings: {...p.payrollSettings, [name]: name === 'overtimeThresholdHours' ? parseInt(value) : value }}));
    };

    const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(p => ({...p, invoiceSettings: {...p.invoiceSettings, [name]: value }}));
    };

    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(p => ({...p, checkPrintingSettings: {...p.checkPrintingSettings, [name]: value }}));
    };

    return (
        <div className="space-y-6">
            <div className="p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <InputField id="defaultTaxRate" name="defaultTaxRate" label="Default Tax Rate (%)" value={settings.defaultTaxRate} onChange={e => setSettings(p => ({...p, defaultTaxRate: parseFloat(e.target.value) || 0}))} icon={<PercentageIcon className="w-5 h-5" />} type="number" step="0.01" />
            </div>

            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2"><PrinterIcon className="w-5 h-5"/>{t('payrollSettings')}</h3>
                <div>
                    <label className="block text-sm font-medium mb-1">{t('payPeriod')}</label>
                    <select name="payPeriod" value={settings.payrollSettings.payPeriod} onChange={handlePayrollChange} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                        <option value="weekly">{t('weekly')}</option>
                        <option value="bi-weekly">{t('bi-weekly')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">{t('overtimeThreshold')} (Hours)</label>
                    <input type="number" name="overtimeThresholdHours" value={settings.payrollSettings.overtimeThresholdHours} onChange={handlePayrollChange} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                </div>
            </div>

            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2"><InvoiceIcon className="w-5 h-5"/>{t('invoicingSettings')}</h3>
                <div><label className="block text-sm font-medium mb-1">{t('invoicePrefix')}</label><input type="text" name="invoicePrefix" value={settings.invoiceSettings.invoicePrefix} onChange={handleInvoiceChange} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"/></div>
                <div><label className="block text-sm font-medium mb-1">{t('defaultPaymentTerms')}</label><input type="text" name="defaultTerms" value={settings.invoiceSettings.defaultTerms} onChange={handleInvoiceChange} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"/></div>
                <div><label className="block text-sm font-medium mb-1">{t('defaultInvoiceNotes')}</label><textarea name="defaultNotes" value={settings.invoiceSettings.defaultNotes} onChange={handleInvoiceChange} rows={3} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"></textarea></div>
            </div>

            <div className="space-y-4 p-5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2"><PrinterIcon className="w-5 h-5"/>Check Printing Settings</h3>
                <InputField id="bankName" name="bankName" label="Bank Name" value={settings.checkPrintingSettings.bankName} onChange={handleCheckChange} icon={<BuildingIcon className="w-5 h-5"/>}/>
                <InputField id="bankAddress" name="bankAddress" label="Bank Address" value={settings.checkPrintingSettings.bankAddress} onChange={handleCheckChange} icon={<LocationMarkerIcon className="w-5 h-5"/>}/>
                <InputField id="accountNumber" name="accountNumber" label="Account Number" value={settings.checkPrintingSettings.accountNumber} onChange={handleCheckChange} icon={<HashIcon className="w-5 h-5"/>}/>
                <InputField id="routingNumber" name="routingNumber" label="Routing Number" value={settings.checkPrintingSettings.routingNumber} onChange={handleCheckChange} icon={<HashIcon className="w-5 h-5"/>}/>
            </div>
            
             <div className="text-right pt-4">
                <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg">Save Financial Settings</button>
            </div>
        </div>
    );
};

export default FinancialSettings;