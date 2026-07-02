// Validate environment variables at startup
// This runs when the module is imported

const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

export function validateEnvironment(): void {
  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Copy .env.local.example to .env.local and fill in the values.`
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

export function getEnv(name: typeof requiredEnvVars[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}