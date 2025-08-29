import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Key is required and must be a string' }, { status: 400 });
    }

    // Security check - only allow session and auth-related keys
    if (!key.startsWith('session:') && !key.startsWith('auth:') && !key.startsWith('otp:')) {
      return NextResponse.json({ error: 'Unauthorized key access' }, { status: 403 });
    }

    const result = await redis.del(key);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Redis DEL API error:', error);
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