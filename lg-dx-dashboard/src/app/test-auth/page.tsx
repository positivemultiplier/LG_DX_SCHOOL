'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@lgdx.com')
  const [password, setPassword] = useState('test123456')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const testSignUp = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: 'Test User'
          }
        }
      })
      
      setResult({
        type: 'signup',
        success: !error,
        data,
        error: error?.message
      })
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

  const testSignIn = async () => {
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
        error: error?.message
      })
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

  const testConnection = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.getSession()
      
      setResult({
        type: 'connection',
        success: !error,
        data,
        error: error?.message
      })
    } catch (err: any) {
      setResult({
        type: 'connection',
        success: false,
        error: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase 인증 테스트</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>테스트 계정 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>테스트 액션</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testConnection}
                disabled={loading}
                variant="outline"
              >
                연결 테스트
              </Button>
              <Button 
                onClick={testSignUp}
                disabled={loading}
              >
                회원가입 테스트
              </Button>
              <Button 
                onClick={testSignIn}
                disabled={loading}
                variant="secondary"
              >
                로그인 테스트
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                테스트 결과
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? '성공' : '실패'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">환경 정보:</h3>
          <ul className="space-y-1">
            <li>• Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
            <li>• API URL: {process.env.NEXT_PUBLIC_API_URL}</li>
            <li>• Site URL: {process.env.NEXT_PUBLIC_SITE_URL}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}