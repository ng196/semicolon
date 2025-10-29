/**
 * Project routes - role-based project management API
 * These endpoints serve mock data and can be easily replaced with real database calls
 */

import { Router } from 'express';
import * as projectController from '../controllers/projects.js';

const router = Router();

// Project CRUD operations
router.get('/', projectController.getUserProjects);
router.get('/:id', projectController.getProjectDetails);
router.get('/:id/members', projectController.getProjectMembers);
router.get('/:id/members/:userId/role', projectController.getUserRole);

// Join request management
router.get('/:id/join-requests', projectController.getJoinRequests);
router.post('/:id/join-requests', projectController.createJoinRequest);
router.post('/:id/join-requests/:requestId/approve', projectController.approveJoinRequest);
router.post('/:id/join-requests/:requestId/reject', projectController.rejectJoinRequest);

// Member management
router.delete('/:id/members/leave', projectController.leaveProject);

// Activity tracking
router.get('/:id/activity', projectController.getProjectActivity);

export default router;