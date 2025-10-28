import { Request, Response } from 'express';
import * as model from '../models/index.js';

// ============================================
// Club Settings
// ============================================

export const getClubSettings = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const settings = await model.getClubSettings(clubId);

        if (!settings) {
            return res.status(404).json({ error: 'Club settings not found' });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateClubSettings = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId;

        // Check if user has permission to update settings
        if (!(await model.canManageMembers(clubId, userId!))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const { is_private, auto_approve_members } = req.body;
        const updateData: any = {};

        if (is_private !== undefined) updateData.is_private = is_private ? 1 : 0;
        if (auto_approve_members !== undefined) updateData.auto_approve_members = auto_approve_members ? 1 : 0;

        await model.updateClubSettings(clubId, updateData);
        res.json({ success: true, message: 'Club settings updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Join Requests
// ============================================

export const createJoinRequest = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { message } = req.body;

        // Check if user is already a member
        if (await model.isClubMember(clubId, userId)) {
            return res.status(409).json({ error: 'Already a member of this club' });
        }

        // Check if user already has a pending request
        const existingRequests = await model.getClubJoinRequests(clubId, 'pending');
        const hasPendingRequest = existingRequests.some((req: any) => req.user_id === userId);

        if (hasPendingRequest) {
            return res.status(409).json({ error: 'Join request already pending' });
        }

        const result = await model.createJoinRequest(clubId, userId, message || '');
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Join request created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getJoinRequests = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { status } = req.query;

        // Check if user has permission to view join requests
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const requests = await model.getClubJoinRequests(clubId, (status as string) || 'pending');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const approveJoinRequest = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const requestId = parseInt(req.params.requestId!);
        const userId = req.user?.userId!;

        // Check if user has permission to approve requests
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const joinRequest = await model.getJoinRequest(requestId) as any;
        if (!joinRequest) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        if (joinRequest.club_id !== clubId) {
            return res.status(400).json({ error: 'Join request does not belong to this club' });
        }

        // Update request status
        await model.updateJoinRequest(requestId, 'approved', userId);

        // Add user to club members
        await model.addHubMember(clubId, joinRequest.user_id, 'member');

        res.json({ success: true, message: 'Join request approved' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const rejectJoinRequest = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const requestId = parseInt(req.params.requestId!);
        const userId = req.user?.userId!;

        // Check if user has permission to reject requests
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const joinRequest = await model.getJoinRequest(requestId) as any;
        if (!joinRequest) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        if (joinRequest.club_id !== clubId) {
            return res.status(400).json({ error: 'Join request does not belong to this club' });
        }

        // Update request status
        await model.updateJoinRequest(requestId, 'rejected', userId);

        res.json({ success: true, message: 'Join request rejected' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Club Posts
// ============================================

export const createPost = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { title, content, type } = req.body;

        // Check if user is a club member
        if (!(await model.isClubMember(clubId, userId))) {
            return res.status(403).json({ error: 'Must be a club member to create posts' });
        }

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const validTypes = ['general', 'announcement', 'discussion'];
        const postType = type && validTypes.includes(type) ? type : 'general';

        const result = await model.createClubPost(clubId, userId, title || '', content, postType);
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Post created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if user is a club member
        if (!(await model.isClubMember(clubId, userId))) {
            return res.status(403).json({ error: 'Must be a club member to view posts' });
        }

        const posts = await model.getClubPosts(clubId);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const postId = parseInt(req.params.postId!);
        const userId = req.user?.userId!;

        const post = await model.getClubPost(postId) as any;
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.club_id !== clubId) {
            return res.status(400).json({ error: 'Post does not belong to this club' });
        }

        // Only author or moderators can update posts
        if (post.author_id !== userId && !(await model.canManagePosts(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const { title, content, type } = req.body;
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (type !== undefined) {
            const validTypes = ['general', 'announcement', 'discussion'];
            if (validTypes.includes(type)) {
                updateData.type = type;
            }
        }

        await model.updateClubPost(postId, updateData);
        res.json({ success: true, message: 'Post updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const postId = parseInt(req.params.postId!);
        const userId = req.user?.userId!;

        const post = await model.getClubPost(postId) as any;
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.club_id !== clubId) {
            return res.status(400).json({ error: 'Post does not belong to this club' });
        }

        // Only author or moderators can delete posts
        if (post.author_id !== userId && !(await model.canManagePosts(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        await model.deleteClubPost(postId);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const pinPost = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const postId = parseInt(req.params.postId!);
        const userId = req.user?.userId!;
        const { pinned } = req.body;

        // Only moderators and above can pin posts
        if (!(await model.canManagePosts(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const post = await model.getClubPost(postId) as any;
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.club_id !== clubId) {
            return res.status(400).json({ error: 'Post does not belong to this club' });
        }

        await model.pinClubPost(postId, pinned);
        res.json({ success: true, message: `Post ${pinned ? 'pinned' : 'unpinned'} successfully` });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Club Events
// ============================================

export const createClubEvent = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { event_id, visibility, target_audience } = req.body;

        // Only admins and leaders can create club events
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        if (!event_id) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        const validVisibilities = ['public', 'members_only', 'private'];
        const eventVisibility = visibility && validVisibilities.includes(visibility) ? visibility : 'public';

        const result = await model.createClubEvent(event_id, clubId, eventVisibility, target_audience || '');
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Club event created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getClubEvents = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        const isMember = await model.isClubMember(clubId, userId);
        const canManage = await model.canManageMembers(clubId, userId);

        let events = await model.getClubEvents(clubId);

        // Filter events based on visibility and user role
        events = events.filter((event: any) => {
            if (event.visibility === 'public') return true;
            if (event.visibility === 'members_only' && isMember) return true;
            if (event.visibility === 'private' && canManage) return true;
            return false;
        });

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateEventVisibility = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const eventId = parseInt(req.params.eventId!);
        const userId = req.user?.userId!;
        const { visibility } = req.body;

        // Only admins and leaders can update event visibility
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const validVisibilities = ['public', 'members_only', 'private'];
        if (!visibility || !validVisibilities.includes(visibility)) {
            return res.status(400).json({ error: 'Invalid visibility value' });
        }

        await model.updateClubEventVisibility(eventId, visibility);
        res.json({ success: true, message: 'Event visibility updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Membership Management
// ============================================

export const getClubMembers = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if user is a club member or has management permissions
        const isMember = await model.isClubMember(clubId, userId);
        const canManage = await model.canManageMembers(clubId, userId);

        if (!isMember && !canManage) {
            return res.status(403).json({ error: 'Must be a club member to view members' });
        }

        const members = await model.getHubMembers(clubId);
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const checkClubMembership = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const targetUserId = parseInt(req.params.userId!);
        const membership = await model.checkHubMembership(clubId, targetUserId);
        res.json(membership || { isMember: false });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const addClubMember = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { user_id, role } = req.body;

        // Only leaders and admins can directly add members
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Check if user is already a member
        if (await model.isClubMember(clubId, user_id)) {
            return res.status(409).json({ error: 'User is already a member' });
        }

        await model.addHubMember(clubId, user_id, role || 'member');
        res.status(201).json({ success: true, message: 'Member added successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const removeClubMember = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { user_id } = req.body;

        // Only leaders and admins can remove members
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Check if target user is a member
        if (!(await model.isClubMember(clubId, user_id))) {
            return res.status(404).json({ error: 'User is not a member' });
        }

        // Prevent removing the leader
        const targetRole = await model.getUserClubRole(clubId, user_id);
        if (targetRole === 'leader') {
            return res.status(400).json({ error: 'Cannot remove the club leader' });
        }

        await model.removeHubMember(clubId, user_id);
        res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const joinPublicClub = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if club exists and is public
        const settings = await model.getClubSettings(clubId) as any;
        if (!settings) {
            return res.status(404).json({ error: 'Club not found' });
        }

        if (settings.is_private) {
            return res.status(400).json({ error: 'Cannot join private club directly. Please send a join request.' });
        }

        // Check if already a member
        if (await model.isClubMember(clubId, userId)) {
            return res.status(409).json({ error: 'Already a member of this club' });
        }

        // Add user as member
        await model.addHubMember(clubId, userId, 'member');
        res.status(201).json({ success: true, message: 'Joined club successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const leaveClub = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if user is a member
        if (!(await model.isClubMember(clubId, userId))) {
            return res.status(400).json({ error: 'Not a member of this club' });
        }

        // Check if user is the leader
        const role = await model.getUserClubRole(clubId, userId);
        if (role === 'leader') {
            return res.status(400).json({ error: 'Club leader cannot leave. Please transfer leadership first.' });
        }

        await model.removeHubMember(clubId, userId);
        res.json({ success: true, message: 'Left club successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const targetUserId = parseInt(req.params.userId!);
        const userId = req.user?.userId!;
        const { role } = req.body;

        // Only leaders and admins can update roles
        if (!(await model.canManageMembers(clubId, userId))) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Validate role
        const validRoles = ['member', 'moderator', 'admin', 'leader'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if target user is a member
        if (!(await model.isClubMember(clubId, targetUserId))) {
            return res.status(404).json({ error: 'User is not a member of this club' });
        }

        // Only leader can assign leader role
        const currentUserRole = await model.getUserClubRole(clubId, userId);
        if (role === 'leader' && currentUserRole !== 'leader') {
            return res.status(403).json({ error: 'Only the current leader can assign leadership' });
        }

        // Update role by removing and re-adding member
        await model.removeHubMember(clubId, targetUserId);
        await model.addHubMember(clubId, targetUserId, role);

        res.json({ success: true, message: 'Member role updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteClub = async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Only the leader can delete the club
        const userRole = await model.getUserClubRole(clubId, userId);
        if (userRole !== 'leader') {
            return res.status(403).json({ error: 'Only the club leader can delete the club' });
        }

        // Delete the club (CASCADE will handle related records)
        await model.deleteHub(clubId);
        res.json({ success: true, message: 'Club deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};
