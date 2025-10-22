import React, { useState, useEffect } from 'react';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Button } from '../../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Upload, RefreshCw } from 'lucide-react';
import { OnboardingData } from '../OnboardingStorage';

interface Step4Props {
    data: OnboardingData;
    onDataChange: (data: Partial<OnboardingData>) => void;
    onValidationChange: (isValid: boolean) => void;
}

export const Step4Interests: React.FC<Step4Props> = ({
    data,
    onDataChange,
    onValidationChange,
}) => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests || []);
    const [avatarUrl, setAvatarUrl] = useState<string>(data.avatar || '');

    // Interest categories
    const interestCategories = {
        'Academic': [
            'Study Groups',
            'Research',
            'Academic Writing',
            'Tutoring',
            'Library Sessions'
        ],
        'Technology': [
            'Web Development',
            'Mobile Apps',
            'AI/ML',
            'Cybersecurity',
            'Game Development',
            'Data Science'
        ],
        'Creative': [
            'Photography',
            'Design',
            'Music',
            'Writing',
            'Art',
            'Theater',
            'Film'
        ],
        'Sports & Fitness': [
            'Basketball',
            'Soccer',
            'Tennis',
            'Swimming',
            'Gym',
            'Running',
            'Yoga'
        ],
        'Social': [
            'Networking',
            'Events',
            'Parties',
            'Cultural Activities',
            'Volunteering',
            'Community Service'
        ],
        'Hobbies': [
            'Gaming',
            'Reading',
            'Cooking',
            'Travel',
            'Languages',
            'Board Games',
            'Podcasts'
        ]
    };

    // Generate random avatar
    const generateAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        setAvatarUrl(newAvatarUrl);
        onDataChange({ avatar: newAvatarUrl });
    };

    // Handle interest selection
    const handleInterestToggle = (interest: string) => {
        const newInterests = selectedInterests.includes(interest)
            ? selectedInterests.filter(i => i !== interest)
            : [...selectedInterests, interest];

        setSelectedInterests(newInterests);
        onDataChange({ interests: newInterests });
    };

    // Handle skip
    const handleSkip = () => {
        onDataChange({ interests: [], avatar: '' });
    };

    // This step is always valid (optional fields)
    useEffect(() => {
        onValidationChange(true);
    }, []);

    // Generate initial avatar if none exists
    useEffect(() => {
        if (!avatarUrl && data.username) {
            const initialAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`;
            setAvatarUrl(initialAvatar);
            onDataChange({ avatar: initialAvatar });
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
                <Label>Profile Avatar</Label>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarUrl} alt="Profile avatar" />
                        <AvatarFallback>
                            {data.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateAvatar}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Generate New
                        </Button>
                        <p className="text-xs text-gray-500">
                            Click to generate a random avatar
                        </p>
                    </div>
                </div>
            </div>

            {/* Interests Selection */}
            <div className="space-y-4">
                <div>
                    <Label>Select Your Interests</Label>
                    <p className="text-sm text-gray-500 mt-1">
                        Choose topics you're interested in to help us personalize your experience
                    </p>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto">
                    {Object.entries(interestCategories).map(([category, interests]) => (
                        <div key={category} className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {interests.map((interest) => (
                                    <div key={interest} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={interest}
                                            checked={selectedInterests.includes(interest)}
                                            onCheckedChange={() => handleInterestToggle(interest)}
                                        />
                                        <Label
                                            htmlFor={interest}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {interest}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedInterests.length > 0 && (
                    <div className="text-sm text-gray-600">
                        Selected {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Skip Option */}
            <div className="text-center pt-4">
                <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Skip - I'll personalize later
                </Button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">How we use this information:</p>
                <p>• Recommend relevant events and activities</p>
                <p>• Connect you with like-minded students</p>
                <p>• Personalize your feed and notifications</p>
                <p>• You can always update your interests later</p>
            </div>
        </div>
    );
};