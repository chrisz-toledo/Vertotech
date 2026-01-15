import React, { useState, useMemo } from 'react';
import type { Client, Employee, Document, Subcontractor, LegalDocument } from '../../types';
import { usePeopleStore } from '../../hooks/stores/usePeopleStore';
import { useOperationsStore } from '../../hooks/stores/useOperationsStore';
import { FolderIcon } from '../icons/new/FolderIcon';
import { BuildingIcon } from '../icons/BuildingIcon';
import { UserIcon } from '../icons/UserIcon';
import { FileIcon } from '../icons/new/FileIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { GanttChartIcon } from '../icons/new/GanttChartIcon';
import { ScaleIcon } from '../icons/new/ScaleIcon';

const downloadFile = (doc: Document | LegalDocument) => {
    // FIX: Standardized download to use objectUrl, which is present in Document and LegalDocument file types.
    if (doc.file.objectUrl) {
        const downloadLink = document.createElement("a");
        downloadLink.href = doc.file.objectUrl;
        downloadLink.download = doc.name;
        downloadLink.click();
    }
}

const DocumentRow: React.FC<{ doc: Document | LegalDocument, ownerName: string, uploadedAt: string }> = ({ doc, ownerName, uploadedAt }) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500">
        <div className="flex items-center gap-4 truncate">
            <FileIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="truncate">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{doc.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subido el {new Date(uploadedAt).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
             <p className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">{ownerName}</p>
             <button
                onClick={() => downloadFile(doc)}
                title="Descargar Documento"
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
             >
                <DownloadIcon className="w-5 h-5" />
             </button>
        </div>
    </div>
);


const DocumentHub: React.FC = () => {
    const peopleStore = usePeopleStore();
    const operationsStore = useOperationsStore();
    const { employees, clients, subcontractors } = peopleStore;
    const { legalDocuments } = operationsStore;

    const [searchQuery, setSearchQuery] = useState('');

    const allDocuments = useMemo(() => {
        const docs: { doc: Document | LegalDocument; ownerName: string; ownerType: 'client' | 'employee' | 'subcontractor' | 'legal'; uploadedAt: string }[] = [];

        clients.forEach(client => {
            client.documents?.forEach(doc => {
                docs.push({ doc, ownerName: client.name, ownerType: 'client', uploadedAt: doc.uploadedAt });
            });
        });

        employees.forEach(employee => {
            employee.documents?.forEach(doc => {
                docs.push({ doc, ownerName: employee.name, ownerType: 'employee', uploadedAt: doc.uploadedAt });
            });
        });

        subcontractors.forEach(sub => {
            sub.documents?.forEach(doc => {
                docs.push({ doc, ownerName: sub.name, ownerType: 'subcontractor', uploadedAt: doc.uploadedAt });
            });
        });
        
        legalDocuments.forEach(doc => {
            docs.push({ doc, ownerName: 'Documento de Compañía', ownerType: 'legal', uploadedAt: doc.createdAt });
        });

        return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }, [clients, employees, subcontractors, legalDocuments]);

    const filteredDocuments = useMemo(() => {
        if (!searchQuery) return allDocuments;
        return allDocuments.filter(item => 
            item.doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allDocuments, searchQuery]);

    const clientDocuments = filteredDocuments.filter(d => d.ownerType === 'client');
    const employeeDocuments = filteredDocuments.filter(d => d.ownerType === 'employee');
    const subcontractorDocuments = filteredDocuments.filter(d => d.ownerType === 'subcontractor');
    const companyLegalDocuments = filteredDocuments.filter(d => d.ownerType === 'legal');

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Centro de Documentos</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                    Un lugar central para ver todos los documentos de la compañía, clientes, empleados y subcontratistas.
                </p>
            </div>

            <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input 
                    type="text" 
                    placeholder="Buscar documentos o propietarios..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-96 pl-11 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            {filteredDocuments.length > 0 ? (
                 <div className="space-y-6">
                    {companyLegalDocuments.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4"><ScaleIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" /><h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Documentos Legales</h3></div>
                            <div className="space-y-3">{companyLegalDocuments.map(item => <DocumentRow key={item.doc.id} doc={item.doc} ownerName={item.ownerName} uploadedAt={item.uploadedAt} />)}</div>
                        </div>
                    )}
                    {clientDocuments.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4"><BuildingIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" /><h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Documentos de Clientes</h3></div>
                            <div className="space-y-3">{clientDocuments.map(item => <DocumentRow key={item.doc.id} doc={item.doc} ownerName={item.ownerName} uploadedAt={item.uploadedAt} />)}</div>
                        </div>
                    )}
                    {employeeDocuments.length > 0 && (
                         <div>
                            <div className="flex items-center gap-3 mb-4"><UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /><h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Documentos de Empleados</h3></div>
                            <div className="space-y-3">{employeeDocuments.map(item => <DocumentRow key={item.doc.id} doc={item.doc} ownerName={item.ownerName} uploadedAt={item.uploadedAt} />)}</div>
                        </div>
                    )}
                     {subcontractorDocuments.length > 0 && (
                         <div>
                            <div className="flex items-center gap-3 mb-4"><GanttChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" /><h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Documentos de Subcontratistas</h3></div>
                            <div className="space-y-3">{subcontractorDocuments.map(item => <DocumentRow key={item.doc.id} doc={item.doc} ownerName={item.ownerName} uploadedAt={item.uploadedAt} />)}</div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <FolderIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">No se encontraron documentos</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {searchQuery ? "Pruebe con otra búsqueda." : "Adjunte documentos para verlos aquí."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DocumentHub;