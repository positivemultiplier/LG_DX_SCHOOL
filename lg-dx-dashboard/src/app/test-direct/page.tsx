'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestDirectPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 직접 클라이언트 생성
  const supabase = createClient(
    'https://uqytgcqbigejqvhgmafg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXRnY3FiaWdlanF2aGdtYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzEzMzksImV4cCI6MjA1MjIwNzMzOX0.VhYOGVVb_HoFGdPxMhPaftnzIkw0vKXQoRhc6zKYSfI'
  )

  const testTable = async (tableName: string) => {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1)

      return {
        table: tableName,
        success: !error,
        count: count || 0,
        error: error?.message,
        data: data ? 'Found data' : 'No data'
      }
    } catch (err: any) {
      return {
        table: tableName,
        success: false,
        error: err.message,
        count: 0
      }
    }
  }

  const runTests = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const tables = ['users', 'subjects', 'daily_reflections', 'daily_statistics']
      const testResults = []

      for (const table of tables) {
        const result = await testTable(table)
        testResults.push(result)
        console.log(`${table}:`, result)
      }

      // Auth 테스트
      try {
        const { data: session, error: authError } = await supabase.auth.getSession()
        testResults.push({
          table: 'auth_session',
          success: !authError,
          error: authError?.message,
          data: session.session ? 'Active session' : 'No session'
        })
      } catch (authErr: any) {
        testResults.push({
          table: 'auth_session',
          success: false,
          error: authErr.message
        })
      }

      setResults(testResults)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testSignUp = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@lgdx.com',
        password: 'test123456',
        options: {
          data: {
            name: 'Test User'
          }
        }
      })

      const signupResult = {
        table: 'auth_signup',
        success: !error,
        error: error?.message,
        data: data.user ? 'User created' : 'No user returned'
      }

      setResults(prev => [...prev, signupResult])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">직접 연결 테스트</h1>
        
        <div className="mb-6 space-x-4">
          <button 
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '테이블 테스트'}
          </button>
          
          <button 
            onClick={testSignUp}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '회원가입 테스트'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>오류:</strong> {error}
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {result.table}
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {result.success ? '성공' : '실패'}
                  </span>
                </h3>
                {result.count !== undefined && (
                  <span className="text-sm text-gray-600">
                    {result.count}개 레코드
                  </span>
                )}
              </div>
              
              {result.error && (
                <p className="mt-2 text-red-600 text-sm">
                  <strong>오류:</strong> {result.error}
                </p>
              )}
              
              {result.data && (
                <p className="mt-2 text-gray-600 text-sm">
                  <strong>데이터:</strong> {result.data}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">환경 정보</h2>
          <div className="space-y-2 text-sm">
            <div><strong>현재 시간:</strong> {new Date().toLocaleString()}</div>
            <div><strong>브라우저:</strong> {navigator.userAgent}</div>
            <div><strong>URL:</strong> {window.location.href}</div>
          </div>
        </div>
      </div>
    </div>
  )
}