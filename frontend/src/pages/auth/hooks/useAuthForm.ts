import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import type { LoginCredentials, SignupData } from '../contexts/AuthContext';

// Login form schema
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean().default(false),
});

// Signup form schema
const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(1, 'Password is required'),
    // Commented out for testing - add back later
    // .min(8, 'Password must be at least 8 characters')
    // .regex(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    //     'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    // ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Forgot password schema
const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

/**
 * Hook for login form management
 * Handles form state, validation, and submission
 */
export const useLoginForm = () => {
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'test@campus.edu',
            password: 'password123',
            remember: false,
        },
    });

    const onSubmit = async (data: LoginCredentials) => {
        setIsSubmitting(true);
        try {
            await login(data);
            toast.success('Login successful!', {
                duration: 2000,
                position: 'top-right',
            });
            // Redirect will be handled by the auth context
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';

            // Show toast notification
            toast.error(errorMessage, {
                duration: 2000,
                position: 'top-right',
            });

            // Also set form error
            form.setError('root', {
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting,
    };
};

/**
 * Hook for signup form management
 * Handles form state, validation, and submission
 */
export const useSignupForm = () => {
    const { signup } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SignupData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
        },
    });

    const onSubmit = async (data: SignupData) => {
        setIsSubmitting(true);
        try {
            await signup(data);
            toast.success('Account created successfully!', {
                duration: 2000,
                position: 'top-right',
            });
            // Redirect to onboarding will be handled after successful signup
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Signup failed';

            // Show toast notification
            toast.error(errorMessage, {
                duration: 2000,
                position: 'top-right',
            });

            // Also set form error
            form.setError('root', {
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting,
    };
};

/**
 * Hook for forgot password form management
 */
export const useForgotPasswordForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<{ email: string }>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: { email: string }) => {
        setIsSubmitting(true);
        try {
            // TODO: Implement actual forgot password API call
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            setIsSubmitted(true);
        } catch (error) {
            form.setError('root', {
                message: 'Failed to send reset email. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsSubmitted(false);
        form.reset();
    };

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting,
        isSubmitted,
        resetForm,
    };
};

/**
 * Hook for password visibility toggle
 * Manages show/hide state for password fields
 */
export const usePasswordVisibility = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return {
        showPassword,
        showConfirmPassword,
        togglePassword,
        toggleConfirmPassword,
    };
};