import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard component - Protects routes that require authentication
 * Redirects unauthenticated users to login page
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the attempted location so we can redirect back after login
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
};

/**
 * GuestGuard component - Redirects authenticated users away from auth pages
 * Used for login/signup pages to prevent authenticated users from accessing them
 */
export const GuestGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // User is not authenticated, show auth pages
    return <>{children}</>;
};