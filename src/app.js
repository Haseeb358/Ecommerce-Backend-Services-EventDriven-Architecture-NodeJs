import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import { container } from './config/container.js';
import { createRoutes } from './routes/index.js';



export function createApp() {
  dotenv.config();
  const app = express();
 
   // --- Security & core middleware ---
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(cookieParser());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // --- Routes ---
   app.use('/api/v1', createRoutes(container));

  // --- Health check (build this first, confirm the server boots) ---
  app.get('/info', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
  });

  // --- Error handling middleware ---
  app.use(notFound);
  app.use(errorHandler);
 
 return app;
}