import { enhancedApiClient } from '../enhancedClient';

// Types
export interface Hub {
    id: number;
    name: string;
    type: string;
    description: string;
    creator_id: number;
    icon?: string;
    specialization?: string;
    year?: string;
    color?: string;
    interests?: string[];
    member_count: number;
    is_member: boolean;
    is_private: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateHubData {
    name: string;
    type: string;
    description: string;
    icon?: string;
    specialization?: string;
    year?: string;
    color?: string;
    interests?: string[];
}

export interface UpdateHubData extends Partial<CreateHubData> { }

export interface HubMember {
    id: number;
    user_id: number;
    hub_id: number;
    role: 'admin' | 'moderator' | 'member';
    joined_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
        specialization?: string;
        year?: string;
    };
}

export interface ClubSettings {
    is_private: boolean;
    auto_approve_members: boolean;
    allow_member_posts: boolean;
    allow_member_events: boolean;
}

export interface ClubPost {
    id: number;
    club_id: number;
    author_id: number;
    title?: string;
    content: string;
    type: 'announcement' | 'discussion' | 'event';
    pinned: boolean;
    created_at: string;
    updated_at: string;
    author: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
    };
}

export interface JoinRequest {
    id: number;
    club_id: number;
    user_id: number;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
        specialization?: string;
        year?: string;
    };
}

// Hubs API Service
export const hubsService = {
    // Get all hubs
    getAll: (): Promise<Hub[]> => {
        return enhancedApiClient.get<Hub[]>('/hubs');
    },

    // Get hub by ID
    getById: (id: string | number): Promise<Hub> => {
        return enhancedApiClient.get<Hub>(`/hubs/${id}`);
    },

    // Create new hub
    create: (data: CreateHubData): Promise<Hub> => {
        return enhancedApiClient.post<Hub>('/hubs', data);
    },

    // Update hub
    update: (id: string | number, data: UpdateHubData): Promise<Hub> => {
        return enhancedApiClient.put<Hub>(`/hubs/${id}`, data);
    },

    // Delete hub
    delete: (id: string | number): Promise<void> => {
        return enhancedApiClient.delete<void>(`/hubs/${id}`);
    },

    // Get hub members
    getMembers: (id: string | number): Promise<HubMember[]> => {
        return enhancedApiClient.get<HubMember[]>(`/hubs/${id}/members`);
    },

    // Check membership status
    checkMembership: (id: string | number, userId: number): Promise<{ is_member: boolean; role?: string }> => {
        return enhancedApiClient.get(`/hubs/${id}/members/${userId}/check`);
    },

    // Add member to hub
    addMember: (id: string | number, memberData: { user_id: number; role?: string }): Promise<HubMember> => {
        return enhancedApiClient.post<HubMember>(`/hubs/${id}/members`, memberData);
    },

    // Remove member from hub
    removeMember: (id: string | number, memberData: { user_id: number }): Promise<void> => {
        return enhancedApiClient.delete<void>(`/hubs/${id}/members`, memberData);
    },

    // Update member role
    updateMemberRole: (id: string | number, userId: number, role: string): Promise<HubMember> => {
        return enhancedApiClient.put<HubMember>(`/hubs/${id}/members/${userId}/role`, { role });
    },
};

// Clubs API Service (extends hubs with club-specific features)
export const clubsService = {
    // Club settings
    getSettings: (clubId: string | number): Promise<ClubSettings> => {
        return enhancedApiClient.get<ClubSettings>(`/clubs/${clubId}/settings`);
    },

    updateSettings: (clubId: string | number, settings: Partial<ClubSettings>): Promise<ClubSettings> => {
        return enhancedApiClient.put<ClubSettings>(`/clubs/${clubId}/settings`, settings);
    },

    // Membership management
    joinPublicClub: (clubId: string | number): Promise<HubMember> => {
        return enhancedApiClient.post<HubMember>(`/clubs/${clubId}/join`);
    },

    leaveClub: (clubId: string | number): Promise<void> => {
        return enhancedApiClient.delete<void>(`/clubs/${clubId}/leave`);
    },

    // Join requests
    requestToJoin: (clubId: string | number, message?: string): Promise<JoinRequest> => {
        return enhancedApiClient.post<JoinRequest>(`/clubs/${clubId}/join-requests`, { message });
    },

    getJoinRequests: (clubId: string | number, status?: string): Promise<JoinRequest[]> => {
        const endpoint = status
            ? `/clubs/${clubId}/join-requests?status=${status}`
            : `/clubs/${clubId}/join-requests`;
        return enhancedApiClient.get<JoinRequest[]>(endpoint);
    },

    approveJoinRequest: (clubId: string | number, requestId: number): Promise<JoinRequest> => {
        return enhancedApiClient.put<JoinRequest>(`/clubs/${clubId}/join-requests/${requestId}/approve`);
    },

    rejectJoinRequest: (clubId: string | number, requestId: number): Promise<JoinRequest> => {
        return enhancedApiClient.put<JoinRequest>(`/clubs/${clubId}/join-requests/${requestId}/reject`);
    },

    // Club posts
    getPosts: (clubId: string | number): Promise<ClubPost[]> => {
        return enhancedApiClient.get<ClubPost[]>(`/clubs/${clubId}/posts`);
    },

    createPost: (clubId: string | number, post: { title?: string; content: string; type?: string }): Promise<ClubPost> => {
        return enhancedApiClient.post<ClubPost>(`/clubs/${clubId}/posts`, post);
    },

    updatePost: (clubId: string | number, postId: number, post: { title?: string; content?: string; type?: string }): Promise<ClubPost> => {
        return enhancedApiClient.put<ClubPost>(`/clubs/${clubId}/posts/${postId}`, post);
    },

    deletePost: (clubId: string | number, postId: number): Promise<void> => {
        return enhancedApiClient.delete<void>(`/clubs/${clubId}/posts/${postId}`);
    },

    pinPost: (clubId: string | number, postId: number, pinned: boolean): Promise<ClubPost> => {
        return enhancedApiClient.put<ClubPost>(`/clubs/${clubId}/posts/${postId}/pin`, { pinned });
    },

    // Club events
    getEvents: (clubId: string | number): Promise<any[]> => {
        return enhancedApiClient.get<any[]>(`/clubs/${clubId}/events`);
    },

    createEvent: (clubId: string | number, event: { event_id: number; visibility?: string; target_audience?: string }): Promise<any> => {
        return enhancedApiClient.post(`/clubs/${clubId}/events`, event);
    },

    updateEventVisibility: (clubId: string | number, eventId: number, visibility: string): Promise<any> => {
        return enhancedApiClient.put(`/clubs/${clubId}/events/${eventId}/visibility`, { visibility });
    },

    // Delete club
    deleteClub: (clubId: string | number): Promise<void> => {
        return enhancedApiClient.delete<void>(`/clubs/${clubId}`);
    },
};