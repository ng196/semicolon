import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showOfflineMessage, setShowOfflineMessage] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowOfflineMessage(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineMessage(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showOfflineMessage) {
        return null;
    }

    return (
        <Card className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 p-3 shadow-lg border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        You're offline
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                        Some features may not be available
                    </p>
                </div>
            </div>
        </Card>
    );
}