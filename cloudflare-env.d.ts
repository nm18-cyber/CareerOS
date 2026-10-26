declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;

    ADMIN_USER_ID?: string;
    ADMIN_EMAIL?: string;

    GROQ_API_KEY?: string;
    GEMINI_API_KEY?: string;
    OPENAI_API_KEY?: string;
  }
}
