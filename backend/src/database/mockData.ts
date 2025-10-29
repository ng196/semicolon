/**
 * Mock data for development - simulates database responses
 * This file acts as a proxy database layer that can be easily replaced
 * with real Supabase calls when ready.
 */

export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    avatar: string | null;
    specialization: string;
    year: string;
    created_at: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    creator_id: number;
    status: 'active' | 'archived' | 'deleted';
    visibility: 'private' | 'public' | 'organization';
    created_at: string;
    updated_at: string;
    interests: string[];
    specialization: string;
    year: string;
    color: string;
    icon: string;
}

export interface ProjectMember {
    id: number;
    project_id: number;
    user_id: number;
    role: 'creator' | 'member' | 'visitor';
    status: 'active' | 'pending' | 'removed';
    joined_at: string;
}

export interface JoinRequest {
    id: number;
    project_id: number;
    requester_id: number;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    responded_at?: string;
    responded_by?: number;
}

export interface ProjectActivity {
    id: number;
    project_id: number;
    user_id: number;
    action: 'created' | 'updated' | 'deleted' | 'member_added' | 'member_removed' | 'role_changed' | 'join_requested' | 'join_approved' | 'join_rejected';
    details: Record<string, any>;
    created_at: string;
}

// Mock Users
export const mockUsers: User[] = [
    {
        id: 1,
        email: "john.doe@campus.edu",
        username: "john.doe",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        specialization: "CS",
        year: "3rd Year",
        created_at: "2024-01-15T10:00:00Z"
    },
    {
        id: 2,
        email: "alice.smith@campus.edu",
        username: "alice.smith",
        name: "Alice Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        specialization: "Design",
        year: "2nd Year",
        created_at: "2024-01-20T10:00:00Z"
    },
    {
        id: 3,
        email: "bob.johnson@campus.edu",
        username: "bob.johnson",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        specialization: "CS",
        year: "4th Year",
        created_at: "2024-02-01T10:00:00Z"
    },
    {
        id: 4,
        email: "sarah.brown@campus.edu",
        username: "sarah.brown",
        name: "Sarah Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        specialization: "Data Science",
        year: "3rd Year",
        created_at: "2024-02-10T10:00:00Z"
    },
    {
        id: 5,
        email: "mike.wilson@campus.edu",
        username: "mike.wilson",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        specialization: "CS",
        year: "2nd Year",
        created_at: "2024-02-15T10:00:00Z"
    }
];

// Mock Projects
export const mockProjects: Project[] = [
    {
        id: 1,
        title: "React Dashboard Project",
        description: "Building a modern analytics dashboard with real-time data visualization and interactive charts. Looking for frontend developers and UI/UX designers.",
        creator_id: 1,
        status: "active",
        visibility: "public",
        created_at: "2024-11-01T10:00:00Z",
        updated_at: "2024-11-15T14:30:00Z",
        interests: ["React", "TypeScript", "Data Visualization", "UI/UX"],
        specialization: "CS",
        year: "All Years",
        color: "blue",
        icon: "code"
    },
    {
        id: 2,
        title: "Mobile App Development",
        description: "Developing a cross-platform mobile application for campus event management and student engagement. Need React Native developers.",
        creator_id: 2,
        status: "active",
        visibility: "public",
        created_at: "2024-10-28T10:00:00Z",
        updated_at: "2024-11-10T16:20:00Z",
        interests: ["React Native", "Mobile Dev", "Firebase", "UI/UX"],
        specialization: "CS",
        year: "2nd Year+",
        color: "green",
        icon: "smartphone"
    },
    {
        id: 3,
        title: "AI Study Assistant",
        description: "Creating an intelligent study companion that helps students organize notes and track learning progress using machine learning.",
        creator_id: 3,
        status: "active",
        visibility: "private",
        created_at: "2024-10-15T10:00:00Z",
        updated_at: "2024-10-20T12:00:00Z",
        interests: ["AI/ML", "Python", "NLP", "Data Science"],
        specialization: "CS",
        year: "3rd Year+",
        color: "purple",
        icon: "brain"
    }
];

