/**
 * Hook to detect and manage user's role in a specific project.
 * Returns the user's role (creator/member/visitor/null) for the given project.
 * Handles role changes and permission checking for UI components.
 * Integrates with TanStack Query for caching and real-time updates.
 */

import { useQuery } from '@tanstack/react-query';
import { projectProxyApi } from '../services/projectProxyApi';
import { UserRole } from '../types/project';

export const useProjectRole = (projectId: string | number, userId: number) => {
    return useQuery({
        queryKey: ['project-role', projectId, userId],
        queryFn: () => projectProxyApi.getUserRole(projectId, userId),
        enabled: !!projectId && !!userId,
        staleTime: 30 * 1000, // 30 seconds
    });
};

// Helper hook to check specific permissions
export const useProjectPermissions = (role: UserRole) => {
    return {
        canEdit: role === 'creator',
        canDelete: role === 'creator',
        canManageMembers: role === 'creator',
        canLeave: role === 'member',
        canRequestJoin: role === 'visitor' || role === null,
        canViewMembers: role === 'creator' || role === 'member',
    };
};