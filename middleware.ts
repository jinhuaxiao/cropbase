// middleware.ts - 放在项目根目录
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 创建 Supabase 中间件客户端
  const supabase = createMiddlewareClient({ req: request, res: response })

  // 刷新 session，如果有必要的话 - 对服务端组件很重要
  await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const { data: { session } } = await supabase.auth.getSession()
  
  // 定义需要保护的路由
  const protectedRoutes = [
    '/dashboard',           // 仪表板
    '/profile',            // 用户资料
    '/settings',           // 设置页面
    '/api/protected'       // 受保护的 API 路由
  ]
  
  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // 如果是受保护的路由但用户未登录，重定向到登录页
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // 如果用户已登录但访问登录/注册页面，重定向到仪表板
  if ((pathname === '/auth' || pathname === '/') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// 配置中间件匹配的路由
export const config = {
  matcher: [
    // 匹配所有路由
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}