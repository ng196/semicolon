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
    id: number; // For compatibility with controllers
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
        ? 1 * 24 * 60 * 60  // 1 day if remember me
        : 1 * 24 * 60 * 60;      // 1 day if normal login

    const expiry = rememberMe ? '1d' : '1d';

    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId,
        id: userId, // For compatibility with controllers
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

    console.log('🟢 Token generated for user:', userId, 'jti:', jti);
    console.log('🟢 Token added to whitelist, size now:', tokenWhitelist.size);

    return token;
}

/**
 * Verify token signature and check whitelist
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        console.log('🔵 Verifying token...');

        // Verify JWT signature and expiration
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        console.log('🔵 JWT signature valid, jti:', decoded.jti);

        // Check if token exists in whitelist
        const metadata = tokenWhitelist.get(decoded.jti);
        console.log('🔵 Token in whitelist:', !!metadata);
        console.log('🔵 Whitelist size:', tokenWhitelist.size);

        if (!metadata) {
            console.log('🔴 Token not in whitelist - may have been cleared on server restart');
            return null; // Token not in whitelist (logged out or invalid)
        }

        // Check if token is expired (double-check)
        const now = Math.floor(Date.now() / 1000);
        console.log('🔵 Token expiry check - now:', now, 'expires:', metadata.expiresAt);
        if (metadata.expiresAt < now) {
            console.log('🔴 Token expired');
            tokenWhitelist.delete(decoded.jti); // Clean up expired token
            return null;
        }

        console.log('🟢 Token verification successful');
        return decoded;
    } catch (error) {
        console.log('🔴 Token verification failed:', error instanceof Error ? error.message : error);
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
        console.log('🔵 Auth middleware - URL:', req.method, req.path);

        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('🔵 Auth header exists:', !!authHeader);
        console.log('🔵 Auth header preview:', authHeader ? authHeader.substring(0, 20) + '...' : 'null');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('🔴 No valid auth header found');
            // Test bypass for development
            if (req.headers['x-test-auth'] === 'test-token') {
                req.user = { userId: 1, id: 1, email: 'test@test.com', jti: 'test', iat: 0, exp: 0 };
                console.log('🟢 Test bypass activated for user 1');
                return next();
            }
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('🔵 Extracted token preview:', token.substring(0, 20) + '...');

        // Verify token
        const decoded = verifyToken(token);
        console.log('🔵 Token verification result:', !!decoded);
        if (!decoded) {
            console.log('🔴 Token verification failed');
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        console.log('🟢 Auth successful for user:', decoded.userId);
        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('🔴 Auth middleware error:', error);
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