/**
 * Image Controller with Role-Based Access Control
 * Handles HTTP requests for image upload, retrieval, and management
 * Uses unified ImageManager with comprehensive access control
 */

import { Request, Response } from 'express';
import { imageManager, ImageUploadOptions, ImageRetrievalOptions } from '../models/images.js';
import {
    imageAccessManager,
    ImageType,
    createImageWithAccess,
    checkImageAccess,
    getUserImages
} from '../models/image-access.js';

/**
 * Upload image endpoint
 * POST /images/upload
 * 
 * Body (multipart/form-data or JSON):
 * - file: File data (File, Blob, base64, or Buffer)
 * - provider?: 'cloudinary' | 'supabase' (optional, defaults to cloudinary)
 * - folder?: string (optional)
 * - public_id?: string (optional)
 * - tags?: string[] (optional)
 * - context?: object (optional metadata)
 * - quality?: 'auto' | number (optional)
 * - format?: 'auto' | 'jpg' | 'png' | 'webp' (optional)
 */
export const uploadImage = async (req: Request, res: Response) => {
    try {
        const {
            provider = 'cloudinary',
            folder,
            public_id,
            tags,
            context,
            quality,
            format,
            transformation
        } = req.body;

        // Handle file from different sources
        let file: any;

        if (req.file) {
            // Multer file upload
            file = req.file.buffer || req.file;
        } else if (req.body.file) {
            // Base64 or direct file data
            file = req.body.file;
        } else {
            return res.status(400).json({
                error: 'No file provided',
                message: 'Please provide a file in the request body or as multipart upload'
            });
        }

        // Prepare upload options
        const uploadOptions: ImageUploadOptions & { provider?: 'cloudinary' | 'supabase' } = {
            provider: provider as 'cloudinary' | 'supabase',
            folder,
            public_id,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
            context: context ? (typeof context === 'string' ? JSON.parse(context) : context) : undefined,
            quality: quality === 'auto' ? 'auto' : (quality ? parseInt(quality) : undefined),
            format: format as 'auto' | 'jpg' | 'png' | 'webp',
            transformation
        };

        // Upload image
        const result = await imageManager.uploadImage(file, uploadOptions);

        // Generate common variants for response
        const variants = imageManager.generateImageVariants(result.public_id, provider);

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                ...result,
                variants
            }
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            message: (error as Error).message
        });
    }
};

/**
 * Get image URL with transformations
 * GET /images/:publicId
 * 
 * Query parameters:
 * - provider?: 'cloudinary' | 'supabase'
 * - width?: number
 * - height?: number
 * - crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'pad'
 * - quality?: 'auto' | number
 * - format?: 'auto' | 'jpg' | 'png' | 'webp'
 * - effects?: string (comma-separated effects)
 * - redirect?: boolean (if true, redirects to image URL)
 */
export const getImage = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;
        const {
            provider = 'cloudinary',
            width,
            height,
            crop = 'fill',
            quality,
            format,
            effects,
            redirect = false
        } = req.query;

        if (!publicId) {
            return res.status(400).json({
                error: 'Missing public ID',
                message: 'Please provide a valid image public ID'
            });
        }

        // Prepare retrieval options
        const retrievalOptions: ImageRetrievalOptions & { provider?: 'cloudinary' | 'supabase' } = {
            provider: provider as 'cloudinary' | 'supabase',
            width: width ? parseInt(width as string) : undefined,
            height: height ? parseInt(height as string) : undefined,
            crop: crop as 'fill' | 'fit' | 'scale' | 'thumb' | 'pad',
            quality: quality === 'auto' ? 'auto' : (quality ? parseInt(quality as string) : undefined),
            format: format as 'auto' | 'jpg' | 'png' | 'webp',
            effects: effects ? (effects as string).split(',') : undefined
        };

        // Get image URL
        const imageUrl = await imageManager.getImageUrl(publicId, retrievalOptions);

        if (redirect === 'true' || redirect === true) {
            // Redirect to the actual image
            res.redirect(imageUrl);
        } else {
            // Return JSON response with URL
            res.json({
                success: true,
                data: {
                    public_id: publicId,
                    url: imageUrl,
                    provider,
                    transformations: retrievalOptions
                }
            });
        }

    } catch (error) {
        console.error('Image retrieval error:', error);
        res.status(500).json({
            error: 'Retrieval failed',
            message: (error as Error).message
        });
    }
};

/**
 * Get multiple image variants
 * GET /images/:publicId/variants
 * 
 * Query parameters:
 * - provider?: 'cloudinary' | 'supabase'
 */
