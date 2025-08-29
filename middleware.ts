import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUserEdge } from '@/lib/actions/auth-edge';

// Paths requiring authentication
const protectedPaths = ['/trips', '/create-trip', '/profile'];

// Auth-only routes (redirect logged-in users away from these)
const authPaths = ['/login', '/register'];

// Admin-only routes
const adminPaths = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check cookies and Authorization header
  const sessionId = request.cookies.get('sessionId')?.value;
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

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

  // Get the active session ID (from cookie or bearer token)
  const activeSessionId = sessionId || bearerToken;

  // Validate session with Edge-compatible Redis
  let user = null;
  if (activeSessionId) {
    try {
      user = await getCurrentUserEdge(activeSessionId);
      
      // If session exists but user is null (banned, deleted, etc.), clear the session
      if (!user && activeSessionId) {
        response.cookies.delete('sessionId');
      }
    } catch (error) {
      console.error('Middleware session validation error:', error);
      // Clear invalid session cookie on error
      response.cookies.delete('sessionId');
    }
  }

  const isAuthenticated = !!user;

  // Check if current path requires authentication
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
  
  // Check if current path is auth-only (login/register)
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Check if current path requires admin access
  const requiresAdmin = adminPaths.some(path => pathname.startsWith(path));

  // Redirect unauthenticated users away from protected routes
  if (requiresAuth && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth-only routes
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect non-admin users away from admin routes
  if (requiresAdmin && (!isAuthenticated || !user || user.role !== 'ADMIN')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Add user information to headers for server components (optional)
  if (user) {
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-authenticated', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/trips/:path*',
    '/create-trip',
    '/profile',
    '/login',
    '/register',
  ],
};
