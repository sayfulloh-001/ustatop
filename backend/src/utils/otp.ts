import crypto from 'crypto';

export const generateOtp = (): string => {
  // Generates 6-digit numerical OTP code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const verifyOtpHash = (otp: string, hash: string): boolean => {
  const computed = hashOtp(otp);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
};
