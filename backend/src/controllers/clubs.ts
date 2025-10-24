import { Request, Response } from 'express';
import * as model from '../models/index.js';

// ============================================
// Club Settings
// ============================================

export const getClubSettings = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const settings = model.getClubSettings(clubId);

        if (!settings) {
            return res.status(404).json({ error: 'Club settings not found' });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateClubSettings = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId;

        // Check if user has permission to update settings
        if (!model.canManageMembers(clubId, userId!)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const { is_private, auto_approve_members } = req.body;
        const updateData: any = {};

        if (is_private !== undefined) updateData.is_private = is_private ? 1 : 0;
        if (auto_approve_members !== undefined) updateData.auto_approve_members = auto_approve_members ? 1 : 0;

        model.updateClubSettings(clubId, updateData);
        res.json({ success: true, message: 'Club settings updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Join Requests
// ============================================

export const createJoinRequest = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { message } = req.body;

        // Check if user is already a member
        if (model.isClubMember(clubId, userId)) {
            return res.status(409).json({ error: 'Already a member of this club' });
        }

        // Check if user already has a pending request
        const existingRequests = model.getClubJoinRequests(clubId, 'pending');
        const hasPendingRequest = existingRequests.some((req: any) => req.user_id === userId);

        if (hasPendingRequest) {
            return res.status(409).json({ error: 'Join request already pending' });
        }

        const result = model.createJoinRequest(clubId, userId, message || '');
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Join request created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getJoinRequests = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { status } = req.query;

        // Check if user has permission to view join requests
        if (!model.canManageMembers(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const requests = model.getClubJoinRequests(clubId, (status as string) || 'pending');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const approveJoinRequest = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const requestId = parseInt(req.params.requestId!);
        const userId = req.user?.userId!;

        // Check if user has permission to approve requests
        if (!model.canManageMembers(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const joinRequest = model.getJoinRequest(requestId) as any;
        if (!joinRequest) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        if (joinRequest.club_id !== clubId) {
            return res.status(400).json({ error: 'Join request does not belong to this club' });
        }

        // Update request status
        model.updateJoinRequest(requestId, 'approved', userId);

        // Add user to club members
        model.addHubMember(clubId, joinRequest.user_id, 'member');

        res.json({ success: true, message: 'Join request approved' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const rejectJoinRequest = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const requestId = parseInt(req.params.requestId!);
        const userId = req.user?.userId!;

        // Check if user has permission to reject requests
        if (!model.canManageMembers(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const joinRequest = model.getJoinRequest(requestId) as any;
        if (!joinRequest) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        if (joinRequest.club_id !== clubId) {
            return res.status(400).json({ error: 'Join request does not belong to this club' });
        }

        // Update request status
        model.updateJoinRequest(requestId, 'rejected', userId);

        res.json({ success: true, message: 'Join request rejected' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Club Posts
// ============================================

export const createPost = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { title, content, type } = req.body;

        // Check if user is a club member
        if (!model.isClubMember(clubId, userId)) {
            return res.status(403).json({ error: 'Must be a club member to create posts' });
        }

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const validTypes = ['general', 'announcement', 'discussion'];
        const postType = type && validTypes.includes(type) ? type : 'general';

        const result = model.createClubPost(clubId, userId, title || '', content, postType);
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Post created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getPosts = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if user is a club member
        if (!model.isClubMember(clubId, userId)) {
            return res.status(403).json({ error: 'Must be a club member to view posts' });
        }

        const posts = model.getClubPosts(clubId);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updatePost = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const postId = parseInt(req.params.postId!);
        const userId = req.user?.userId!;

        const post = model.getClubPost(postId) as any;
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.club_id !== clubId) {
            return res.status(400).json({ error: 'Post does not belong to this club' });
        }

        // Only author or moderators can update posts
        if (post.author_id !== userId && !model.canManagePosts(clubId, userId)) {
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

        model.updateClubPost(postId, updateData);
        res.json({ success: true, message: 'Post updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deletePost = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const postId = parseInt(req.params.postId!);
        const userId = req.user?.userId!;

        const post = model.getClubPost(postId) as any;
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.club_id !== clubId) {
            return res.status(400).json({ error: 'Post does not belong to this club' });
        }

        // Only author or moderators can delete posts
        if (post.author_id !== userId && !model.canManagePosts(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        model.deleteClubPost(postId);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const pinPost = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const postId = parseInt(req.params.postId!);
        const userId = req.user?.userId!;
        const { pinned } = req.body;

        // Only moderators and above can pin posts
        if (!model.canManagePosts(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const post = model.getClubPost(postId) as any;
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.club_id !== clubId) {
            return res.status(400).json({ error: 'Post does not belong to this club' });
        }

        model.pinClubPost(postId, pinned);
        res.json({ success: true, message: `Post ${pinned ? 'pinned' : 'unpinned'} successfully` });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Club Events
// ============================================

export const createClubEvent = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;
        const { event_id, visibility, target_audience } = req.body;

        // Only admins and leaders can create club events
        if (!model.canManageMembers(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        if (!event_id) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        const validVisibilities = ['public', 'members_only', 'private'];
        const eventVisibility = visibility && validVisibilities.includes(visibility) ? visibility : 'public';

        const result = model.createClubEvent(event_id, clubId, eventVisibility, target_audience || '');
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Club event created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getClubEvents = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        const isMember = model.isClubMember(clubId, userId);
        const canManage = model.canManageMembers(clubId, userId);

        let events = model.getClubEvents(clubId);

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

export const updateEventVisibility = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const eventId = parseInt(req.params.eventId!);
        const userId = req.user?.userId!;
        const { visibility } = req.body;

        // Only admins and leaders can update event visibility
        if (!model.canManageMembers(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const validVisibilities = ['public', 'members_only', 'private'];
        if (!visibility || !validVisibilities.includes(visibility)) {
            return res.status(400).json({ error: 'Invalid visibility value' });
        }

        model.updateClubEventVisibility(eventId, visibility);
        res.json({ success: true, message: 'Event visibility updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};


// ============================================
// Membership Management
// ============================================

export const joinPublicClub = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if club exists and is public
        const settings = model.getClubSettings(clubId) as any;
        if (!settings) {
            return res.status(404).json({ error: 'Club not found' });
        }

        if (settings.is_private) {
            return res.status(400).json({ error: 'Cannot join private club directly. Please send a join request.' });
        }

        // Check if already a member
        if (model.isClubMember(clubId, userId)) {
            return res.status(409).json({ error: 'Already a member of this club' });
        }

        // Add user as member
        model.addHubMember(clubId, userId, 'member');
        res.status(201).json({ success: true, message: 'Joined club successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const leaveClub = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Check if user is a member
        if (!model.isClubMember(clubId, userId)) {
            return res.status(400).json({ error: 'Not a member of this club' });
        }

        // Check if user is the leader
        const role = model.getUserClubRole(clubId, userId);
        if (role === 'leader') {
            return res.status(400).json({ error: 'Club leader cannot leave. Please transfer leadership first.' });
        }

        model.removeHubMember(clubId, userId);
        res.json({ success: true, message: 'Left club successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const updateMemberRole = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const targetUserId = parseInt(req.params.userId!);
        const userId = req.user?.userId!;
        const { role } = req.body;

        // Only leaders and admins can update roles
        if (!model.canManageMembers(clubId, userId)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Validate role
        const validRoles = ['member', 'moderator', 'admin', 'leader'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if target user is a member
        if (!model.isClubMember(clubId, targetUserId)) {
            return res.status(404).json({ error: 'User is not a member of this club' });
        }

        // Only leader can assign leader role
        const currentUserRole = model.getUserClubRole(clubId, userId);
        if (role === 'leader' && currentUserRole !== 'leader') {
            return res.status(403).json({ error: 'Only the current leader can assign leadership' });
        }

        // Update role by removing and re-adding member
        model.removeHubMember(clubId, targetUserId);
        model.addHubMember(clubId, targetUserId, role);

        res.json({ success: true, message: 'Member role updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteClub = (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.id!);
        const userId = req.user?.userId!;

        // Only the leader can delete the club
        const userRole = model.getUserClubRole(clubId, userId);
        if (userRole !== 'leader') {
            return res.status(403).json({ error: 'Only the club leader can delete the club' });
        }

        // Delete the club (CASCADE will handle related records)
        model.deleteHub(clubId);
        res.json({ success: true, message: 'Club deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};
