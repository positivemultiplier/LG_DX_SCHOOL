'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface WeeklyData {
  date: string;
  day: string;
  morning_score: number | null;
  afternoon_score: number | null;
  evening_score: number | null;
  total_score: number;
  github_commits: number;
  reflections_completed: number;
}

interface WeeklyOverviewProps {
  data: WeeklyData[];
  loading?: boolean;
}

export function WeeklyOverview({ data, loading = false }: WeeklyOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>주간 성과 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 데이터가 없는 경우 샘플 데이터 생성
  const chartData = data.length > 0 ? data : generateSampleWeeklyData();

  // 통계 계산
  const weeklyStats = calculateWeeklyStats(chartData);

  return (
    <div className="space-y-6">
      {/* 주간 요약 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            주간 성과 트렌드
          </CardTitle>
          <CardDescription>최근 7일간의 학습 성과 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">주간 평균 점수</div>
              <div className="text-xl font-bold flex items-center gap-2">
                {weeklyStats.averageScore.toFixed(1)}
                {weeklyStats.scoreChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : weeklyStats.scoreChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {weeklyStats.scoreChange > 0 ? '+' : ''}{weeklyStats.scoreChange.toFixed(1)} vs 이전주
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">완료율</div>
              <div className="text-xl font-bold text-blue-600">
                {weeklyStats.completionRate.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {weeklyStats.totalReflections}/21 완료
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">GitHub 활동</div>
              <div className="text-xl font-bold text-purple-600">
                {weeklyStats.totalCommits}
              </div>
              <div className="text-xs text-muted-foreground">
                일평균 {weeklyStats.avgCommitsPerDay.toFixed(1)}개
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">일관성 지수</div>
              <div className="text-xl font-bold">
                {weeklyStats.consistencyIndex.toFixed(1)}
              </div>
              <Badge variant={weeklyStats.consistencyIndex >= 7 ? 'default' : 'secondary'}>
                {weeklyStats.consistencyIndex >= 7 ? '우수' : '보통'}
              </Badge>
            </div>
          </div>

          {/* 트렌드 차트 */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 30]}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value === null ? '-' : value,
                    name === 'total_score' ? '총점' : 
                    name === 'morning_score' ? '오전' :
                    name === 'afternoon_score' ? '오후' : '저녁'
                  ]}
                  labelFormatter={(label) => `${label}요일`}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_score" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  name="총점"
                />
                <Line 
                  type="monotone" 
                  dataKey="morning_score" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="오전"
                />
                <Line 
                  type="monotone" 
                  dataKey="afternoon_score" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="오후"
                />
                <Line 
                  type="monotone" 
                  dataKey="evening_score" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="저녁"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 시간대별 성과 비교 */}
      <Card>
        <CardHeader>
          <CardTitle>시간대별 성과 비교</CardTitle>
          <CardDescription>각 시간대별 평균 성과 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: '🌅 오전수업', key: 'morning_score', color: 'bg-yellow-100 text-yellow-800' },
              { name: '🌞 오후수업', key: 'afternoon_score', color: 'bg-green-100 text-green-800' },
              { name: '🌙 저녁자율학습', key: 'evening_score', color: 'bg-purple-100 text-purple-800' }
            ].map((timePart) => {
              const avgScore = calculateTimePartAverage(chartData, timePart.key);
              const completionCount = chartData.filter(day => 
                day[timePart.key as keyof WeeklyData] !== null
              ).length;
              
              return (
                <div key={timePart.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{timePart.name}</span>
                    <Badge className={timePart.color}>
                      {avgScore.toFixed(1)}점
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>완료 일수</span>
                      <span>{completionCount}/7일</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(avgScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateSampleWeeklyData(): WeeklyData[] {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  
  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    
    // 랜덤하지만 현실적인 데이터 생성
    const hasData = Math.random() > 0.2; // 80% 확률로 데이터 존재
    
    return {
      date: date.toISOString().split('T')[0],
      day,
      morning_score: hasData ? Math.floor(Math.random() * 3) + 7 : null, // 7-9점
      afternoon_score: hasData ? Math.floor(Math.random() * 3) + 8 : null, // 8-10점  
      evening_score: hasData ? Math.floor(Math.random() * 3) + 6 : null, // 6-8점
      total_score: hasData ? Math.floor(Math.random() * 6) + 21 : 0, // 21-27점
      github_commits: Math.floor(Math.random() * 8) + 2, // 2-10개
      reflections_completed: hasData ? 3 : Math.floor(Math.random() * 3) // 0-3개
    };
  });
}

function calculateWeeklyStats(data: WeeklyData[]) {
  const validDays = data.filter(day => day.total_score > 0);
  
  const averageScore = validDays.length > 0 
    ? validDays.reduce((sum, day) => sum + day.total_score, 0) / validDays.length 
    : 0;
  
  const totalReflections = data.reduce((sum, day) => sum + day.reflections_completed, 0);
  const completionRate = (totalReflections / (data.length * 3)) * 100;
  
  const totalCommits = data.reduce((sum, day) => sum + day.github_commits, 0);
  const avgCommitsPerDay = totalCommits / data.length;
  
  // 일관성 지수: 점수 분산의 역수
  const scores = validDays.map(day => day.total_score);
  const variance = scores.length > 1 
    ? scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / (scores.length - 1)
    : 0;
  const consistencyIndex = variance > 0 ? Math.max(0, 10 - Math.sqrt(variance)) : 10;
  
  return {
    averageScore,
    scoreChange: 0, // 이전주 데이터가 없으므로 0
    completionRate,
    totalReflections,
    totalCommits,
    avgCommitsPerDay,
    consistencyIndex
  };
}

function calculateTimePartAverage(data: WeeklyData[], key: string): number {
  const validScores = data
    .map(day => day[key as keyof WeeklyData] as number)
    .filter(score => score !== null && score > 0);
  
  return validScores.length > 0 
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
    : 0;
}