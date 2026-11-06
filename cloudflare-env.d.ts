declare namespace Cloudflare {
  interface Env {
    BUCKET?: R2Bucket;

    // Neon Postgres connection string (pooled), e.g. postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
    DATABASE_URL?: string;

    // Neon Auth: Auth URL from Neon Console → Auth, and a random secret of 32+ characters.
    NEON_AUTH_BASE_URL?: string;
    NEON_AUTH_COOKIE_SECRET?: string;

    // Public origin of the site, used for sign-in redirects, e.g. https://careeros.nmtricone.workers.dev
    APP_URL?: string;

    // Neon Auth user ID, or a verified email, that gets the admin role.
    ADMIN_USER_ID?: string;
    ADMIN_EMAIL?: string;

    GROQ_API_KEY?: string;
    GEMINI_API_KEY?: string;
    OPENAI_API_KEY?: string;
  }
}
