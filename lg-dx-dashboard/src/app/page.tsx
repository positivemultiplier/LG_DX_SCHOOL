'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (user) {
    return null // 리다이렉트 중
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          LG DX Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          LG DX School 수업 경과보고를 위한 실시간 대시보드
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🌅 오전 수업</h2>
            <p className="text-gray-600">오전 수업 리플렉션 및 진도 추적</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🌞 오후 수업</h2>
            <p className="text-gray-600">오후 수업 리플렉션 및 성과 분석</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🌙 저녁 자율학습</h2>
            <p className="text-gray-600">저녁 자율학습 기록 및 목표 설정</p>
          </div>
        </div>
        
        <div className="text-center mt-8 space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium"
          >
            회원가입
          </Link>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Phase 1.3 Supabase Auth 구현 완료 ✅
          </p>
        </div>
      </div>
    </main>
  )
}