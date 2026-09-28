import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validations/auth.validation.js';

export function createAuthRoutes({ authController }) {
  const router = Router();
  router.post('/register', validate(registerSchema), authController.register);
  return router;
}
