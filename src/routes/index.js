import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller.js';
import { createAuthRoutes } from './auth.routes.js';

/**
 * Builds controllers with services pulled from the container,
 * then mounts each router. Must run AFTER registerDependencies().
 */
export function createRoutes(container) {
  const router = Router();

  const authController = createAuthController({
    authService: container.resolve('authService'),
  });

  router.use('/auth', createAuthRoutes({ authController }));
  return router;
}
