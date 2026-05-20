import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // 1. Skip middleware for static assets, internal Next.js paths, and API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Catch files with extensions
  ) {
    return NextResponse.next();
  }

  // 2. Prepare request headers to pass device type to server components
  const requestHeaders = new Headers(request.headers);
  if (isMobile) {
    requestHeaders.set('x-is-mobile', 'true');
  }

  // 3. Handle Mobile Rewrites
  if (isMobile && !pathname.startsWith('/mobile')) {
    const url = request.nextUrl.clone();
    url.pathname = `/mobile${pathname}`;
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Fallback: Just pass headers to desktop version
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
