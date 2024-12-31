import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const isLoginPage = request.nextUrl.pathname === '/login';

  // ถ้าไม่ได้ login และไม่ได้อยู่ที่หน้า login ให้ redirect ไปหน้า login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ถ้า login แล้วและอยู่ที่หน้า login ให้ redirect ไปหน้า dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// กำหนดว่าจะใช้ middleware กับ path ไหนบ้าง
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/banks/:path*',
    '/settings/:path*',
    '/login'
  ]
}; 