// Mock Project Members
export const mockProjectMembers: ProjectMember[] = [
    // React Dashboard Project (id: 1)
    { id: 1, project_id: 1, user_id: 1, role: 'creator', status: 'active', joined_at: '2024-11-01T10:00:00Z' },
    { id: 2, project_id: 1, user_id: 2, role: 'member', status: 'active', joined_at: '2024-11-05T14:30:00Z' },
    { id: 3, project_id: 1, user_id: 4, role: 'member', status: 'active', joined_at: '2024-11-08T09:15:00Z' },

    // Mobile App Development (id: 2)
    { id: 4, project_id: 2, user_id: 2, role: 'creator', status: 'active', joined_at: '2024-10-28T10:00:00Z' },
    { id: 5, project_id: 2, user_id: 5, role: 'member', status: 'active', joined_at: '2024-11-02T11:20:00Z' },

    // AI Study Assistant (id: 3)
    { id: 6, project_id: 3, user_id: 3, role: 'creator', status: 'active', joined_at: '2024-10-15T10:00:00Z' },
];

// Mock Join Requests
export const mockJoinRequests: JoinRequest[] = [
    {
        id: 1,
        project_id: 1,
        requester_id: 5,
        message: "I'm interested in contributing to this project as I have experience with React and data visualization. I would love to help with the dashboard components.",
        status: 'pending',
        created_at: '2024-11-20T10:30:00Z'
    },
    {
        id: 2,
        project_id: 2,
        requester_id: 3,
        message: "I can help with deployment and CI/CD pipeline setup for this React Native project. I have experience with mobile app deployment.",
        status: 'pending',
        created_at: '2024-11-18T15:45:00Z'
    },
    {
        id: 3,
        project_id: 3,
        requester_id: 1,
        message: "I'm very interested in AI/ML projects and would like to contribute to the NLP components of this study assistant.",
        status: 'approved',
        created_at: '2024-11-10T09:20:00Z',
        responded_at: '2024-11-12T14:00:00Z',
        responded_by: 3
    }
];

// Mock Project Activity
export const mockProjectActivity: ProjectActivity[] = [
    {
        id: 1,
        project_id: 1,
        user_id: 1,
        action: 'created',
        details: { project_title: 'React Dashboard Project' },
        created_at: '2024-11-01T10:00:00Z'
    },
    {
        id: 2,
        project_id: 1,
        user_id: 1,
        action: 'member_added',
        details: { member_user_id: 2, member_role: 'member' },
        created_at: '2024-11-05T14:30:00Z'
    },
    {
        id: 3,
        project_id: 1,
        user_id: 5,
        action: 'join_requested',
        details: { message: 'Interested in React development' },
        created_at: '2024-11-20T10:30:00Z'
    }
];

// Helper functions to simulate database operations
export const mockDatabase = {
    // Users
    getUserById: (id: number): User | undefined => mockUsers.find(u => u.id === id),
    getAllUsers: (): User[] => mockUsers,

    // Projects
    getProjectById: (id: number): Project | undefined => mockProjects.find(p => p.id === id),
    getAllProjects: (): Project[] => mockProjects.filter(p => p.status === 'active'),
    getUserProjects: (userId: number): Project[] => {
        const userProjectIds = mockProjectMembers
            .filter(m => m.user_id === userId && m.status === 'active')
            .map(m => m.project_id);
        return mockProjects.filter(p => userProjectIds.includes(p.id));
    },

    // Project Members
    getProjectMembers: (projectId: number): (ProjectMember & { user: User })[] => {
        return mockProjectMembers
            .filter(m => m.project_id === projectId && m.status === 'active')
            .map(member => ({
                ...member,
                user: mockUsers.find(u => u.id === member.user_id)!
            }));
    },

    getUserRole: (projectId: number, userId: number): 'creator' | 'member' | 'visitor' | null => {
        const membership = mockProjectMembers.find(
            m => m.project_id === projectId && m.user_id === userId && m.status === 'active'
        );
        return membership ? membership.role : null;
    },

    // Join Requests
    getJoinRequests: (projectId: number): (JoinRequest & { requester: User })[] => {
        return mockJoinRequests
            .filter(r => r.project_id === projectId)
            .map(request => ({
                ...request,
                requester: mockUsers.find(u => u.id === request.requester_id)!
            }));
    },

    getPendingJoinRequests: (projectId: number): (JoinRequest & { requester: User })[] => {
        return mockJoinRequests
            .filter(r => r.project_id === projectId && r.status === 'pending')
            .map(request => ({
                ...request,
                requester: mockUsers.find(u => u.id === request.requester_id)!
            }));
    },

    // Activity
    getProjectActivity: (projectId: number): (ProjectActivity & { user: User })[] => {
        return mockProjectActivity
            .filter(a => a.project_id === projectId)
            .map(activity => ({
                ...activity,
                user: mockUsers.find(u => u.id === activity.user_id)!
            }))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
};