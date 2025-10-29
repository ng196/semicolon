// Re-export useAuth from AuthContext
export { useAuth } from '../contexts/AuthContext';

import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Hook to check if user is authenticated
 * Returns boolean for simple authentication checks
 */
export const useIsAuthenticated = (): boolean => {
    const { isAuthenticated } = useAuthContext();
    return isAuthenticated;
};

/**
 * Hook to get current user data
 * Returns user object or null if not authenticated
 */
export const useCurrentUser = () => {
    const { user } = useAuthContext();
    return user;
};

/**
 * Hook for authentication loading state
 * Useful for showing loading spinners during auth operations
 */
export const useAuthLoading = (): boolean => {
    const { loading } = useAuthContext();
    return loading;
};

/**
 * Hook for authentication errors
 * Returns current error and method to clear it
 */
export const useAuthError = () => {
    const { error, clearError } = useAuthContext();
    return { error, clearError };
};