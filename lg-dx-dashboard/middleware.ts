import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Supabase 클라이언트 생성
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // 세션 새로고침 (필요한 경우)
  const { data: { session } } = await supabase.auth.getSession()
  
  // 보호된 라우트 정의
  const protectedRoutes = [
    '/dashboard',
    '/reflection',
    '/analytics',
    '/settings',
    '/profile'
  ]
  
  // 현재 경로가 보호된 라우트인지 확인
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  // 보호된 라우트에 접근하려는데 로그인되지 않은 경우
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근하는 경우
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

export const config = {
  matcher: [
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