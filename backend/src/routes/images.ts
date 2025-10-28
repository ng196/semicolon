/**
 * Image Routes
 * RESTful API endpoints for image management
 */

import { Router } from 'express';
import multer from 'multer';
import * as imageController from '../controllers/images.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Max 10 files per request
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Image upload endpoints
router.post('/upload', upload.single('file'), imageController.uploadImage);
router.post('/batch-upload', upload.array('files', 10), imageController.batchUploadImages);

// Image retrieval endpoints
router.get('/status', imageController.getProviderStatus);
router.get('/:publicId', imageController.getImage);
router.get('/:publicId/variants', imageController.getImageVariants);

// Image transformation endpoint
router.post('/transform', imageController.transformImage);

// Image deletion endpoint
router.delete('/:publicId', imageController.deleteImage);

export default router;