export const getImageVariants = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;
        const { provider = 'cloudinary' } = req.query;

        if (!publicId) {
            return res.status(400).json({
                error: 'Missing public ID',
                message: 'Please provide a valid image public ID'
            });
        }

        // Generate all common variants
        const variants = imageManager.generateImageVariants(
            publicId,
            provider as 'cloudinary' | 'supabase'
        );

        res.json({
            success: true,
            data: {
                public_id: publicId,
                provider,
                variants
            }
        });

    } catch (error) {
        console.error('Image variants error:', error);
        res.status(500).json({
            error: 'Variants generation failed',
            message: (error as Error).message
        });
    }
};

/**
 * Delete image
 * DELETE /images/:publicId
 * 
 * Query parameters:
 * - provider?: 'cloudinary' | 'supabase'
 */
export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;
        const { provider = 'cloudinary' } = req.query;

        if (!publicId) {
            return res.status(400).json({
                error: 'Missing public ID',
                message: 'Please provide a valid image public ID'
            });
        }

        // Delete image
        const success = await imageManager.deleteImage(
            publicId,
            provider as 'cloudinary' | 'supabase'
        );

        if (success) {
            res.json({
                success: true,
                message: 'Image deleted successfully',
                data: {
                    public_id: publicId,
                    provider
                }
            });
        } else {
            res.status(500).json({
                error: 'Deletion failed',
                message: 'Could not delete the image'
            });
        }

    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            error: 'Deletion failed',
            message: (error as Error).message
        });
    }
};

/**
 * Transform image URL (synchronous)
 * POST /images/transform
 * 
 * Body:
 * - public_id: string (required)
 * - provider?: 'cloudinary' | 'supabase'
 * - transformations: object (width, height, crop, quality, format, effects)
 */
export const transformImage = async (req: Request, res: Response) => {
    try {
        const {
            public_id,
            provider = 'cloudinary',
            transformations = {}
        } = req.body;

        if (!public_id) {
            return res.status(400).json({
                error: 'Missing public ID',
                message: 'Please provide a valid image public ID'
            });
        }

        // Generate transformed URL
        const transformedUrl = imageManager.transformImage(public_id, {
            ...transformations,
            provider: provider as 'cloudinary' | 'supabase'
        });

        res.json({
            success: true,
            data: {
                public_id,
                provider,
                original_url: imageManager.transformImage(public_id, { provider }),
                transformed_url: transformedUrl,
                transformations
            }
        });

    } catch (error) {
        console.error('Image transformation error:', error);
        res.status(500).json({
            error: 'Transformation failed',
            message: (error as Error).message
        });
    }
};

/**
 * Batch upload multiple images
 * POST /images/batch-upload
 * 
 * Body:
 * - files: Array of file data
 * - options?: Upload options to apply to all files
 */
export const batchUploadImages = async (req: Request, res: Response) => {
    try {
        const { files, options = {} } = req.body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                error: 'No files provided',
                message: 'Please provide an array of files to upload'
            });
        }

        // Upload all files
        const uploadPromises = files.map(file =>
            imageManager.uploadImage(file, options)
        );

        const results = await Promise.allSettled(uploadPromises);

        // Separate successful and failed uploads
        const successful: any[] = [];
        const failed: any[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successful.push({
                    index,
                    data: result.value,
                    variants: imageManager.generateImageVariants(result.value.public_id, options.provider)
                });
            } else {
                failed.push({
                    index,
                    error: result.reason.message
                });
            }
        });

        res.status(successful.length > 0 ? 201 : 500).json({
            success: successful.length > 0,
            message: `Uploaded ${successful.length}/${files.length} images successfully`,
            data: {
                successful,
                failed,
                total: files.length,
                success_count: successful.length,
                failure_count: failed.length
            }
        });

    } catch (error) {
        console.error('Batch upload error:', error);
        res.status(500).json({
            error: 'Batch upload failed',
            message: (error as Error).message
        });
    }
};

/**
 * Get image provider status
 * GET /images/status
 */
export const getProviderStatus = async (req: Request, res: Response) => {
    try {
        const providers = imageManager.getAvailableProviders();

        res.json({
            success: true,
            data: {
                available_providers: providers,
                default_provider: 'cloudinary', // This could be made configurable
                cloudinary: {
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                    configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET)
                },
                supabase: {
                    url: process.env.SUPABASE_URL,
                    configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
                }
            }
        });

    } catch (error) {
        console.error('Provider status error:', error);
        res.status(500).json({
            error: 'Status check failed',
            message: (error as Error).message
        });
    }
};