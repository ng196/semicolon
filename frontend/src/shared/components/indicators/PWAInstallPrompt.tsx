import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the prompt in this session
        const hasSeenPrompt = sessionStorage.getItem('pwa-install-prompt-seen');
        const hasDismissed = sessionStorage.getItem('pwa-install-prompt-dismissed');

        const handler = (e: Event) => {
            e.preventDefault();

            // Only show if user hasn't seen it this session and hasn't dismissed it
            if (!hasSeenPrompt && !hasDismissed) {
                setDeferredPrompt(e as BeforeInstallPromptEvent);
                setShowPrompt(true);
                sessionStorage.setItem('pwa-install-prompt-seen', 'true');
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
        // Remember that user dismissed it for this session
        sessionStorage.setItem('pwa-install-prompt-dismissed', 'true');
    };

    if (!showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 p-4 shadow-lg border-primary/20 bg-card/95 backdrop-blur">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">Install CampusHub</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Add to your home screen for quick access and offline use
                    </p>
                    <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={handleInstall} className="flex-1 sm:flex-none">
                            <Download className="h-4 w-4 mr-1" />
                            Install
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleDismiss}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}