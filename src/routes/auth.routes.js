import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validations/auth.validation.js';

export function createAuthRoutes({ authController }) {
  const router = Router();
  router.post('/register', validate(registerSchema), authController.register);
  router.patch('/verify-otp', authController.verifyOtp);
  router.post('/login', authController.login);
  return router;
}
