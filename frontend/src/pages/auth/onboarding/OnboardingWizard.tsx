import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight, Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { onboardingStorage, OnboardingData } from './OnboardingStorage';
import { Step1EmailPassword } from './steps/Step1EmailPassword';
import { Step2UserDetails } from './steps/Step2UserDetails';
import { Step3ProfileInfo } from './steps/Step3ProfileInfo';
import { Step4Interests } from './steps/Step4Interests';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface OnboardingWizardProps {
    onComplete: (data: OnboardingData) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<OnboardingData>({});
    const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);

    const totalSteps = 4;
    const progressPercentage = (currentStep / totalSteps) * 100;

    // Load stored data on mount
    useEffect(() => {
        const stored = onboardingStorage.loadData();
        if (stored) {
            setFormData(stored.data);
            setCurrentStep(stored.currentStep);
        }
    }, []);

    // PWA Install prompt handler
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallPWA = async () => {
        if (!deferredPrompt) {
            toast.error('PWA installation not available on this browser');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success('App installed successfully!');
            setCanInstall(false);
        }

        setDeferredPrompt(null);
    };

    const handleDownloadPage = () => {
        // Save current page as HTML
        const pageContent = document.documentElement.outerHTML;
        const blob = new Blob([pageContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'campushub-signup.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Page downloaded successfully!');
    };

    // Save data whenever it changes
    useEffect(() => {
        if (Object.keys(formData).length > 0) {
            onboardingStorage.saveStep(currentStep, formData);
        }
    }, [formData, currentStep]);

    const updateFormData = (stepData: Partial<OnboardingData>) => {
        setFormData(prev => ({ ...prev, ...stepData }));
    };

    const updateStepValidation = (step: number, isValid: boolean) => {
        setStepValidation(prev => ({ ...prev, [step]: isValid }));
    };

    const canProceed = () => {
        return stepValidation[currentStep] === true;
    };

    const nextStep = () => {
        if (currentStep < totalSteps && canProceed()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else if (currentStep === 1) {
            // On first step, redirect to login page
            window.location.href = '/auth/login';
        }
    };

    const handleComplete = async () => {
        if (!canProceed()) return;

        setIsLoading(true);
        try {
            // Clear storage on successful completion
            onboardingStorage.clearStorage();
            onComplete(formData);
        } catch (error) {
            console.error('Onboarding completion failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1EmailPassword
                        data={formData}
                        onDataChange={updateFormData}
                        onValidationChange={(isValid) => updateStepValidation(1, isValid)}
                    />
                );
            case 2:
                return (
                    <Step2UserDetails
                        data={formData}
                        onDataChange={updateFormData}
                        onValidationChange={(isValid) => updateStepValidation(2, isValid)}
                    />
                );
            case 3:
                return (
                    <Step3ProfileInfo
                        data={formData}
                        onDataChange={updateFormData}
                        onValidationChange={(isValid) => updateStepValidation(3, isValid)}
                    />
                );
            case 4:
                return (
                    <Step4Interests
                        data={formData}
                        onDataChange={updateFormData}
                        onValidationChange={(isValid) => updateStepValidation(4, isValid)}
                    />
                );
            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return 'Create Account';
            case 2: return 'Profile Details';
            case 3: return 'Academic Info';
            case 4: return 'Personalize';
            default: return 'Onboarding';
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 1: return 'Enter your email and create a secure password';
            case 2: return 'Choose your username and display name';
            case 3: return 'Tell us about your academic background';
            case 4: return 'Select your interests and upload an avatar';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md relative">
                {/* Download Menu - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleInstallPWA} className="cursor-pointer">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Install as App</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownloadPage} className="cursor-pointer">
                                <FileDown className="mr-2 h-4 w-4" />
                                <span>Download Page</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Join CampusHub</CardTitle>
                    <p className="text-gray-600 text-sm">{getStepDescription()}</p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Step {currentStep} of {totalSteps}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step Title */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">{getStepTitle()}</h3>
                    </div>

                    {/* Step Content with Animation */}
                    <div className="transition-all duration-300 ease-in-out">
                        {renderStep()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>

                        {currentStep < totalSteps ? (
                            <Button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className="flex items-center gap-2"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed() || isLoading}
                                className="flex items-center gap-2"
                            >
                                {isLoading ? 'Creating Account...' : 'Complete'}
                            </Button>
                        )}
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-center space-x-2 pt-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div
                                key={i + 1}
                                className={`w-2 h-2 rounded-full transition-colors ${i + 1 === currentStep
                                    ? 'bg-blue-600'
                                    : i + 1 < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};