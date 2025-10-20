import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from './OnboardingWizard';
import { OnboardingData } from './OnboardingStorage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { toast } = useToast();

    const handleOnboardingComplete = async (data: OnboardingData) => {
        try {
            // Transform onboarding data to signup format
            const signupData = {
                email: data.email!,
                password: data.password!,
                confirmPassword: data.confirmPassword!,
                acceptTerms: true, // Implied by completing onboarding
                // Additional profile data
                username: data.username!,
                name: data.name!,
                specialization: data.specialization || '',
                year: data.year || '',
                interests: data.interests || [],
                avatar: data.avatar || ''
            };

            // Call the existing signup method
            await signup(signupData);

            // Navigate to dashboard on success
            navigate('/');
        } catch (error) {
            console.error('Onboarding completion failed:', error);

            // Show error toast with specific message
            const errorMessage = error instanceof Error ? error.message : 'Signup failed';

            toast({
                title: 'Signup Failed',
                description: errorMessage,
                variant: 'destructive',
            });

            // If email is already registered, go back to step 1
            if (errorMessage.includes('Email already registered')) {
                // The wizard should stay on the current step so user can see the error
            }
        }
    };

    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
};

export { OnboardingPage };