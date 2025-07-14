'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react'

interface SetupStatus {
  connected: boolean
  tables: {
    users: boolean
    subjects: boolean
    daily_reflections: boolean
    daily_statistics: boolean
  }
  user_created: boolean
  ready: boolean
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/db-status')
      const data = await response.json()
      
      if (data.success) {
        setStatus({
          connected: data.database.connected,
          tables: {
            users: data.database.tables.users?.exists || false,
            subjects: data.database.tables.subjects?.exists || false,
            daily_reflections: data.database.tables.daily_reflections?.exists || false,
            daily_statistics: data.database.tables.daily_statistics?.exists || false
          },
          user_created: false,
          ready: data.database.ready
        })
      } else {
        setError(data.error || 'Failed to check status')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const copySQL = () => {
    const sql = `-- LG DX Dashboard 데이터베이스 설정
-- Supabase SQL Editor에서 다음 스크립트를 실행하세요

-- 1. UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  github_username TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 과목 테이블 생성
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  color_code TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📚',
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
  estimated_hours INTEGER DEFAULT 0,
  prerequisites TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 일일 리플렉션 테이블 생성
CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_part TEXT NOT NULL CHECK (time_part IN ('morning', 'afternoon', 'evening')),
  
  -- 핵심 평가 지표 (1-10점)
  understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 10),
  concentration_score INTEGER CHECK (concentration_score BETWEEN 1 AND 10),
  achievement_score INTEGER CHECK (achievement_score BETWEEN 1 AND 10),
  
  -- 컨디션 및 종합 점수
  condition TEXT CHECK (condition IN ('좋음', '보통', '나쁨')),
  total_score INTEGER GENERATED ALWAYS AS (
    (understanding_score + concentration_score + achievement_score)
  ) STORED,
  
  -- 과목별 세부 정보 (JSON)
  subjects JSONB DEFAULT '{}',
  
  -- 텍스트 필드
  achievements TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  tomorrow_goals TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- GitHub 활동 데이터
  github_commits INTEGER DEFAULT 0,
  github_issues INTEGER DEFAULT 0,
  github_prs INTEGER DEFAULT 0,
  github_reviews INTEGER DEFAULT 0,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 유니크 제약조건
  UNIQUE(user_id, date, time_part)
);

-- 5. 일일 통계 테이블 생성
CREATE TABLE IF NOT EXISTS public.daily_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- 리플렉션 완성도
  reflections_completed INTEGER DEFAULT 0,
  total_reflection_score INTEGER DEFAULT 0,
  average_reflection_score DECIMAL(4,2) DEFAULT 0,
  
  -- 학습 시간 통계
  total_study_time_minutes INTEGER DEFAULT 0,
  morning_study_time INTEGER DEFAULT 0,
  afternoon_study_time INTEGER DEFAULT 0,
  evening_study_time INTEGER DEFAULT 0,
  
  -- GitHub 활동 요약
  github_activity_score INTEGER DEFAULT 0,
  
  -- 목표 달성도
  daily_goals_completed INTEGER DEFAULT 0,
  daily_goals_total INTEGER DEFAULT 0,
  
  -- 종합 평가
  daily_grade TEXT,
  consistency_score DECIMAL(4,2) DEFAULT 0,
  
  -- 메타데이터
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 6. RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 생성
CREATE POLICY "Users can manage own data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users can read subjects" ON public.subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own reflections" ON public.daily_reflections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON public.daily_statistics
  FOR SELECT USING (auth.uid() = user_id);

-- 8. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
  ON public.daily_reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date_timepart 
  ON public.daily_reflections(date, time_part);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_user_date 
  ON public.daily_statistics(user_id, date);

-- 9. 기본 과목 데이터 삽입
INSERT INTO public.subjects (name, category, subcategory, description, color_code, icon, difficulty_level, estimated_hours) VALUES
('Python 기초', 'Foundation', 'Programming', 'Python 프로그래밍 기초 문법과 개념', '#3776AB', '🐍', 2, 40),
('데이터 구조와 알고리즘', 'Foundation', 'Computer Science', '기본적인 자료구조와 알고리즘 학습', '#FF6B6B', '🔧', 3, 60),
('웹 개발 기초', 'Foundation', 'Web Development', 'HTML, CSS, JavaScript 기초', '#F7931E', '🌐', 2, 50),
('DX 방법론', 'DX_Methodology', 'Business', '디지털 전환 방법론과 전략', '#4ECDC4', '🚀', 4, 30),
('빅데이터 분석 이론', '빅데이터분석기사', 'Theory', '빅데이터 분석 기본 이론', '#45B7D1', '📊', 3, 45),
('SQL 데이터베이스', '빅데이터분석기사', 'Database', 'SQL과 데이터베이스 활용', '#96CEB4', '🗄️', 3, 35)
ON CONFLICT (name) DO NOTHING;`

    navigator.clipboard.writeText(sql)
    alert('SQL 스크립트가 클립보드에 복사되었습니다!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LG DX Dashboard 설정
          </h1>
          <p className="text-gray-600">
            데이터베이스를 설정하여 대시보드를 사용할 준비를 완료하세요
          </p>
        </div>

        {/* 상태 확인 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              데이터베이스 상태 확인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button onClick={checkStatus} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  '상태 확인'
                )}
              </Button>
              {status && (
                <Badge variant={status.ready ? 'default' : 'destructive'}>
                  {status.ready ? '준비 완료' : '설정 필요'}
                </Badge>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-4 w-4" />
                  <span>오류: {error}</span>
                </div>
              </div>
            )}

            {status && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {status.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Supabase 연결</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.tables.users ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">users 테이블</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.tables.subjects ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">subjects 테이블</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.tables.daily_reflections ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">daily_reflections 테이블</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 설정 안내 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              데이터베이스 설정 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                1단계: Supabase 대시보드 접속
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Supabase 프로젝트의 SQL Editor에 접속하세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://uqytgcqbigejqvhgmafg.supabase.co/project/default/sql', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase SQL Editor 열기
              </Button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">
                2단계: SQL 스크립트 실행
              </h3>
              <p className="text-green-800 text-sm mb-3">
                아래 버튼을 클릭하여 SQL 스크립트를 복사한 후, Supabase SQL Editor에서 실행하세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={copySQL}
              >
                <Copy className="h-4 w-4 mr-2" />
                SQL 스크립트 복사
              </Button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                3단계: 설정 완료 확인
              </h3>
              <p className="text-purple-800 text-sm mb-3">
                SQL 스크립트 실행 후 위의 &ldquo;상태 확인&rdquo; 버튼을 클릭하여 설정이 완료되었는지 확인하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 대시보드 이동 */}
        {status?.ready && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  설정이 완료되었습니다!
                </h3>
                <p className="text-gray-600 mb-4">
                  이제 LG DX Dashboard를 사용할 수 있습니다.
                </p>
                <Button onClick={() => window.location.href = '/dashboard'}>
                  대시보드로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}