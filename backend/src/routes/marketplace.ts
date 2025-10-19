import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplace.js';

const router = Router();

router.post('/', marketplaceController.createItem);
router.get('/', marketplaceController.getAllItems);
router.get('/:id', marketplaceController.getItem);
router.put('/:id', marketplaceController.updateItem);
router.delete('/:id', marketplaceController.deleteItem);

export default router;
