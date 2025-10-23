import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import hubRoutes from './src/routes/hubs.js';
import eventRoutes from './src/routes/events.js';
import marketplaceRoutes from './src/routes/marketplace.js';
import requestRoutes from './src/routes/requests.js';
import clubRoutes from './src/routes/clubs.js';
import rsvpRoutes from './src/routes/rsvps.js';
import { authMiddleware } from './src/middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration from environment variables
const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    /^http:\/\/192\.168\.\d+\.\d+:8080$/, // Local network IPs
    /^http:\/\/10\.\d+\.\d+\.\d+:8080$/,  // Private network IPs
    /^https:\/\/.*\.ngrok\.io$/,           // ngrok URLs
    /^https:\/\/.*\.ngrok-free\.app$/,     // ngrok free URLs
    /^https:\/\/.*\.ngrok\.app$/,          // ngrok app URLs
  ];

  // Add origins from environment variable
  const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : [];

  // Debug logging
  console.log('🔍 CORS Debug Info:');
  console.log('📝 Raw CORS_ORIGINS env var:', process.env.CORS_ORIGINS);
  console.log('📋 Parsed env origins:', envOrigins);
  console.log('🌐 All allowed origins:', [...defaultOrigins, ...envOrigins]);

  return [...defaultOrigins, ...envOrigins];
};

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    console.log('🔍 CORS Request Debug:');
    console.log('📍 Request origin:', origin);
    console.log('✅ Allowed origins:', allowedOrigins);

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    console.log('🎯 Origin allowed:', isAllowed);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth routes (public - no auth required)
app.use('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/users', authMiddleware, userRoutes);
app.use('/hubs', authMiddleware, hubRoutes);
app.use('/events', authMiddleware, eventRoutes);
app.use('/marketplace', authMiddleware, marketplaceRoutes);
app.use('/requests', authMiddleware, requestRoutes);
app.use('/clubs', authMiddleware, clubRoutes);
app.use('/rsvps', authMiddleware, rsvpRoutes);

// Debug endpoint to check CORS origins (must be before wildcard route)
app.get('/debug/cors', (req, res) => {
  const allowedOrigins = getAllowedOrigins();
  res.json({
    corsOrigins: process.env.CORS_ORIGINS,
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin
  });
});

// Serve static files from frontend dist (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle client-side routing - serve index.html for non-API routes
  app.get('/*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/users') ||
      req.path.startsWith('/hubs') ||
      req.path.startsWith('/events') ||
      req.path.startsWith('/marketplace') ||
      req.path.startsWith('/requests') ||
      req.path.startsWith('/clubs') ||
      req.path.startsWith('/rsvps') ||
      req.path.startsWith('/debug')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Health check endpoint for development
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'CampusHub API is running',
      timestamp: new Date().toISOString()
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
