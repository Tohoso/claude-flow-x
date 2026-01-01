import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import apiRoutes from './routes';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: config.corsOrigin,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, _res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // API routes
  app.use('/api', apiRoutes);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Remote Cursor PC Agent Server',
      version: '1.0.0',
      status: 'running',
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
    });
  });

  return app;
}
