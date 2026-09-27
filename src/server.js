import {env} from './config/env.js';
import {createApp} from './app.js';
import {connectDB,disconnectDB  } from './config/database.js';
import {logger} from './logs/logger.js';

let server;

async function startServer() {
  try {
    await connectDB();
    const app = createApp();
    server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT} at url http://127.0.0.1:${env.PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
   logger.error(`Uncaught Exception: ${err.message}`);
   process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close the server gracefully, then exit — don't keep serving traffic
  // on a process that's in an unknown state.
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      logger.info('Shutdown complete');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();