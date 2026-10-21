declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;

    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    APP_URL?: string;

    ADMIN_USER_ID?: string;
    ADMIN_EMAIL?: string;
  }
}
