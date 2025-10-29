/**
 * TypeScript types for the project management system.
 * Defines interfaces for Project, Member, JoinRequest, and UserRole.
 * Includes role-based permission types (Creator, Member, Visitor).
 */

export interface Project {
    id: string | number;
    title: string;
    description: string;
    creator_id: number;
    status: 'active' | 'archived' | 'deleted';
    visibility: 'private' | 'public' | 'organization';
    created_at: string;
    updated_at: string;
    member_count: number;
    interests: string[];
    specialization: string;
    year: string;
    color: string;
    icon: string;
}

export interface ProjectMember {
    id: number;
    user_id: number;
    project_id: string | number;
    role: 'creator' | 'member' | 'visitor';
    status: 'active' | 'pending' | 'removed';
    joined_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
        avatar: string | null;
        specialization: string;
        year: string;
    };
}

export interface JoinRequest {
    id: number;
    project_id: string | number;
    requester_id: number;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    requester: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
        specialization: string;
        year: string;
    };
}

export type UserRole = 'creator' | 'member' | 'visitor' | null;

export interface ProjectActivity {
    id: number;
    project_id: string | number;
    user_id: number;
    action: 'created' | 'updated' | 'deleted' | 'member_added' | 'member_removed' | 'role_changed' | 'join_requested' | 'join_approved' | 'join_rejected';
    details: Record<string, any>;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
}