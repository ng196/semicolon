import React, { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OnboardingData } from '../OnboardingStorage';
import { validationService, ValidationResult } from '../ValidationService';

interface Step1Props {
    data: OnboardingData;
    onDataChange: (data: Partial<OnboardingData>) => void;
    onValidationChange: (isValid: boolean) => void;
}

export const Step1EmailPassword: React.FC<Step1Props> = ({
    data,
    onDataChange,
    onValidationChange,
}) => {
    const [emailValidation, setEmailValidation] = useState<ValidationResult>({ isValid: false });
    const [passwordValidation, setPasswordValidation] = useState<ValidationResult>({ isValid: false });
    const [confirmPasswordValidation, setConfirmPasswordValidation] = useState<ValidationResult>({ isValid: false });
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // Debounced validators
    const debouncedEmailValidator = validationService.getDebouncedEmailValidator();

    // Validate email
    const validateEmail = async (email: string) => {
        if (!email) {
            setEmailValidation({ isValid: false });
            return;
        }

        setIsCheckingEmail(true);
        try {
            const result = await debouncedEmailValidator(email);
            setEmailValidation(result);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    // Validate password
    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordValidation({ isValid: false });
            return;
        }
        const result = validationService.validatePassword(password);
        setPasswordValidation(result);
    };

    // Validate confirm password
    const validateConfirmPassword = (confirmPassword: string) => {
        if (!confirmPassword) {
            setConfirmPasswordValidation({ isValid: false });
            return;
        }
        const result = validationService.validateConfirmPassword(data.password || '', confirmPassword);
        setConfirmPasswordValidation(result);
    };

    // Handle input changes
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        onDataChange({ email });
        validateEmail(email);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        onDataChange({ password });
        validatePassword(password);

        // Re-validate confirm password if it exists
        if (data.confirmPassword) {
            validateConfirmPassword(data.confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmPassword = e.target.value;
        onDataChange({ confirmPassword });
        validateConfirmPassword(confirmPassword);
    };

    // Update parent validation state
    useEffect(() => {
        const isValid = emailValidation.isValid &&
            passwordValidation.isValid &&
            confirmPasswordValidation.isValid &&
            !isCheckingEmail;
        onValidationChange(isValid);
    }, [emailValidation, passwordValidation, confirmPasswordValidation, isCheckingEmail]);

    // Initial validation on mount if data exists
    useEffect(() => {
        if (data.email) {
            validateEmail(data.email);
        }
        if (data.password) {
            validatePassword(data.password);
        }
        if (data.confirmPassword) {
            validateConfirmPassword(data.confirmPassword);
        }
    }, []);

    const getValidationIcon = (validation: ValidationResult, isChecking: boolean = false) => {
        if (isChecking) {
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        }
        if (validation.isValid) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (validation.message) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Input
                        id="email"
                        type="email"
                        placeholder="your.email@campus.edu"
                        value={data.email || ''}
                        onChange={handleEmailChange}
                        className={`pr-10 ${emailValidation.message && !emailValidation.isValid
                            ? 'border-red-500 focus:border-red-500'
                            : emailValidation.isValid
                                ? 'border-green-500 focus:border-green-500'
                                : ''
                            }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getValidationIcon(emailValidation, isCheckingEmail)}
                    </div>
                </div>
                {emailValidation.message && (
                    <p className={`text-sm ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {emailValidation.message}
                    </p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type="password"
                        placeholder="Create a secure password"
                        value={data.password || ''}
                        onChange={handlePasswordChange}
                        className={`pr-10 ${passwordValidation.message && !passwordValidation.isValid
                            ? 'border-red-500 focus:border-red-500'
                            : passwordValidation.isValid
                                ? 'border-green-500 focus:border-green-500'
                                : ''
                            }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getValidationIcon(passwordValidation)}
                    </div>
                </div>
                {passwordValidation.message && (
                    <p className={`text-sm ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.message}
                    </p>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={data.confirmPassword || ''}
                        onChange={handleConfirmPasswordChange}
                        className={`pr-10 ${confirmPasswordValidation.message && !confirmPasswordValidation.isValid
                            ? 'border-red-500 focus:border-red-500'
                            : confirmPasswordValidation.isValid
                                ? 'border-green-500 focus:border-green-500'
                                : ''
                            }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getValidationIcon(confirmPasswordValidation)}
                    </div>
                </div>
                {confirmPasswordValidation.message && (
                    <p className={`text-sm ${confirmPasswordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {confirmPasswordValidation.message}
                    </p>
                )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>• Password must be at least 6 characters</p>
                <p>• We'll check if your email is already registered</p>
            </div>


        </div>
    );
};