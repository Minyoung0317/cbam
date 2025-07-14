import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { protectedRoutes } from './lib/auth'

// 허용된 경로 목록 (로그인 없이 접근 가능)
const allowedPaths = ['/', '/login', '/register', '/guide', '/cbam']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has('userId')
  
  // 보호된 라우트 체크
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // API 요청은 미들웨어 처리에서 제외
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const userId = request.cookies.get('userId')?.value

  // 로그인하지 않았고, 현재 경로가 허용된 경로 목록에 포함되지 않은 경우
  // if (!userId && !allowedPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path + '/')))) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/'; // 메인 페이지로 리다이렉트
  //   url.searchParams.set('alert', 'login_required'); // 알림을 위한 쿼리 파라미터 추가
  //   url.searchParams.set('message', '로그인이 필요한 서비스입니다.'); // 알림 메시지 추가
  //   return NextResponse.redirect(url);
  // }
  
  // 로그인한 사용자가 /login 또는 /register 페이지에 접근 시 메인 페이지 또는 대시보드로 리다이렉트 (선택 사항)
  // if (userId && (pathname === '/login' || pathname === '/register')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/dashboard' // 예: 대시보드로 리다이렉트
  //   return NextResponse.redirect(url)
  // }

  return NextResponse.next()
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    '/mypage/:path*',
    '/cbam-calculator/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/company-info/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 