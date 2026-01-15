import React, { useMemo } from 'react';
import type { Subcontractor } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { GanttChartIcon } from '../icons/new/GanttChartIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

type ComplianceStatus = 'valid' | 'expiresSoon' | 'expired';

const getComplianceStatus = (sub: Subcontractor): ComplianceStatus => {
    if (!sub.documents || sub.documents.length === 0) return 'valid'; // Or a new status like 'missing'
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    let hasExpired = false;
    for (const doc of sub.documents) {
        if (doc.expirationDate) {
            const expiration = new Date(doc.expirationDate);
            if (expiration < today) {
                hasExpired = true;
                break;
            }
            if (expiration <= thirtyDaysFromNow) {
                return 'expiresSoon';
            }
        }
    }
    return hasExpired ? 'expired' : 'valid';
};


const StatusBadge: React.FC<{ status: ComplianceStatus, t: (key: any) => string }> = ({ status, t }) => {
    const styles = {
        valid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        expiresSoon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        expired: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{t(status)}</span>;
};

const SubcontractorCard: React.FC<{ sub: Subcontractor; onEdit: (sub: Subcontractor) => void; onDelete: (sub: Subcontractor) => void; }> = ({ sub, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const status = getComplianceStatus(sub);

    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700">
                <GanttChartIcon className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{sub.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{sub.trade}</p>
                    </div>
                    <StatusBadge status={status} t={t} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                     <p className="text-sm text-gray-600 dark:text-gray-300">Contacto: {sub.contactPerson}</p>
                     <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Teléfono:</span> {sub.phone}</p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Email:</span> {sub.email}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => onEdit(sub)} title="Editar" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(sub)} title="Eliminar" className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

interface SubcontractorListProps {
    subcontractors: Subcontractor[];
    onAdd: () => void;
    onEdit: (sub: Subcontractor) => void;
    onDelete: (sub: Subcontractor) => void;
}

const SubcontractorList: React.FC<SubcontractorListProps> = ({ subcontractors, onAdd, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const sortedSubs = useMemo(() =>
        [...subcontractors].sort((a, b) => a.name.localeCompare(b.name)),
    [subcontractors]);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('subcontractors')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    <GanttChartIcon className="w-5 h-5" />
                    <span>{t('addSubcontractor')}</span>
                </button>
            </div>

            {sortedSubs.length > 0 ? (
                <div className="space-y-6">
                    {sortedSubs.map(sub => <SubcontractorCard key={sub.id} sub={sub} onEdit={onEdit} onDelete={onDelete} />)}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <GanttChartIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay Subcontratistas</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Añada un nuevo subcontratista para empezar.</p>
                </div>
            )}
        </div>
    );
};

export default SubcontractorList;