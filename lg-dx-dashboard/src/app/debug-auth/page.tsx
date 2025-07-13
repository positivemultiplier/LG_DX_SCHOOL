'use client'

import { useState } from 'react'

export default function DebugAuthPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testDirectFetch = async () => {
    setLoading(true)
    const testResults: any[] = []

    // 1. 환경 변수 확인
    testResults.push({
      test: 'Environment Variables',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    })

    // 2. 직접 fetch 테스트
    try {
      const response = await fetch('https://uqytgcqbigejqvhgmafg.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXRnY3FiaWdlanF2aGdtYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzEzMzksImV4cCI6MjA1MjIwNzMzOX0.VhYOGVVb_HoFGdPxMhPaftnzIkw0vKXQoRhc6zKYSfI',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXRnY3FiaWdlanF2aGdtYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzEzMzksImV4cCI6MjA1MjIwNzMzOX0.VhYOGVVb_HoFGdPxMhPaftnzIkw0vKXQoRhc6zKYSfI'
        }
      })
      
      testResults.push({
        test: 'Direct API Fetch',
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      })
    } catch (err: any) {
      testResults.push({
        test: 'Direct API Fetch',
        error: err.message,
        success: false
      })
    }

    // 3. Auth 엔드포인트 테스트
    try {
      const authResponse = await fetch('https://uqytgcqbigejqvhgmafg.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXRnY3FiaWdlanF2aGdtYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzEzMzksImV4cCI6MjA1MjIwNzMzOX0.VhYOGVVb_HoFGdPxMhPaftnzIkw0vKXQoRhc6zKYSfI',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXRnY3FiaWdlanF2aGdtYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzEzMzksImV4cCI6MjA1MjIwNzMzOX0.VhYOGVVb_HoFGdPxMhPaftnzIkw0vKXQoRhc6zKYSfI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123456'
        })
      })

      const authData = await authResponse.text()
      
      testResults.push({
        test: 'Auth Endpoint Test',
        status: authResponse.status,
        statusText: authResponse.statusText,
        response: authData.substring(0, 200) + '...',
        success: authResponse.status !== 0
      })
    } catch (err: any) {
      testResults.push({
        test: 'Auth Endpoint Test',
        error: err.message,
        success: false
      })
    }

    // 4. 네트워크 테스트
    try {
      const googleResponse = await fetch('https://www.google.com', { mode: 'no-cors' })
      testResults.push({
        test: 'General Network',
        success: true,
        message: 'Can reach external sites'
      })
    } catch (err: any) {
      testResults.push({
        test: 'General Network',
        error: err.message,
        success: false
      })
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">인증 디버깅</h1>
        
        <div className="mb-6">
          <button 
            onClick={testDirectFetch}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '연결 테스트 시작'}
          </button>
        </div>

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
              <h3 className="font-semibold text-lg mb-2">
                {result.test}
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {result.success ? '성공' : '실패'}
                </span>
              </h3>
              
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-50 p-6 rounded border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">해결 방법</h2>
          <div className="space-y-4 text-sm text-yellow-700">
            <div>
              <strong>1. Supabase Auth 설정 확인:</strong>
              <p>Supabase 대시보드 → Authentication → Settings → Site URL을 <code>http://localhost:3001</code>로 설정</p>
            </div>
            
            <div>
              <strong>2. CORS 설정:</strong>
              <p>Supabase 대시보드 → Settings → API → CORS에 <code>http://localhost:3001</code> 추가</p>
            </div>
            
            <div>
              <strong>3. 프로젝트 상태 확인:</strong>
              <p>Supabase 프로젝트가 활성화되어 있고 일시 중지되지 않았는지 확인</p>
            </div>

            <div>
              <strong>4. 네트워크 방화벽:</strong>
              <p>회사 네트워크나 방화벽에서 Supabase 도메인을 차단하고 있는지 확인</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}