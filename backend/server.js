import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import swaggerSpec from './config/swagger.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import layoutRoutes from './routes/layoutRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

/* ------------------------------------------------------------------ */
/* Security & Core Middleware                                         */
/* ------------------------------------------------------------------ */

app.use(helmet());

// 1. Configure CORS to use the CLIENT_ORIGIN environment variable
const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
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

// Global API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', apiLimiter);

// Target limit for computationally demanding AI infrastructure
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI generation rate limit exceeded. Please try again in an hour.' },
});
app.use('/api/v1/ai', aiLimiter);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ------------------------------------------------------------------ */
/* Documentation & Health                                             */
/* ------------------------------------------------------------------ */

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'eventvista-api-gateway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/* ------------------------------------------------------------------ */
/* Route Mounting                                                     */
/* ------------------------------------------------------------------ */

const userRoutes = require('./routes/userRoutes'); // Adjust path if your routes file is named differently
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/layouts', layoutRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/* Process Safety & Execution Guards                                  */
/* ------------------------------------------------------------------ */

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (err) => {
  // If it's a port collision issue, let the server's error event context handle it gracefully instead of abruptly exiting
  if (err.code === 'EADDRINUSE') return; 
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});

/* ------------------------------------------------------------------ */
/* Server Initialization Sequence                                      */
/* ------------------------------------------------------------------ */

const startAppServer = async () => {
  try {
    // Await connection cleanly within the startup chain
    await connectDB();

    let preferredPort = parseInt(process.env.PORT, 10) || 5000;
    
    const startListener = (port) => {
      const server = app.listen(port, () => {
        console.log(`[Eventvista API Gateway] Running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
      });

      // Catch EADDRINUSE explicitly on the listener layer
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.warn(`[Warning] Port ${port} is currently locked or in use. Trying port ${port + 1}...`);
          startListener(port + 1);
        } else {
          console.error('[Server Error]', error);
          process.exit(1);
        }
      });
    };

    startListener(preferredPort);

  } catch (dbError) {
    console.error('[Critical Error] System failed to connect to database:', dbError.message);
    process.exit(1);
  }
};

startAppServer();

export default app;