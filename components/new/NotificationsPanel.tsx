import React from 'react';
import type { Notification } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { BellIcon } from '../icons/new/BellIcon';
import { CheckCircleIcon } from '../icons/new/CheckCircleIcon';

interface NotificationsPanelProps {
    notifications: Notification[];
    onClose: () => void;
    onUpdateNotifications: (notifications: Notification[]) => void;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const iconColor = {
        info: 'text-blue-500',
        success: 'text-emerald-500',
        warning: 'text-amber-500',
    };
    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <CheckCircleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor[notification.type]}`} />
            <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
        </div>
    );
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onUpdateNotifications }) => {
    const { t } = useTranslation();
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleMarkAllRead = () => {
        onUpdateNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col max-h-[60vh]">
            <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('notifications')}</h3>
                <button onClick={handleMarkAllRead} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {t('markAllRead')}
                </button>
            </header>
            <main className="flex-grow overflow-y-auto">
                {sortedNotifications.length > 0 ? (
                    <div className="p-2 space-y-1">
                        {sortedNotifications.map(n => (
                            <NotificationItem key={n.id} notification={n} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <BellIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 text-sm">{t('noNotifications')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationsPanel;
