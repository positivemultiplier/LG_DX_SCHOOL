'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthTestPage() {
  const [email, setEmail] = useState('test@lgdx.com')
  const [password, setPassword] = useState('test123456')
  const [name, setName] = useState('테스트 사용자')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const checkCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      setCurrentUser({ user, error: error?.message })
    } catch (err: any) {
      setCurrentUser({ error: err.message })
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })
      
      setResult({
        type: 'signup',
        success: !error,
        data,
        error: error?.message,
        message: data.user ? '회원가입 성공! 이메일 확인이 필요할 수 있습니다.' : '회원가입 실패'
      })

      if (!error && data.user) {
        // 사용자 프로필 테이블에도 데이터 추가 시도
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email: email,
              name: name
            }])
          
          if (profileError) {
            console.log('프로필 테이블 삽입 오류:', profileError)
          }
        } catch (profileErr) {
          console.log('프로필 생성 시도 중 오류:', profileErr)
        }
      }
      
    } catch (err: any) {
      setResult({
        type: 'signup',
        success: false,
        error: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      setResult({
        type: 'signin',
        success: !error,
        data,
        error: error?.message,
        message: data.user ? '로그인 성공!' : '로그인 실패'
      })

      if (!error && data.user) {
        // 성공하면 대시보드로 이동
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
      
    } catch (err: any) {
      setResult({
        type: 'signin',
        success: false,
        error: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      setResult({
        type: 'signout',
        success: !error,
        error: error?.message,
        message: !error ? '로그아웃 완료' : '로그아웃 실패'
      })
      setCurrentUser(null)
    } catch (err: any) {
      setResult({
        type: 'signout',
        success: false,
        error: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LG DX 인증 테스트</h1>
          <p className="text-gray-600">회원가입 및 로그인을 테스트해보세요</p>
        </div>
        
        {/* 현재 사용자 상태 */}
        <div className="mb-6">
          <button 
            onClick={checkCurrentUser}
            className="w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 mb-4"
          >
            현재 사용자 확인
          </button>
          {currentUser && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">현재 사용자:</h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(currentUser, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 인증 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">인증 정보</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test@lgdx.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="최소 6자리"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 (회원가입용)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="사용자 이름"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 font-medium"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
            
            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {loading ? '처리 중...' : '로그인'}
            </button>
            
            <button 
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-3 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 font-medium"
            >
              {loading ? '처리 중...' : '로그아웃'}
            </button>
          </div>
        </div>

        {/* 결과 표시 */}
        {result && (
          <div className={`rounded-lg p-6 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.type === 'signup' ? '회원가입' : result.type === 'signin' ? '로그인' : '로그아웃'} 결과
            </h3>
            
            {result.message && (
              <p className={`mb-4 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
            )}
            
            <details className="cursor-pointer">
              <summary className="font-medium mb-2">상세 정보 보기</summary>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* 도움말 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 도움말</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• 회원가입 후 이메일 확인이 필요할 수 있습니다</li>
            <li>• 로그인 성공 시 자동으로 대시보드로 이동합니다</li>
            <li>• 테스트 계정: test@lgdx.com / test123456</li>
            <li>• 문제 발생 시 브라우저 개발자 도구의 콘솔을 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}