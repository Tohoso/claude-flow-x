import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface ServerConfig {
  port: number;
  logLevel: string;
  corsOrigin: string;
  watchDir: string;
}

const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  watchDir: process.env.WATCH_DIR || process.cwd(),
};

export default config;
