import express from 'express';
import cors from 'cors';
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

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    /^http:\/\/192\.168\.\d+\.\d+:8080$/, // Local network IPs
    /^http:\/\/10\.\d+\.\d+\.\d+:8080$/,  // Private network IPs
    /^https:\/\/.*\.ngrok\.io$/,           // ngrok URLs
    /^https:\/\/.*\.ngrok-free\.app$/,     // ngrok free URLs
    /^https:\/\/.*\.ngrok\.app$/,          // ngrok app URLs
    'https://4a4d6b5803f2.ngrok-free.app' // Your specific ngrok URL
  ],
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

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
