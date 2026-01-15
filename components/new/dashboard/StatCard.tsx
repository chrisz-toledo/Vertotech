import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'sky' | 'indigo' | 'emerald';
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
        sky: 'bg-sky-100/80 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
        indigo: 'bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
        emerald: 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    };

    return (
        <button 
            onClick={onClick}
            disabled={!onClick}
            className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-xl border border-slate-300/30 dark:border-slate-700/30 shadow-lg flex items-center gap-6 text-left transition-all hover:shadow-2xl hover:-translate-y-1 disabled:cursor-default disabled:hover:shadow-lg disabled:hover:-translate-y-0"
        >
            <div className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                </div>
            </div>
        </button>
    );
}

export default StatCard;