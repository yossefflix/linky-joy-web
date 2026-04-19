import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GULF_COUNTRIES: Record<string, string> = {
  SA: 'SAR',
  AE: 'AED',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR'
};

export function middleware(request: NextRequest) {
  // --- Admin Basic Auth Protection ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // The secure password provided
      if (user !== 'admin' || pwd !== 'Yossef123$') {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
        });
      }
    } else {
      return new NextResponse('Auth Required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
      });
    }
  }

  // --- Currency & Geo Routing ---
  const geo = (request as any).geo;
  
  // Use Vercel headers as fallback if geo is missing (for local dev or non-Vercel edge)
  const country = geo?.country || request.headers.get('x-vercel-ip-country') || 'EG'; 
  
  let currency = 'EUR'; 
  
  if (GULF_COUNTRIES[country]) {
    currency = GULF_COUNTRIES[country];
  }

  const response = NextResponse.next();
  response.headers.set('x-user-currency', currency);
  response.headers.set('x-user-country', country);
  
  return response;
}

export const config = {
  matcher: [
    '/',
    '/plans',
    '/checkout',
    '/admin/:path*',
    '/api/:path*'
  ],
};

