import { env } from "cloudflare:workers";
import { createNeonAuth } from "@neon/auth/next/server";

// Neon Auth (managed Better Auth). Both values come from the Neon Console → Auth.
export function authSettings() {
  const baseUrl = env.NEON_AUTH_BASE_URL;
  const secret = env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl || !secret || secret.length < 32) {
    return null;
  }

  return { baseUrl, cookies: { secret } };
}

const settings = authSettings();

// Null until NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET are set; sign-in pages then say so.
export const auth = settings ? createNeonAuth(settings) : null;

// Email one-time codes (verification and password reset). The SDK builds these methods from its
// endpoint list (email-otp/*) at runtime but its TypeScript types leave them out, so type them here.
type AuthResult<T> = Promise<{ data: T | null; error: { code?: string; message: string; status: number } | null }>;
type EmailOtp = {
  sendVerificationOtp(args: { email: string; type: "email-verification" | "forget-password" | "sign-in" }): AuthResult<{ success: boolean }>;
  verifyEmail(args: { email: string; otp: string }): AuthResult<{ status: boolean; token: string | null }>;
  resetPassword(args: { email: string; otp: string; password: string }): AuthResult<{ success: boolean }>;
};

export const emailOtp = auth ? (auth as unknown as { emailOtp: EmailOtp }).emailOtp : null;
