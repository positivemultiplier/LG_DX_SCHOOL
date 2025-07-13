'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const [status, setStatus] = useState<any>(null)
  const [authTest, setAuthTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    try {
      // 기본 연결 테스트
      const response = await fetch('/api/db-status')
      const dbStatus = await response.json()
      setStatus(dbStatus)

      // 인증 세션 테스트
      const { data: session, error } = await supabase.auth.getSession()
      setAuthTest({
        session: session.session ? 'Active' : 'None',
        error: error?.message,
        user: session.session?.user?.email
      })
    } catch (err: any) {
      setStatus({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@lgdx.com',
        password: 'test123456'
      })
      
      setAuthTest({
        ...authTest,
        signup: {
          success: !error,
          error: error?.message,
          data: data.user ? 'User created' : 'No user'
        }
      })
    } catch (err: any) {
      setAuthTest({
        ...authTest,
        signup: { error: err.message }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">시스템 검증</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 데이터베이스 상태 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">데이터베이스 상태</h2>
            <button 
              onClick={checkStatus}
              disabled={loading}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '확인 중...' : '상태 새로고침'}
            </button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>

          {/* 인증 테스트 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">인증 테스트</h2>
            <button 
              onClick={testAuth}
              disabled={loading}
              className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '테스트 중...' : '회원가입 테스트'}
            </button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authTest, null, 2)}
            </pre>
          </div>
        </div>

        {/* 환경 정보 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">환경 정보</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
            <div><strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL}</div>
            <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</div>
          </div>
        </div>

        {/* 설정 가이드 */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">설정 가이드</h2>
          <div className="space-y-4 text-sm text-yellow-700">
            <p><strong>1. 데이터베이스 테이블 생성:</strong></p>
            <p>Supabase 대시보드 → SQL Editor → 다음 파일 내용 실행:</p>
            <code className="block bg-yellow-100 p-2 rounded mt-2">
              scripts/supabase-manual-setup.sql
            </code>
            
            <p><strong>2. 테이블이 생성되지 않는 경우:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Supabase 프로젝트가 활성화되어 있는지 확인</li>
              <li>서비스 롤 키가 올바른지 확인</li>
              <li>네트워크 연결 상태 확인</li>
            </ul>

            <p><strong>3. 인증 오류 해결:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Auth 설정에서 Site URL 확인</li>
              <li>Email confirmation 설정 확인</li>
              <li>개발서버 재시작 시도</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}