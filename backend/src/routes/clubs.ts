import { Router } from 'express';
import * as clubController from '../controllers/clubs.js';

const router = Router();

// Club settings
router.get('/:id/settings', clubController.getClubSettings);
router.put('/:id/settings', clubController.updateClubSettings);

// Join requests
router.post('/:id/join-requests', clubController.createJoinRequest);
router.get('/:id/join-requests', clubController.getJoinRequests);
router.put('/:id/join-requests/:requestId/approve', clubController.approveJoinRequest);
router.put('/:id/join-requests/:requestId/reject', clubController.rejectJoinRequest);

// Club posts
router.post('/:id/posts', clubController.createPost);
router.get('/:id/posts', clubController.getPosts);
router.put('/:id/posts/:postId', clubController.updatePost);
router.delete('/:id/posts/:postId', clubController.deletePost);
router.put('/:id/posts/:postId/pin', clubController.pinPost);

// Club events
router.post('/:id/events', clubController.createClubEvent);
router.get('/:id/events', clubController.getClubEvents);
router.put('/:id/events/:eventId/visibility', clubController.updateEventVisibility);

// Membership
router.post('/:id/join', clubController.joinPublicClub);
router.delete('/:id/leave', clubController.leaveClub);
router.put('/:id/members/:userId/role', clubController.updateMemberRole);

export default router;
