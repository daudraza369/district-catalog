import { cookies } from 'next/headers'
import { createBrowserClient as createSsrBrowserClient, createServerClient as createSsrServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SERVICE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SERVICE_SUPABASEANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_SUPABASESERVICE_KEY

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function createBrowserClient() {
  return createSsrBrowserClient(
    assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    assertEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}

export function createServerClient() {
  const cookieStore = cookies()
  return createSsrServerClient(
    assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    assertEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {}
      }
    }
  )
}

export function createAdminClient() {
  return createClient(
    assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    assertEnv(supabaseServiceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}
