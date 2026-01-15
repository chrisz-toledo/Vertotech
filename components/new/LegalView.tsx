
import React from 'react';
import type { LegalDocument } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { ScaleIcon } from '../icons/new/ScaleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { DownloadIcon } from '../icons/DownloadIcon';

interface LegalViewProps {
    documents: LegalDocument[];
    onAdd: () => void;
    onEdit: (doc: LegalDocument) => void;
    onDelete: (doc: LegalDocument) => void;
}

type DocumentStatus = 'active' | 'expiring_soon' | 'expired';

const getStatus = (doc: LegalDocument): DocumentStatus => {
    if (!doc.expirationDate) return 'active';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(doc.expirationDate);
    if (expiration < today) return 'expired';
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    if (expiration <= thirtyDaysFromNow) return 'expiring_soon';
    return 'active';
};

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
    const info = {
        active: { text: 'Active', className: 'bg-emerald-100 text-emerald-800' },
        expiring_soon: { text: 'Expiring Soon', className: 'bg-amber-100 text-amber-800' },
        expired: { text: 'Expired', className: 'bg-rose-100 text-rose-800' },
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${info[status].className}`}>{info[status].text}</span>;
};

const LegalDocumentCard: React.FC<{ doc: LegalDocument, onEdit: (d: LegalDocument) => void, onDelete: (d: LegalDocument) => void }> = ({ doc, onEdit, onDelete }) => {
    const status = getStatus(doc);
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{doc.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Issued by: {doc.issuer}</p>
                </div>
                <StatusBadge status={status} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expires: {doc.expirationDate ? new Date(doc.expirationDate + 'T00:00:00').toLocaleDateString('en-US') : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* FIX: Use objectUrl for the href attribute instead of constructing a data URL with the non-existent 'data' property. */}
                    <a href={doc.file.objectUrl} download={doc.name} title="Download" className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"><DownloadIcon className="w-5 h-5" /></a>
                    <button onClick={() => onEdit(doc)} title="Edit" className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(doc)} title="Delete" className="p-2 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
};

const LegalView: React.FC<LegalViewProps> = ({ documents, onAdd, onEdit, onDelete }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('legal')}</h2>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover">
                    <ScaleIcon className="w-5 h-5" />
                    <span>{t('addLegalDocument')}</span>
                </button>
            </div>

            {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <LegalDocumentCard key={doc.id} doc={doc} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <ScaleIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No Legal Documents Found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Add a new document to start managing your company's legal information.</p>
                </div>
            )}
        </div>
    );
};

export default LegalView;