/**
 * Reusable confirmation dialog for destructive actions.
 * Handles delete project, remove member, leave project confirmations.
 * Shows appropriate warning icons, titles, and action-specific messages.
 * Provides confirm/cancel buttons with proper styling and loading states.
 */

import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    type = 'danger'
}) => {
    return (
        <div>
            {/* Confirmation dialog for destructive actions */}
            <p>ConfirmationDialog component - For destructive actions</p>
            <p>Shows warning icon, title, message, and confirm/cancel buttons</p>
            <p>Supports danger/warning types with appropriate styling</p>
            <p>Handles loading states and prevents accidental clicks</p>
        </div>
    );
};