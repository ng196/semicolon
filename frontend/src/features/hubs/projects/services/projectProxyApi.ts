/**
 * Project API service that calls the backend endpoints.
 * Uses real backend API with mock data - easy to replace with Supabase later.
 * All endpoints are properly typed and handle authentication.
 */

import { apiClient } from '@/api/client';
import { Project, ProjectMember, JoinRequest, ProjectActivity } from '../types/project';

// Get current user ID (mock for now - in real app, get from auth context)
const getCurrentUserId = (): number => {
    // TODO: Replace with real user ID from auth context
    return 1;
};

export const projectProxyApi = {
    // Project CRUD operations
    getUserProjects: async (): Promise<Project[]> => {
        const userId = getCurrentUserId();
        const response = await apiClient.get(`/projects?userId=${userId}`);
        return response.data;
    },

    getProjectDetails: async (id: string | number): Promise<Project & { members: ProjectMember[]; user_role: string | null }> => {
        const userId = getCurrentUserId();
        const response = await apiClient.get(`/projects/${id}?userId=${userId}`);
        return response.data;
    },

    createProject: async (data: Partial<Project>): Promise<Project> => {
        const response = await apiClient.post('/projects', data);
        return response.data;
    },

    updateProject: async (id: string | number, data: Partial<Project>): Promise<Project> => {
        const response = await apiClient.put(`/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string | number): Promise<void> => {
        await apiClient.delete(`/projects/${id}`);
    },

    // Member management
    getProjectMembers: async (id: string | number): Promise<ProjectMember[]> => {
        const response = await apiClient.get(`/projects/${id}/members`);
        return response.data;
    },

    addMember: async (id: string | number, userId: number, role: string): Promise<ProjectMember> => {
        const response = await apiClient.post(`/projects/${id}/members`, { userId, role });
        return response.data;
    },

    removeMember: async (id: string | number, memberId: number): Promise<void> => {
        await apiClient.delete(`/projects/${id}/members/${memberId}`);
    },

    updateMemberRole: async (id: string | number, memberId: number, role: string): Promise<ProjectMember> => {
        const response = await apiClient.put(`/projects/${id}/members/${memberId}`, { role });
        return response.data;
    },

    leaveProject: async (id: string | number): Promise<void> => {
        const userId = getCurrentUserId();
        await apiClient.delete(`/projects/${id}/members/leave`, { userId });
    },

    // Join requests
    createJoinRequest: async (id: string | number, message: string): Promise<JoinRequest> => {
        const userId = getCurrentUserId();
        const response = await apiClient.post(`/projects/${id}/join-requests`, { userId, message });
        return response.data;
    },

    getJoinRequests: async (id: string | number): Promise<JoinRequest[]> => {
        const userId = getCurrentUserId();
        const response = await apiClient.get(`/projects/${id}/join-requests?userId=${userId}`);
        return response.data;
    },

    approveJoinRequest: async (id: string | number, requestId: number): Promise<void> => {
        const userId = getCurrentUserId();
        await apiClient.post(`/projects/${id}/join-requests/${requestId}/approve`, { userId });
    },

    rejectJoinRequest: async (id: string | number, requestId: number): Promise<void> => {
        const userId = getCurrentUserId();
        await apiClient.post(`/projects/${id}/join-requests/${requestId}/reject`, { userId });
    },

    // User role detection
    getUserRole: async (projectId: string | number, userId: number): Promise<'creator' | 'member' | 'visitor' | null> => {
        const response = await apiClient.get(`/projects/${projectId}/members/${userId}/role`);
        return response.data.role;
    },

    // Activity tracking
    getProjectActivity: async (id: string | number): Promise<ProjectActivity[]> => {
        const response = await apiClient.get(`/projects/${id}/activity`);
        return response.data;
    },
};