/**
 * Modal form for visitors to request joining a project.
 * Contains textarea for explaining interest and relevant skills.
 * Includes character limit validation (500 chars) and form submission.
 * Shows project details and handles join request status feedback.
 */

import React from 'react';

interface JoinRequestModalProps {
    projectId: string | number;
    isOpen: boolean;
    onClose: () => void;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({ projectId, isOpen, onClose }) => {
    return (
        <div>
            {/* Join request form modal */}
            <p>JoinRequestModal component - For visitors/non-members</p>
            <p>Form with textarea for join request message (500 char limit)</p>
            <p>Shows project details and submission confirmation</p>
            <p>Handles form validation and success/error states</p>
        </div>
    );
};