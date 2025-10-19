import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'campus-hub-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h'; // 24 hours

// In-memory token whitelist
// Structure: Map<tokenId, {userId, email, issuedAt, expiresAt}>
const tokenWhitelist = new Map<string, TokenMetadata>();

interface TokenMetadata {
    userId: number;
    email: string;
    issuedAt: number;
    expiresAt: number;
}

interface TokenPayload {
    userId: number;
    email: string;
    jti: string; // JWT ID for whitelist tracking
    iat: number;
    exp: number;
}

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * Generate JWT token and add to whitelist
 */
export function generateToken(userId: number, email: string, rememberMe: boolean = false): string {
    const jti = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);

    // Different expiry based on remember me
    const expiresIn = rememberMe
        ? 30 * 24 * 60 * 60  // 30 days if remember me
        : 24 * 60 * 60;      // 24 hours if normal login

    const expiry = rememberMe ? '30d' : '24h';

    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId,
        email,
        jti,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: expiry,
    });

    // Add to whitelist
    tokenWhitelist.set(jti, {
        userId,
        email,
        issuedAt: now,
        expiresAt: now + expiresIn,
    });

    return token;
}

/**
 * Verify token signature and check whitelist
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        // Verify JWT signature and expiration
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        // Check if token exists in whitelist
        const metadata = tokenWhitelist.get(decoded.jti);
        if (!metadata) {
            return null; // Token not in whitelist (logged out or invalid)
        }

        // Check if token is expired (double-check)
        if (metadata.expiresAt < Math.floor(Date.now() / 1000)) {
            tokenWhitelist.delete(decoded.jti); // Clean up expired token
            return null;
        }

        return decoded;
    } catch (error) {
        // Invalid signature or malformed token
        return null;
    }
}

/**
 * Revoke token (remove from whitelist)
 */
export function revokeToken(jti: string): boolean {
    return tokenWhitelist.delete(jti);
}

/**
 * Check if token is in whitelist
 */
export function isTokenActive(jti: string): boolean {
    const metadata = tokenWhitelist.get(jti);
    if (!metadata) return false;

    // Check expiration
    if (metadata.expiresAt < Math.floor(Date.now() / 1000)) {
        tokenWhitelist.delete(jti);
        return false;
    }

    return true;
}

/**
 * Clean up expired tokens (run periodically)
 */
export function cleanupExpiredTokens(): number {
    const now = Math.floor(Date.now() / 1000);
    let cleaned = 0;

    for (const [jti, metadata] of tokenWhitelist.entries()) {
        if (metadata.expiresAt < now) {
            tokenWhitelist.delete(jti);
            cleaned++;
        }
    }

    return cleaned;
}

/**
 * Get whitelist stats (for debugging)
 */
export function getWhitelistStats() {
    return {
        totalTokens: tokenWhitelist.size,
        tokens: Array.from(tokenWhitelist.entries()).map(([jti, metadata]) => ({
            jti,
            userId: metadata.userId,
            email: metadata.email,
            issuedAt: new Date(metadata.issuedAt * 1000).toISOString(),
            expiresAt: new Date(metadata.expiresAt * 1000).toISOString(),
        })),
    };
}

/**
 * Auth middleware - protect routes
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            if (decoded) {
                req.user = decoded;
            }
        }
        next();
    } catch (error) {
        // Silently fail - optional auth
        next();
    }
}

// Start cleanup interval (every 5 minutes)
setInterval(() => {
    const cleaned = cleanupExpiredTokens();
    if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} expired tokens`);
    }
}, 5 * 60 * 1000);

// Log whitelist stats on startup
console.log('Auth middleware initialized with in-memory token whitelist');