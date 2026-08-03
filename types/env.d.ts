export {}

declare global {
  interface Window {
    env?: {
      SUPABASE_URL?: string
      SUPABASE_KEY?: string
    }
  }
}
