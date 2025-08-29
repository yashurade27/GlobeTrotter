import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { key, seconds, value } = await request.json();
    
    if (!key || typeof key !== 'string' || !seconds || !value) {
      return NextResponse.json({ 
        error: 'Key (string), seconds (number), and value (string) are required' 
      }, { status: 400 });
    }

    // Security check - only allow session and auth-related keys
    if (!key.startsWith('session:') && !key.startsWith('auth:') && !key.startsWith('otp:')) {
      return NextResponse.json({ error: 'Unauthorized key access' }, { status: 403 });
    }

    // Validate expiration time (max 30 days)
    if (seconds > 60 * 60 * 24 * 30) {
      return NextResponse.json({ error: 'Expiration time too long (max 30 days)' }, { status: 400 });
    }

    const result = await redis.setex(key, seconds, value);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Redis SETEX API error:', error);
    return NextResponse.json({ 
      error: 'Redis operation failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}