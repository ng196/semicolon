import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/users.js';
import hubRoutes from './src/routes/hubs.js';
import eventRoutes from './src/routes/events.js';
import marketplaceRoutes from './src/routes/marketplace.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/users', userRoutes);
app.use('/hubs', hubRoutes);
app.use('/events', eventRoutes);
app.use('/marketplace', marketplaceRoutes);

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
