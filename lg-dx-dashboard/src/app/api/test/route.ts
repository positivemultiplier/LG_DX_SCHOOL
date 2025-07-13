import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // 데이터베이스 연결 테스트
    const { data: testData, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          message: 'Database connection failed'
        },
        { status: 500 }
      )
    }
    
    // 현재 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonymousKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : null,
        authenticated: !!user
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to test database connection'
      },
      { status: 500 }
    )
  }
}