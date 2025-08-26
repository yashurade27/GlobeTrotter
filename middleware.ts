import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/trips',
  '/create-trip',
  '/profile',
];

// Define paths that should redirect logged-in users (like login page)
const authPaths = [
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check for sessionId in cookies - this is our built-in authentication
  const sessionId = request.cookies.get('sessionId')?.value;
  
  // Also check for Bearer token in Authorization header
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  // User is authenticated if they have a valid sessionId
  const isAuthenticated = !!sessionId || !!bearerToken;
  let response = NextResponse.next();
  
  // If the request has a bearer token but no sessionId cookie, set the cookie
  if (bearerToken && !sessionId) {
    response.cookies.set({
      name: 'sessionId',
      value: bearerToken,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'strict'
    });
  }

  // For protected routes, redirect to login if not authenticated
  if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  // For auth routes (login/register), redirect to home if already authenticated
  if (authPaths.some(path => pathname.startsWith(path)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Continue with the response (which might have cookies set)
  return response;
}// Configure the matcher for which paths the middleware should run on
export const config = {
  matcher: [
    // Match all request paths except those starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public files (e.g. /images)
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};