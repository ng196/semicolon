/**
 * Hook for managing project members and membership operations.
 * Handles fetching member list, adding/removing members, updating roles.
 * Provides mutations for member management with optimistic updates.
 * Integrates with TanStack Query for real-time member list synchronization.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectProxyApi } from '../services/projectProxyApi';
import { ProjectMember } from '../types/project';

export const useProjectMembers = (projectId: string | number) => {
    return useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => projectProxyApi.getProjectMembers(projectId),
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useAddMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, userId, role }: { projectId: string | number; userId: number; role: string }) =>
            projectProxyApi.addMember(projectId, userId, role),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
        },
    });
};

export const useRemoveMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, memberId }: { projectId: string | number; memberId: number }) =>
            projectProxyApi.removeMember(projectId, memberId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
        },
    });
};

export const useLeaveProjectMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string | number) => projectProxyApi.leaveProject(projectId),
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project-role', projectId] });
        },
    });
};