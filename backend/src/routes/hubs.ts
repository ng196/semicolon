import { Router } from 'express';
import * as hubController from '../controllers/hubs.js';

const router = Router();

router.post('/', hubController.createHub);
router.get('/', hubController.getAllHubs);
router.get('/:id', hubController.getHub);
router.put('/:id', hubController.updateHub);
router.delete('/:id', hubController.deleteHub);
router.get('/:id/members', hubController.getHubMembers);
router.get('/:id/members/:userId/check', hubController.checkMembership);
router.post('/:id/members', hubController.addMember);
router.delete('/:id/members', hubController.removeMember);

export default router;
