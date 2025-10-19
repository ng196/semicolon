import { Suspense, lazy } from 'react';
import { AuthErrorBoundary } from './AuthErrorBoundary';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the actual forgot password form component
const ForgotPasswordForm = lazy(() => import('./components/ForgotPasswordForm'));

const ForgotPasswordPageSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6">
            <div className="space-y-4">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </Card>
    </div>
);

export default function ForgotPassword() {
    return (
        <AuthErrorBoundary>
            <Suspense fallback={<ForgotPasswordPageSkeleton />}>
                <ForgotPasswordForm />
            </Suspense>
        </AuthErrorBoundary>
    );
}