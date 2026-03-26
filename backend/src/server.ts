import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import billRoutes from './routes/bill.routes';
import paymentRoutes from './routes/payment.routes';
import serviceRoutes from './routes/service.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === 'production' 
        ? [env.FRONTEND_URL || 'https://your-vercel-domain.vercel.app'] 
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/bills', billRoutes);
app.use('/payments', paymentRoutes);
app.use('/requests', serviceRoutes);
app.use('/admin', adminRoutes);
app.use('/public', publicRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${env.NODE_ENV} mode`);
});
