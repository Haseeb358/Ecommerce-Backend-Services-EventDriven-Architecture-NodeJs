import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true, // creates a unique index -> protects against race conditions
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // never returned by default
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },

    isEmailVerified: { type: Boolean, default: false },
    // Store only a HASH of the OTP, never the OTP itself.
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// Safety net: even if a query selects them, strip secrets from JSON output.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.otpHash;
    delete ret.otpExpiresAt;
    delete ret.__v;
    return ret;
  },
});

export const UserModel = mongoose.model('User', userSchema);
