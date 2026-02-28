function optionalEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function requiredEnv(key: string): string {
  const value = optionalEnv(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: optionalEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
  OPENAI_API_KEY: optionalEnv("OPENAI_API_KEY"),
  OPENAI_MODEL: optionalEnv("OPENAI_MODEL"),
  HUGGINGFACE_API_KEY: optionalEnv("HUGGINGFACE_API_KEY"),
  HUGGINGFACE_MODEL: optionalEnv("HUGGINGFACE_MODEL"),
  TRIAGE_ML_SERVICE_URL: optionalEnv("TRIAGE_ML_SERVICE_URL"),
  WEARABLE_PROVIDER: optionalEnv("WEARABLE_PROVIDER"),
  WEARABLE_API_KEY: optionalEnv("WEARABLE_API_KEY"),
  WEARABLE_SYNC_URL: optionalEnv("WEARABLE_SYNC_URL"),
  EHR_PROVIDER: optionalEnv("EHR_PROVIDER"),
  EHR_API_KEY: optionalEnv("EHR_API_KEY"),
  EHR_SYNC_URL: optionalEnv("EHR_SYNC_URL"),
  VECTOR_DB_PROVIDER: optionalEnv("VECTOR_DB_PROVIDER"),
  VECTOR_DB_URL: optionalEnv("VECTOR_DB_URL"),
  VECTOR_DB_API_KEY: optionalEnv("VECTOR_DB_API_KEY"),
  AI_ZERO_RETENTION_MODE: optionalEnv("AI_ZERO_RETENTION_MODE"),
  STRIPE_SECRET_KEY: optionalEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: optionalEnv("STRIPE_WEBHOOK_SECRET"),
  NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR: optionalEnv("NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR"),
  NEXT_PUBLIC_APP_URL: optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
};

export const hasSupabaseClientEnv =
  Boolean(env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasSupabaseAdminEnv = hasSupabaseClientEnv && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
export const hasOpenAIEnv = Boolean(env.OPENAI_API_KEY);
export const hasHuggingFaceEnv = Boolean(env.HUGGINGFACE_API_KEY);
export const hasExternalLlmEnv = hasOpenAIEnv || hasHuggingFaceEnv;
export const hasStripeEnv = Boolean(env.STRIPE_SECRET_KEY);

export const readSupabaseUrl = () => requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
export const readSupabaseAnonKey = () => requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const readSupabaseServiceRoleKey = () => requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
export const readStripeSecretKey = () => requiredEnv("STRIPE_SECRET_KEY");
export const readStripeWebhookSecret = () => requiredEnv("STRIPE_WEBHOOK_SECRET");
