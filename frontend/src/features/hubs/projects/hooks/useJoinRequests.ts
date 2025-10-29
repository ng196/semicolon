/**
 * Hook for managing project join requests and approval workflow.
 * Handles creating join requests, fetching pending requests for creators.
 * Provides mutations for approving/rejecting requests with notifications.
 * Manages join request status tracking and UI state updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectProxyApi } from '../services/projectProxyApi';
import { JoinRequest } from '../types/project';

export const useJoinRequests = (projectId: string | number) => {
    return useQuery({
        queryKey: ['join-requests', projectId],
        queryFn: () => projectProxyApi.getJoinRequests(projectId),
        enabled: !!projectId,
        staleTime: 30 * 1000, // 30 seconds
    });
};

export const useCreateJoinRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, message }: { projectId: string | number; message: string }) =>
            projectProxyApi.createJoinRequest(projectId, message),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['join-requests', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project-role', projectId] });
        },
    });
};

export const useApproveJoinRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, requestId }: { projectId: string | number; requestId: number }) =>
            projectProxyApi.approveJoinRequest(projectId, requestId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['join-requests', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
        },
    });
};

export const useRejectJoinRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, requestId }: { projectId: string | number; requestId: number }) =>
            projectProxyApi.rejectJoinRequest(projectId, requestId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['join-requests', projectId] });
        },
    });
};