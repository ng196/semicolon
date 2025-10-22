import { Router } from 'express';
import * as rsvpController from '../controllers/rsvps.js';

const router = Router();

router.post('/', rsvpController.createOrUpdateRSVP);
router.get('/event/:eventId', rsvpController.getEventRSVPs);
router.get('/event/:eventId/user', rsvpController.getUserRSVP);

export default router;
