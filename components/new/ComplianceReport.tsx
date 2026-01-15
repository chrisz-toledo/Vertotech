import React from 'react';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useAppStore } from '../../hooks/stores/useAppStore';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UserIcon } from '../icons/UserIcon';
import { GanttChartIcon } from '../icons/new/GanttChartIcon';
import type { ComplianceDocument, Employee, Subcontractor, Alert } from '../../types';
import { AlertCircleIcon } from '../icons/new/AlertCircleIcon';
import { FileIcon } from '../icons/new/FileIcon';

type ComplianceStatus = 'valid' | 'expiresSoon' | 'expired';

const getComplianceStatus = (doc: ComplianceDocument): ComplianceStatus => {
    if (!doc.expirationDate) return 'valid';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(doc.expirationDate + 'T00:00:00Z');
    if (expiration < today) return 'expired';
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    if (expiration <= thirtyDaysFromNow) return 'expiresSoon';

    return 'valid';
};

const StatusBadge: React.FC<{ status: ComplianceStatus }> = ({ status }) => {
    const styles = {
        valid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        expiresSoon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        expired: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    };
    const text = {
        valid: 'Vigente',
        expiresSoon: 'Vence Pronto',
        expired: 'Vencido',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
    const severityClasses = {
        info: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700 text-sky-800 dark:text-sky-200',
        warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300',
        critical: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700 text-rose-800 dark:text-rose-300',
    };
    const iconColor = {
        info: 'text-sky-500',
        warning: 'text-amber-500',
        critical: 'text-rose-500',
    }

    return (
        <div className={`p-3 rounded-lg border flex items-start gap-3 ${severityClasses[alert.severity]}`}>
            <AlertCircleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor[alert.severity]}`} />
            <p className="text-sm">{alert.message}</p>
        </div>
    );
};

const DocumentRow: React.FC<{ doc: ComplianceDocument }> = ({ doc }) => {
    const status = getComplianceStatus(doc);
    return (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
                <FileIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{doc.name}</span>
            </div>
            <StatusBadge status={status} />
        </div>
    );
};


const ComplianceReport: React.FC = () => {
    const { employees, subcontractors } = usePeopleStore();
    const { alerts, isAlertsLoading, generateComplianceAlerts } = useAppStore();
    const complianceAlerts = alerts.filter(a => a.type === 'compliance');

    return (
        <div className="space-y-8">
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                Analice todos los documentos de cumplimiento de sus empleados y subcontratistas para identificar proactivamente los riesgos, como documentos vencidos o que vencerán pronto.
            </p>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Análisis de Cumplimiento de Documentos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">La IA verificará las fechas de vencimiento y los documentos requeridos.</p>
                    </div>
                    <button onClick={generateComplianceAlerts} disabled={isAlertsLoading} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700 transition-colors disabled:bg-violet-400">
                        <SparklesIcon className={`w-5 h-5 ${isAlertsLoading ? 'animate-spin' : ''}`} />
                        <span>{isAlertsLoading ? 'Analizando...' : 'Analizar Todos los Documentos'}</span>
                    </button>
                </div>
            </div>
            
            {complianceAlerts.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4">Problemas de Cumplimiento Encontrados</h3>
                    <div className="space-y-3">
                        {complianceAlerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
                    </div>
                </div>
            )}
            
            <div className="space-y-6">
                 <div>
                    <h4 className="font-bold text-lg flex items-center gap-2 mb-3 text-gray-800 dark:text-gray-100"><UserIcon className="w-5 h-5" /> Empleados</h4>
                    <div className="space-y-3">
                        {employees.map(e => (
                            <div key={e.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <p className="font-semibold text-gray-700 dark:text-gray-200">{e.name}</p>
                                <div className="mt-2 space-y-2">
                                    {(e.documents || []).length > 0 ? e.documents?.map(doc => <DocumentRow key={doc.id} doc={doc} />) : <p className="text-xs text-gray-500">Sin documentos.</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold text-lg flex items-center gap-2 mb-3 text-gray-800 dark:text-gray-100"><GanttChartIcon className="w-5 h-5" /> Subcontratistas</h4>
                    <div className="space-y-3">
                        {subcontractors.map(s => (
                            <div key={s.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <p className="font-semibold text-gray-700 dark:text-gray-200">{s.name}</p>
                                <div className="mt-2 space-y-2">
                                    {(s.documents || []).length > 0 ? s.documents?.map(doc => <DocumentRow key={doc.id} doc={doc} />) : <p className="text-xs text-gray-500">Sin documentos.</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceReport;