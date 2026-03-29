type EnvKey =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'NEXT_PUBLIC_APP_URL'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'ADMIN_PASSWORD'
  | 'INGEST_SECRET'
  | 'B2B_PASSWORD'

export interface AppEnv {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_APP_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ADMIN_PASSWORD: string
  INGEST_SECRET: string
  B2B_PASSWORD: string
}

let cachedEnv: AppEnv | null = null

export function validateEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv
  }

  const required: EnvKey[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_PASSWORD',
    'INGEST_SECRET',
    'B2B_PASSWORD'
  ]

  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\nCopy .env.example to .env.local and fill in values.`
    )
  }

  cachedEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL as string,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    INGEST_SECRET: process.env.INGEST_SECRET as string,
    B2B_PASSWORD: process.env.B2B_PASSWORD as string
  }

  return cachedEnv
}

export function getEnv(): AppEnv {
  return validateEnv()
}
