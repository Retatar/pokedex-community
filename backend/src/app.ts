import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { globalLimiter } from './middlewares/rateLimiter';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import reviewRoutes from './routes/reviews.routes';
import notificationRoutes from './routes/notifications.routes';
import favoriteRoutes from './routes/favorites.routes';
import teamRoutes from './routes/teams.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(globalLimiter);

app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/favorites', favoriteRoutes);
app.use('/v1/teams', teamRoutes);
app.use('/v1/reviews', reviewRoutes);
app.use('/v1/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
