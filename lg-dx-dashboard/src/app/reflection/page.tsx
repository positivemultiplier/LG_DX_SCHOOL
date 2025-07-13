'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodayReflections } from '@/hooks/use-reflection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ReflectionPage() {
  const router = useRouter();
  const { completionStatus, overallProgress, isLoading, error } = useTodayReflections();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">일일 리플렉션</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">일일 리플렉션</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">일일 리플렉션</h1>
        <p className="text-muted-foreground">
          오늘의 학습을 3-Part 시스템으로 기록해보세요
        </p>
      </div>

      {/* 전체 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>오늘의 진행률</span>
            <Badge variant={overallProgress.percentage === 100 ? "default" : "secondary"}>
              {overallProgress.completed}/3 완료
            </Badge>
          </CardTitle>
          <CardDescription>
            {overallProgress.percentage === 100 
              ? '🎉 오늘의 모든 리플렉션을 완료했습니다!' 
              : `${overallProgress.percentage}% 완료 - 평균 점수: ${overallProgress.averageScore.toFixed(1)}점`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress.percentage} className="h-3" />
        </CardContent>
      </Card>

      {/* 3-Part 리플렉션 카드들 */}
      <div className="grid gap-6 md:grid-cols-3">
        {completionStatus.map((timeSlot) => (
          <Card key={timeSlot.key} className={`transition-all hover:shadow-lg ${
            timeSlot.completed ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{timeSlot.icon}</span>
                  {timeSlot.label}
                </span>
                {timeSlot.completed && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    완료
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {timeSlot.completed ? (
                  <span className="text-green-600">
                    총점: {timeSlot.reflection?.total_score}/30점
                  </span>
                ) : (
                  <span className="text-muted-foreground">아직 작성하지 않았습니다</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeSlot.completed && timeSlot.reflection ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium">이해도</div>
                      <div className="text-blue-600">{timeSlot.reflection.understanding_score}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">집중도</div>
                      <div className="text-green-600">{timeSlot.reflection.concentration_score}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">성취도</div>
                      <div className="text-purple-600">{timeSlot.reflection.achievement_score}/10</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    컨디션: {timeSlot.reflection.condition}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  학습 후 리플렉션을 작성하여 오늘의 성과를 기록하세요.
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push(`/reflection/${timeSlot.key}`)}
                  className="flex-1"
                  variant={timeSlot.completed ? "outline" : "default"}
                >
                  {timeSlot.completed ? '수정하기' : '작성하기'}
                </Button>
                {timeSlot.completed && (
                  <Button 
                    onClick={() => router.push(`/reflection/${timeSlot.key}?view=true`)}
                    variant="ghost"
                    size="sm"
                  >
                    보기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>
            자주 사용하는 기능들을 빠르게 실행할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/reflection/history')}
            >
              📊 이전 리플렉션 보기
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/analytics')}
            >
              📈 분석 대시보드
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              🏠 메인 대시보드
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}