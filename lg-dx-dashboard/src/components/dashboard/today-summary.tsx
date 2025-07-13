'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, GitCommit, Target } from 'lucide-react';

interface TimePartData {
  time_part: string;
  understanding_score: number | null;
  concentration_score: number | null;
  achievement_score: number | null;
  total_score: number | null;
  condition: string | null;
  github_commits: number;
  completed: boolean;
}

interface TodaySummaryProps {
  data: TimePartData[];
  loading?: boolean;
}

export function TodaySummary({ data, loading = false }: TodaySummaryProps) {
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            오늘의 3-Part 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timePartNames = {
    morning: '🌅 오전수업',
    afternoon: '🌞 오후수업', 
    evening: '🌙 저녁자율학습'
  };

  const getConditionColor = (condition: string | null) => {
    switch (condition) {
      case '좋음': return 'bg-green-100 text-green-800';
      case '보통': return 'bg-yellow-100 text-yellow-800';
      case '나쁨': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 24) return 'text-green-600'; // 8점 이상 평균
    if (score >= 18) return 'text-yellow-600'; // 6점 이상 평균
    return 'text-red-600';
  };

  const completedCount = data.filter(item => item.completed).length;
  const totalScore = data.reduce((sum, item) => sum + (item.total_score || 0), 0);
  const averageScore = data.length > 0 ? Math.round((totalScore / data.length) * 10) / 10 : 0;
  const totalCommits = data.reduce((sum, item) => sum + item.github_commits, 0);

  return (
    <div className="space-y-6">
      {/* 전체 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            오늘의 3-Part 요약
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">완료된 리플렉션</div>
              <div className="text-2xl font-bold">{completedCount}/3</div>
              <Progress value={(completedCount / 3) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">평균 점수</div>
              <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore > 0 ? averageScore.toFixed(1) : '-'}
              </div>
              <div className="text-xs text-muted-foreground">최대 30점</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                GitHub 커밋
              </div>
              <div className="text-2xl font-bold">{totalCommits}</div>
              <div className="text-xs text-muted-foreground">총 커밋 수</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                목표 달성률
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((completedCount / 3) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">일일 목표</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시간대별 상세 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['morning', 'afternoon', 'evening'].map((timePart) => {
          const timeData = data.find(item => item.time_part === timePart);
          const isCompleted = timeData?.completed || false;
          
          return (
            <Card key={timePart} className={`${isCompleted ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{timePartNames[timePart as keyof typeof timePartNames]}</span>
                  {isCompleted ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">완료</Badge>
                  ) : (
                    <Badge variant="outline">미완료</Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timePart === 'morning' && '09:00-12:00'}
                  {timePart === 'afternoon' && '13:00-17:00'}
                  {timePart === 'evening' && '19:00-22:00'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isCompleted && timeData ? (
                  <>
                    {/* 점수 표시 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>이해도</span>
                        <span className="font-medium">{timeData.understanding_score || '-'}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>집중도</span>
                        <span className="font-medium">{timeData.concentration_score || '-'}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>성취도</span>
                        <span className="font-medium">{timeData.achievement_score || '-'}/10</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>총점</span>
                          <span className={getScoreColor(timeData.total_score)}>
                            {timeData.total_score || '-'}/30
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 컨디션 */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm">컨디션</span>
                      <Badge className={getConditionColor(timeData.condition)}>
                        {timeData.condition || '-'}
                      </Badge>
                    </div>

                    {/* GitHub 활동 */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-1">
                        <GitCommit className="h-3 w-3" />
                        커밋
                      </span>
                      <span className="font-medium">{timeData.github_commits}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <div className="text-sm">아직 리플렉션을 작성하지 않았습니다</div>
                    <div className="text-xs mt-1">
                      {timePart === 'morning' && '오전 수업 후 작성해보세요'}
                      {timePart === 'afternoon' && '오후 수업 후 작성해보세요'}
                      {timePart === 'evening' && '저녁 자율학습 후 작성해보세요'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}