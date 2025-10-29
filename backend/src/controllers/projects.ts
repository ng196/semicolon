/**
 * Project controllers using mock data
 * These can be easily replaced with real Supabase calls later
 */

import { Request, Response } from 'express';
import { mockDatabase } from '../database/mockData.js';

// Simulate async delay for realistic API behavior
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        await delay();

        // In real implementation, get userId from JWT token
        const userId = parseInt(req.query.userId as string) || 1; // Mock current user

        const projects = mockDatabase.getUserProjects(userId);
        const projectsWithRole = projects.map(project => {
            const role = mockDatabase.getUserRole(project.id, userId);
            const members = mockDatabase.getProjectMembers(project.id);

            return {
                ...project,
                role,
                member_count: members.length,
                joined_at: members.find(m => m.user_id === userId)?.joined_at
            };
        });

        res.json({
            success: true,
            data: projectsWithRole
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user projects',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getProjectDetails = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const userId = parseInt(req.query.userId as string) || 1; // Mock current user

        const project = mockDatabase.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const members = mockDatabase.getProjectMembers(projectId);
        const userRole = mockDatabase.getUserRole(projectId, userId);

        res.json({
            success: true,
            data: {
                ...project,
                members,
                user_role: userRole,
                member_count: members.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project details',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getProjectMembers = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const members = mockDatabase.getProjectMembers(projectId);

        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project members',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getUserRole = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);

        const role = mockDatabase.getUserRole(projectId, userId);

        res.json({
            success: true,
            data: { role }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check user role',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getJoinRequests = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const userId = parseInt(req.query.userId as string) || 1; // Mock current user

        // Check if user is creator
        const userRole = mockDatabase.getUserRole(projectId, userId);
        if (userRole !== 'creator') {
            return res.status(403).json({
                success: false,
                message: 'Only project creators can view join requests'
            });
        }

        const requests = mockDatabase.getPendingJoinRequests(projectId);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch join requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const createJoinRequest = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const userId = parseInt(req.body.userId) || 1; // Mock current user
        const { message } = req.body;

        // Check if user is already a member
        const userRole = mockDatabase.getUserRole(projectId, userId);
        if (userRole) {
            return res.status(409).json({
                success: false,
                message: 'User is already a member of this project'
            });
        }

        // In real implementation, this would insert into database
        const newRequest = {
            id: Date.now(), // Mock ID
            project_id: projectId,
            requester_id: userId,
            message,
            status: 'pending' as const,
            created_at: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            data: newRequest,
            message: 'Join request submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create join request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const approveJoinRequest = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const requestId = parseInt(req.params.requestId);
        const userId = parseInt(req.body.userId) || 1; // Mock current user

        // Check if user is creator
        const userRole = mockDatabase.getUserRole(projectId, userId);
        if (userRole !== 'creator') {
            return res.status(403).json({
                success: false,
                message: 'Only project creators can approve join requests'
            });
        }

        // In real implementation, this would update database
        res.json({
            success: true,
            message: 'Join request approved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to approve join request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const rejectJoinRequest = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const requestId = parseInt(req.params.requestId);
        const userId = parseInt(req.body.userId) || 1; // Mock current user

        // Check if user is creator
        const userRole = mockDatabase.getUserRole(projectId, userId);
        if (userRole !== 'creator') {
            return res.status(403).json({
                success: false,
                message: 'Only project creators can reject join requests'
            });
        }

        // In real implementation, this would update database
        res.json({
            success: true,
            message: 'Join request rejected successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reject join request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const leaveProject = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const userId = parseInt(req.body.userId) || 1; // Mock current user

        // Check if user is a member (not creator)
        const userRole = mockDatabase.getUserRole(projectId, userId);
        if (userRole === 'creator') {
            return res.status(400).json({
                success: false,
                message: 'Project creators cannot leave their own project'
            });
        }

        if (!userRole) {
            return res.status(404).json({
                success: false,
                message: 'User is not a member of this project'
            });
        }

        // In real implementation, this would update database
        res.json({
            success: true,
            message: 'Successfully left the project'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to leave project',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getProjectActivity = async (req: Request, res: Response) => {
    try {
        await delay();

        const projectId = parseInt(req.params.id);
        const activity = mockDatabase.getProjectActivity(projectId);

        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project activity',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};