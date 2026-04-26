/**
 * Environment variable validation — runs once at import time.
 * Throws a hard error on startup if critical secrets are missing,
 * preventing the app from silently running in a broken state.
 */

const required = [
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  "PAYSTACK_SECRET_KEY",
] as const;

const optional = [
  "DIRECT_URL",
  "NEXT_PUBLIC_PAYSTACK_PLAN_CODE",
] as const;

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `❌ Missing required environment variables:\n${missing.map((k) => `   - ${k}`).join("\n")}\n\nSet them in .env.local (dev) or Vercel dashboard (production).`
  );
}

// Emit warnings for optional vars that affect features
for (const key of optional) {
  if (!process.env[key]) {
    console.warn(`⚠️  Optional env var "${key}" is not set. Related features will be disabled.`);
  }
}

export {};
