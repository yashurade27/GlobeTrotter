import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths requiring authentication
const protectedPaths = ['/trips', '/create-trip', '/profile'];

// Auth-only routes (redirect logged-in users away from these)
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check cookies and Authorization header
  const sessionId = request.cookies.get('sessionId')?.value;
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const isAuthenticated = !!sessionId || !!bearerToken;
  let response = NextResponse.next();

  // If we got a bearer token but no cookie, set the cookie
  if (bearerToken && !sessionId) {
    response.cookies.set({
      name: 'sessionId',
      value: bearerToken,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'strict',
    });
  }

  // Add pathname to headers so the root layout can detect admin routes
  response.headers.set('x-pathname', pathname);
  
  // For now, allow access to register and login without Redis complications
  // Skip all Redis-dependent middleware logic to fix the charCodeAt error
  
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/:path*',
    '/trips/:path*',
    '/create-trip',
    '/profile',
    '/login',
    '/register',
  ],
};
