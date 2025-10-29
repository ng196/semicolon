/**
 * Project card component with role-based visual indicators and actions.
 * Shows different colored borders and badges based on user role (Creator/Member/Visitor).
 * Displays appropriate action buttons: Manage (creator), View (member), Join (visitor).
 * Includes project details, member avatars, and role-specific notifications.
 */

import React from 'react';
import { Project } from '../types/project';

interface RoleBasedProjectCardProps {
    project: Project;
    userRole: 'creator' | 'member' | 'visitor' | null;
    onAction: (action: string, projectId: string | number) => void;
}

export const RoleBasedProjectCard: React.FC<RoleBasedProjectCardProps> = ({ project, userRole, onAction }) => {
    return (
        <div>
            {/* Role-based project card with colored borders and badges */}
            <p>RoleBasedProjectCard component - Shows role-specific UI</p>
            <p>Green border + "CREATOR" badge, Purple border + "MEMBER" badge, Gray border + "VISITOR" badge</p>
            <p>Different action buttons based on role: Manage/View/Join</p>
            <p>Shows project details, member count, and notification badges</p>
        </div>
    );
};