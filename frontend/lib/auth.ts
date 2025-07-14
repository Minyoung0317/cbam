import { cookies } from 'next/headers';

export function getAuthCookie() {
  const cookieStore = cookies();
  return cookieStore.get('userId');
}

export function isAuthenticated() {
  return !!getAuthCookie();
}

// 보호된 라우트 목록
export const protectedRoutes = [
  '/mypage',
  '/cbam-calculator',
  '/dashboard',
  '/settings',
  '/company-info'
];

// 공개 라우트 목록
export const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/cbam',
  '/guide'
];

// 현재 경로가 보호된 라우트인지 확인
export function isProtectedRoute(path: string) {
  return protectedRoutes.some(route => path.startsWith(route));
} 