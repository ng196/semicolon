import { Router } from 'express';
import * as eventController from '../controllers/events.js';

const router = Router();

router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

export default router;
