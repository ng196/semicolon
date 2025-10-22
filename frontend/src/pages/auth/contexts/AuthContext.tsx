import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    avatar?: string;
    specialization: string;
    year: string;
    interests: string[];
    verified: boolean;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface SignupData {
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    // Extended onboarding data
    username?: string;
    name?: string;
    specialization?: string;
    year?: string;
    interests?: string[];
    avatar?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (userData: SignupData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    updateUser: (userData: Partial<User>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                setLoading(false);
                return;
            }

            // TODO: Validate token with backend
            // For now, check if token exists and is not expired
            const tokenData = parseJWT(token);
            if (tokenData && tokenData.exp * 1000 > Date.now()) {
                // Token is valid, fetch user data
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } else {
                // Token expired, clear storage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            setError(null);

            // Call real backend API
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
                throw new Error(errorData.error || 'Login failed');
            }

            const { token, user: userData } = await response.json();

            // Store token and user data
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(userData));

            setUser(userData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData: SignupData) => {
        try {
            setLoading(true);
            setError(null);

            // Create user with basic required fields only
            const signupData = {
                email: userData.email,
                password: userData.password,
                username: userData.username || userData.email.split('@')[0],
                name: userData.name || userData.username || userData.email.split('@')[0]
            };

            console.log('Attempting signup with:', signupData);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Signup failed:', response.status, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: `Signup failed: ${response.status}` };
                }
                throw new Error(errorData.error || 'Signup failed');
            }

            const { token, user: newUser } = await response.json();
            console.log('Signup successful:', newUser);

            // Store token and user data immediately
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(newUser));
            setUser(newUser);

            // Update profile with additional data in background (don't block signup)
            if (userData.specialization || userData.year || userData.interests?.length || userData.avatar) {
                const profileData = {
                    specialization: userData.specialization || '',
                    year: userData.year || '',
                    interests: userData.interests || [],
                    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || userData.email}`
                };

                console.log('Updating profile in background:', profileData);

                fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profileData),
                })
                    .then(async (profileResponse) => {
                        if (profileResponse.ok) {
                            const updatedUser = await profileResponse.json();
                            console.log('Profile updated successfully:', updatedUser);
                            localStorage.setItem('user_data', JSON.stringify(updatedUser));
                            setUser(updatedUser);
                        } else {
                            console.warn('Profile update failed:', profileResponse.status);
                        }
                    })
                    .catch((profileError) => {
                        console.error('Profile update error:', profileError);
                    });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Signup failed';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Clear all auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        setUser(null);
        setError(null);

        // Redirect to login
        window.location.href = '/auth/login';
    };

    const clearError = () => {
        setError(null);
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        clearError,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Utility functions
const parseJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

// Mock API functions (TODO: Replace with actual API calls)
const mockLoginAPI = async (credentials: LoginCredentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (credentials.email === 'test@campus.edu' && credentials.password === 'password123') {
        return {
            success: true,
            data: {
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                    id: 1,
                    email: credentials.email,
                    username: 'testuser',
                    name: 'Test User',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
                    specialization: 'Computer Science',
                    year: '3rd Year',
                    interests: ['Web Development', 'AI/ML'],
                    verified: true,
                    created_at: new Date().toISOString(),
                }
            }
        };
    } else {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }
};

const mockSignupAPI = async (userData: SignupData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (userData.email.includes('@')) {
        return {
            success: true,
            data: {
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                    id: Date.now(),
                    email: userData.email,
                    username: userData.email.split('@')[0],
                    name: userData.email.split('@')[0],
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
                    specialization: '',
                    year: '',
                    interests: [],
                    verified: false,
                    created_at: new Date().toISOString(),
                }
            }
        };
    } else {
        return {
            success: false,
            message: 'Invalid email address'
        };
    }
};