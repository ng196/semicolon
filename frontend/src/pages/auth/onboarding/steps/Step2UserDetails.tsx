import React, { useState, useEffect } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OnboardingData } from '../OnboardingStorage';
import { validationService, ValidationResult } from '../ValidationService';

interface Step2Props {
    data: OnboardingData;
    onDataChange: (data: Partial<OnboardingData>) => void;
    onValidationChange: (isValid: boolean) => void;
}

export const Step2UserDetails: React.FC<Step2Props> = ({
    data,
    onDataChange,
    onValidationChange,
}) => {
    const [usernameValidation, setUsernameValidation] = useState<ValidationResult>({ isValid: false });
    const [nameValidation, setNameValidation] = useState<ValidationResult>({ isValid: false });
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Debounced validators
    const debouncedUsernameValidator = validationService.getDebouncedUsernameValidator();

    // Validate username
    const validateUsername = async (username: string) => {
        if (!username) {
            setUsernameValidation({ isValid: false });
            return;
        }

        setIsCheckingUsername(true);
        try {
            const result = await debouncedUsernameValidator(username);
            setUsernameValidation(result);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    // Validate name
    const validateName = (name: string) => {
        if (!name) {
            setNameValidation({ isValid: false });
            return;
        }
        const result = validationService.validateName(name);
        setNameValidation(result);
    };

    // Handle input changes
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const username = e.target.value;
        onDataChange({ username });
        validateUsername(username);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        onDataChange({ name });
        validateName(name);
    };

    // Update parent validation state
    useEffect(() => {
        const isValid = usernameValidation.isValid &&
            nameValidation.isValid &&
            !isCheckingUsername;
        onValidationChange(isValid);
    }, [usernameValidation, nameValidation, isCheckingUsername]);

    // Initial validation on mount if data exists
    useEffect(() => {
        if (data.username) {
            validateUsername(data.username);
        }
        if (data.name) {
            validateName(data.name);
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
            {/* Username Field */}
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                    <Input
                        id="username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={data.username || ''}
                        onChange={handleUsernameChange}
                        className={`pr-10 ${usernameValidation.message && !usernameValidation.isValid
                            ? 'border-red-500 focus:border-red-500'
                            : usernameValidation.isValid
                                ? 'border-green-500 focus:border-green-500'
                                : ''
                            }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getValidationIcon(usernameValidation, isCheckingUsername)}
                    </div>
                </div>
                {usernameValidation.message && (
                    <p className={`text-sm ${usernameValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {usernameValidation.message}
                    </p>
                )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="relative">
                    <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={data.name || ''}
                        onChange={handleNameChange}
                        className={`pr-10 ${nameValidation.message && !nameValidation.isValid
                            ? 'border-red-500 focus:border-red-500'
                            : nameValidation.isValid
                                ? 'border-green-500 focus:border-green-500'
                                : ''
                            }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getValidationIcon(nameValidation)}
                    </div>
                </div>
                {nameValidation.message && (
                    <p className={`text-sm ${nameValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {nameValidation.message}
                    </p>
                )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>• Username must be 3-20 characters (letters, numbers, underscores)</p>
                <p>• Display name is how others will see you on CampusHub</p>
                <p>• We'll check if your username is available</p>
            </div>
        </div>
    );
};