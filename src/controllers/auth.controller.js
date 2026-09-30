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
  };
}
