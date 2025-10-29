import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/client';

// Query Keys for Projects
export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...projectKeys.lists(), { filters }] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...projectKeys.details(), id] as const,
    members: (id: string | number) => [...projectKeys.all, 'members', id] as const,
    userRole: (projectId: string | number, userId: number) => [...projectKeys.all, 'userRole', projectId, userId] as const,
    joinRequests: (id: string | number) => [...projectKeys.all, 'joinRequests', id] as const,
    activity: (id: string | number) => [...projectKeys.all, 'activity', id] as const,
};

// Project Query Hooks
export const useUserProjectsQuery = (userId?: number) => {
    return useQuery({
        queryKey: projectKeys.list({ userId }),
        queryFn: () => projectsApi.getUserProjects(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

export const useProjectQuery = (id: string | number, userId?: number) => {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: () => projectsApi.getById(id, userId),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

export const useProjectMembersQuery = (id: string | number) => {
    return useQuery({
        queryKey: projectKeys.members(id),
        queryFn: () => projectsApi.getMembers(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes for member data
    });
};

export const useUserRoleQuery = (projectId: string | number, userId: number) => {
    return useQuery({
        queryKey: projectKeys.userRole(projectId, userId),
        queryFn: () => projectsApi.getUserRole(projectId, userId),
        enabled: !!projectId && !!userId,
        staleTime: 30 * 1000, // 30 seconds for role data
    });
};

export const useJoinRequestsQuery = (projectId: string | number, userId?: number) => {
    return useQuery({
        queryKey: projectKeys.joinRequests(projectId),
        queryFn: () => projectsApi.getJoinRequests(projectId, userId),
        enabled: !!projectId,
        staleTime: 1 * 60 * 1000, // 1 minute for join requests
    });
};

export const useProjectActivityQuery = (projectId: string | number) => {
    return useQuery({
        queryKey: projectKeys.activity(projectId),
        queryFn: () => projectsApi.getActivity(projectId),
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000, // 2 minutes for activity data
    });
};

// Project Mutation Hooks
export const useCreateJoinRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string | number; data: { userId?: number; message: string } }) =>
            projectsApi.createJoinRequest(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.joinRequests(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.activity(projectId) });
        },
        onError: (error) => {
            console.error('Failed to create join request:', error);
        },
    });
};

export const useApproveJoinRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, requestId, userId }: { projectId: string | number; requestId: number; userId?: number }) =>
            projectsApi.approveJoinRequest(projectId, requestId, userId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.joinRequests(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.activity(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        },
        onError: (error) => {
            console.error('Failed to approve join request:', error);
        },
    });
};

export const useRejectJoinRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, requestId, userId }: { projectId: string | number; requestId: number; userId?: number }) =>
            projectsApi.rejectJoinRequest(projectId, requestId, userId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.joinRequests(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.activity(projectId) });
        },
        onError: (error) => {
            console.error('Failed to reject join request:', error);
        },
    });
};

export const useLeaveProjectMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, userId }: { projectId: string | number; userId?: number }) =>
            projectsApi.leaveProject(projectId, userId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.activity(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to leave project:', error);
        },
    });
};