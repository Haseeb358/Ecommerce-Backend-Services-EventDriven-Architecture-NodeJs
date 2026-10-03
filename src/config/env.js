import dotenv from 'dotenv';
import { z } from 'zod';
 dotenv.config();

// Define and validate every env var the app needs, in one place.
// If something is missing/wrong, fail fast at boot instead of crashing
// randomly later when some route finally touches process.env.X
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Mongoose
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Prisma (comment out if using Mongoose instead)
  // DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BREVO_SMTP_USER: z.string().min(1, 'BREVO_SMTP_USER is required'),
  BREVO_SMTP_PASS: z.string().min(1, 'BREVO_SMTP_PASS is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email address'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print readable errors instead of a giant zod stack trace
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// Single source of truth for config — everything else imports from here,
// nobody else in the app should touch process.env directly.
export const env = parsed.data;
