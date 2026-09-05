import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';

const app = createApp();

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected successfully.');

    app.listen(config.port, () => {
      logger.info(`🚀 UstaTop Backend API server running at http://localhost:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`SMS Provider: ${config.sms.provider}`);
      logger.info(`Storage Provider: ${config.storage.provider}`);
      logger.info(`Uploads Directory: ${config.storage.uploadDir}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
