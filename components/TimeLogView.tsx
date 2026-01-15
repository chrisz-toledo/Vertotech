import React from 'react';
import { ClockIcon } from './icons/ClockIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { useModalManager } from '../hooks/useModalManager';
import { useTranslation } from '../hooks/useTranslation';

const TimeLogView: React.FC = () => {
    const { open: openModal } = useModalManager();
    const { t } = useTranslation();

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Control de Horas</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Elija un método para registrar el tiempo de sus empleados. Puede registrar las horas semanales manualmente o utilizar el escáner QR para un check-in y check-out en tiempo real.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Manual Time Log Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full border-4 border-white dark:border-gray-800 shadow-md mb-6">
                        <ClockIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Registro Manual Semanal</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                        Ideal para gerentes que necesitan ingresar o ajustar las horas de toda la semana para múltiples empleados a la vez.
                    </p>
                    <button
                        onClick={() => openModal('timeLog')}
                        className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ClockIcon className="w-5 h-5" />
                        <span>Registrar Horas</span>
                    </button>
                </div>

                {/* QR Code Scanner Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                    <div className="bg-teal-100 dark:bg-teal-900/30 p-4 rounded-full border-4 border-white dark:border-gray-800 shadow-md mb-6">
                        <QrCodeIcon className="w-12 h-12 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Check-in con QR</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                        Perfecto para registrar la entrada y salida de los empleados en tiempo real en el lugar de trabajo usando la cámara de un dispositivo.
                    </p>
                    <button
                        onClick={() => openModal('qrScanner')}
                        className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <QrCodeIcon className="w-5 h-5" />
                        <span>Abrir Escáner QR</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TimeLogView;