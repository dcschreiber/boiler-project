/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_STRIPE_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}