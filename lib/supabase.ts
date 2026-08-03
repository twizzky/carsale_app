import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* ------------------------------------------------------------------
 *  Helpers
 * -----------------------------------------------------------------*/
function isValidUrl(url?: string): url is string {
  return typeof url === "string" && /^https?:\/\/.+/i.test(url)
}
function isValidKey(key?: string): key is string {
  return typeof key === "string" && key.length > 20
}

/* ------------------------------------------------------------------
 *  Safe runtime fallback for env.js injection
 * -----------------------------------------------------------------*/
function getRuntimeEnv(key: string): string | undefined {
  if (typeof window !== "undefined" && typeof window.env === "object") {
    return (window.env as any)?.[key]
  }
  return undefined
}

/* ------------------------------------------------------------------
 *  Grab Supabase credentials (client-safe)
 * -----------------------------------------------------------------*/
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || getRuntimeEnv("SUPABASE_URL")
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || getRuntimeEnv("SUPABASE_KEY")

/* ------------------------------------------------------------------
 *  Inventory-table detection (handles plural / singular etc.)
 * -----------------------------------------------------------------*/
const INVENTORY_CANDIDATES = ["inventory_row", "inventory_rows"]
let detectedTable: string | null = null

export async function getInventoryTable(): Promise<string | null> {
  if (detectedTable) return detectedTable

  for (const name of INVENTORY_CANDIDATES) {
    const { error } = await supabase.from(name).select("*").limit(1)
    if (error?.code === "42P01") continue
    detectedTable = name
    return detectedTable
  }
  return null
}

/* ------------------------------------------------------------------
 *  Stub fallback if envs are invalid
 * -----------------------------------------------------------------*/
function createStub(): SupabaseClient<any, any, any> {
  const genResponse = () => Promise.resolve({ data: null, error: new Error("[supabase] Stub client – check env vars") })

  // a super-lightweight query-builder that just chains until the final "fetch" fn
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    lte: () => builder,
    order: () => builder,
    limit: () => genResponse(),
    single: () => genResponse(),
  }

  return {
    from() {
      return builder
    },
    rpc() {
      return genResponse()
    },
  } as any
}

/* ------------------------------------------------------------------
 *  Final export – either a real client or the safe stub
 * -----------------------------------------------------------------*/
export const supabase: SupabaseClient = (() => {
  if (isValidUrl(SUPABASE_URL) && isValidKey(SUPABASE_KEY)) {
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  console.warn("[supabase] Falling back to stub client. Check your envs.")
  return createStub()
})()

/* ------------------------------------------------------------------
 *  Simple connectivity check
 * -----------------------------------------------------------------*/
export async function testConnection() {
  try {
    const table = await getInventoryTable()
    if (!table) return { success: false, error: "Inventory table not found" }

    const { error } = await supabase.from(table).select("*").limit(1)
    return { success: !error, error: error?.message }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
