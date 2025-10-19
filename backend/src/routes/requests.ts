import { Router } from 'express';
import { getAllRequests, getRequest, createRequest, updateRequest, deleteRequest } from '../controllers/requests.js';

const router = Router();

router.get('/', getAllRequests);
router.get('/:id', getRequest);
router.post('/', createRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

export default router;
