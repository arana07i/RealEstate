// Validate environment variables at startup
// This runs when the module is imported

const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'REDIS_URL',
  'GOOGLE_PLACES_API_KEY',
] as const;

export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Copy .env.local.example to .env.local and fill in the values.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `Optional environment variables not set: ${warnings.join(', ')}. ` +
      `Some features may not work correctly.`
    );
  }
}

// Run validation at module load time in development
if (process.env.NODE_ENV !== 'production') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export function getEnv(name: typeof requiredEnvVars[number] | typeof optionalEnvVars[number]): string | undefined {
  const value = process.env[name];
  if (!value && requiredEnvVars.includes(name as typeof requiredEnvVars[number])) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export function getRequiredEnv(name: keyof typeof process.env): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://himalayancrestrealty.com';
}