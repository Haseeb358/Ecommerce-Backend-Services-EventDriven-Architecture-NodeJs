import e from 'express';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Controller = HTTP only. Read req, call ONE service method, shape res.
 * The service is injected, not imported.
 */
export function createAuthController({ authService }) {
  return {
    register: catchAsync(async (req, res) => {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registered. Check your email for the verification code.',
        data: { user },
      });
    }),
    verifyOtp: catchAsync(async (req, res) => {
      const user = await authService.verifyOtp(req.body);
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        data: { user },
      });
    }),
    login: catchAsync(async (req, res) => {
      const data = await authService.login(req.body);

      // set cookie with JWT token

      res.cookie('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'none', // Adjust based on your needs
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: { ...data },
      });
    })
  };
}
