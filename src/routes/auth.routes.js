import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validations/auth.validation.js';
import {loginSchema} from '../validations/auth.validation.js';

export function createAuthRoutes({ authController }) {
  const router = Router();
   // router.get('/all', productController.getAllProducts);
  router.post('/register', validate(registerSchema, 'body'), authController.register);
  router.patch('/verify-otp', authController.verifyOtp);
  router.post('/login', validate(loginSchema, 'body'), authController.login);
  return router;
}
