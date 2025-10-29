import { Suspense, lazy } from 'react';
import { AuthErrorBoundary } from './AuthErrorBoundary';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

// Lazy load the actual login form component
const LoginForm = lazy(() => import('../components/LoginForm'));

const LoginPageSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6">
            <div className="space-y-4">
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </Card>
    </div>
);

export default function Login() {
    return (
        <AuthErrorBoundary>
            <Suspense fallback={<LoginPageSkeleton />}>
                <LoginForm />
            </Suspense>
        </AuthErrorBoundary>
    );
}