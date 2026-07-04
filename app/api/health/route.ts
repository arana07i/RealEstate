import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    const checks: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};
    const details: Record<string, unknown> = {};
    
    if (supabaseUrl) {
      checks.supabase = 'healthy';
      details.supabase = 'configured';
    } else {
      checks.supabase = 'unhealthy';
      details.supabase = 'not configured';
    }
    
    if (stripeKey) {
      checks.stripe = 'healthy';
      details.stripe = 'configured';
    } else {
      checks.stripe = 'degraded';
      details.stripe = 'not configured (billing disabled)';
    }
    
    const allHealthy = Object.values(checks).every(s => s === 'healthy' || s === 'degraded');
    
    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? 'unknown',
        checks,
        details,
      },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}