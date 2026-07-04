import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import layoutRoutes from './routes/layoutRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Establish the database connection before the app starts accepting traffic.
await connectDB();

const app = express();

/* ------------------------------------------------------------------ */
/* Security middleware                                                */
/* ------------------------------------------------------------------ */

// Sets a range of protective HTTP headers (CSP, X-Frame-Options, etc.).
app.use(helmet());

// Restricts cross-origin requests to the configured client origin only.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, Postman) which send no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// Global rate limit: 300 requests per 15 minutes per IP across the API surface.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', apiLimiter);

// A tighter limit specifically for the AI generation endpoint, since each
// call is expensive (Groq + TRELLIS inference costs).
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI generation rate limit exceeded. Please try again in an hour.' },
});
app.use('/api/v1/ai', aiLimiter);

/* ------------------------------------------------------------------ */
/* Body parsing and logging                                           */
/* ------------------------------------------------------------------ */

// Raised limit to accommodate base64-encoded venue photos sent to the AI pipeline.
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ------------------------------------------------------------------ */
/* Health check                                                       */
/* ------------------------------------------------------------------ */

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'eventvista-api-gateway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/* ------------------------------------------------------------------ */
/* Route mounting                                                     */
/* ------------------------------------------------------------------ */

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/layouts', layoutRoutes);
app.use('/api/v1/ai', aiRoutes);

/* ------------------------------------------------------------------ */
/* Error handling (must be registered last)                           */
/* ------------------------------------------------------------------ */

app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/* Process-level safety nets                                          */
/* ------------------------------------------------------------------ */

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Eventvista API Gateway] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
