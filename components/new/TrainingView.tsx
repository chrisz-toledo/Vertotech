import React from 'react';
import type { Employee, ComplianceDocument } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { CertificateIcon } from '../icons/new/CertificateIcon';
import { WandIcon } from '../icons/new/WandIcon';

interface TrainingViewProps {
    employees: Employee[];
    onOpenQuizGenerator: () => void;
}

const getCertificationStatus = (docs?: ComplianceDocument[]) => {
    if (!docs || docs.length === 0) return { text: 'Sin Certificaciones', color: 'gray' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let hasExpired = false;
    for (const doc of docs) {
        if (doc.type === 'certification' && doc.expirationDate) {
            const expiration = new Date(doc.expirationDate);
            if (expiration < today) {
                hasExpired = true;
                break;
            }
            if (expiration <= thirtyDaysFromNow) {
                return { text: 'Vence Pronto', color: 'amber' };
            }
        }
    }
    
    if (hasExpired) return { text: 'Expirado', color: 'rose' };
    return { text: 'Vigente', color: 'emerald' };
};

const EmployeeCertificationCard: React.FC<{ employee: Employee }> = ({ employee }) => {
    const status = getCertificationStatus(employee.documents);
    const colorClasses = {
        gray: 'bg-gray-100 text-gray-800',
        amber: 'bg-amber-100 text-amber-800',
        rose: 'bg-rose-100 text-rose-800',
        emerald: 'bg-emerald-100 text-emerald-800',
    };
    
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
                <p className="font-bold">{employee.name}</p>
                <p className="text-sm text-gray-500">{employee.job}</p>
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClasses[status.color]}`}>{status.text}</span>
        </div>
    );
};

const TrainingView: React.FC<TrainingViewProps> = ({ employees, onOpenQuizGenerator }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{t('training')}</h2>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800">Generador de Cuestionarios con IA</h3>
                <p className="text-sm text-gray-600 mt-1">Pegue el texto de un manual de seguridad o procedimiento para que la IA genere un cuestionario de capacitación.</p>
                <button onClick={onOpenQuizGenerator} className="mt-4 flex items-center gap-2 px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg shadow-sm hover:bg-violet-700">
                    <WandIcon className="w-5 h-5"/>
                    <span>{t('generateQuiz')}</span>
                </button>
            </div>
            
             <div>
                <h3 className="text-xl font-bold mb-4">Estado de Certificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map(employee => (
                        <EmployeeCertificationCard key={employee.id} employee={employee} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainingView;