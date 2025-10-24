import React, { useEffect } from 'react';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { OnboardingData } from '../OnboardingStorage';

interface Step3Props {
    data: OnboardingData;
    onDataChange: (data: Partial<OnboardingData>) => void;
    onValidationChange: (isValid: boolean) => void;
}

export const Step3ProfileInfo: React.FC<Step3Props> = ({
    data,
    onDataChange,
    onValidationChange,
}) => {
    // Predefined options
    const specializations = [
        'Computer Science',
        'Engineering',
        'Business Administration',
        'Arts & Literature',
        'Sciences',
        'Medicine',
        'Law',
        'Psychology',
        'Education',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Economics',
        'Political Science',
        'History',
        'Philosophy',
        'Other'
    ];

    const years = [
        '1st Year',
        '2nd Year',
        '3rd Year',
        '4th Year',
        'Graduate',
        'PhD',
        'Faculty',
        'Staff'
    ];

    // Handle selection changes
    const handleSpecializationChange = (value: string) => {
        onDataChange({ specialization: value });
    };

    const handleYearChange = (value: string) => {
        onDataChange({ year: value });
    };

    const handleSkip = () => {
        onDataChange({ specialization: '', year: '' });
    };

    // This step is always valid (optional fields)
    useEffect(() => {
        onValidationChange(true);
    }, []);

    return (
        <div className="space-y-6">
            {/* Specialization Field */}
            <div className="space-y-2">
                <Label htmlFor="specialization">Specialization / Major</Label>
                <Select value={data.specialization || ''} onValueChange={handleSpecializationChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                        {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                                {spec}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                    This helps us show you relevant content and connect you with peers
                </p>
            </div>

            {/* Year Field */}
            <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={data.year || ''} onValueChange={handleYearChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your academic year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                    This helps us tailor your experience to your academic level
                </p>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-4">
                <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Next
                </Button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Why do we ask this?</p>
                <p>• Find study groups and events relevant to your field</p>
                <p>• Connect with students in similar academic situations</p>
                <p>• Get personalized content recommendations</p>
                <p>• You can always update this information later</p>
            </div>
        </div>
    );
};