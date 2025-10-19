import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import hubRoutes from './src/routes/hubs.js';
import eventRoutes from './src/routes/events.js';
import marketplaceRoutes from './src/routes/marketplace.js';
import requestRoutes from './src/routes/requests.js';
import { authMiddleware } from './src/middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',
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

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
