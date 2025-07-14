'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useCreateReflection, useReflectionByDateAndTimePart } from '@/hooks/use-reflection';
import { reflectionFormSchema, type ReflectionFormInput } from '@/lib/validations/reflection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { getTodayString, formatDateKorean, parseDate, addDays, subDays, dateToString } from '@/lib/utils/date';

export default function EveningReflectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isViewMode = searchParams.get('view') === 'true';
  const { user } = useAuth();
  const { createReflection, updateReflection, isLoading } = useCreateReflection();
  
  const selectedDate = searchParams.get('date') || getTodayString();
  const { reflection: existingReflection, isLoading: isFetching } = useReflectionByDateAndTimePart(selectedDate, 'evening');
  
  const [achievements, setAchievements] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [tomorrowGoals, setTomorrowGoals] = useState<string[]>(['']);

  const form = useForm<ReflectionFormInput>({
    resolver: zodResolver(reflectionFormSchema),
    defaultValues: {
      understanding_score: 5,
      concentration_score: 5,
      achievement_score: 5,
      condition: '보통',
      achievements: [''],
      challenges: [''],
      tomorrow_goals: [''],
      notes: '',
    }
  });

  // 기존 리플렉션 데이터 로드
  useEffect(() => {
    if (existingReflection) {
      form.reset({
        understanding_score: existingReflection.understanding_score,
        concentration_score: existingReflection.concentration_score,
        achievement_score: existingReflection.achievement_score,
        condition: existingReflection.condition,
        notes: existingReflection.notes || '',
      });
      
      setAchievements(existingReflection.achievements.length > 0 ? existingReflection.achievements : ['']);
      setChallenges(existingReflection.challenges.length > 0 ? existingReflection.challenges : ['']);
      setTomorrowGoals(existingReflection.tomorrow_goals.length > 0 ? existingReflection.tomorrow_goals : ['']);
    } else {
      // 기존 리플렉션이 없으면 폼을 기본값으로 리셋
      form.reset({
        understanding_score: 5,
        concentration_score: 5,
        achievement_score: 5,
        condition: '보통',
        notes: '',
      });
      setAchievements(['']);
      setChallenges(['']);
      setTomorrowGoals(['']);
    }
  }, [existingReflection, form, selectedDate]); // selectedDate 종속성 추가

  const onSubmit = async (data: ReflectionFormInput) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    const filteredAchievements = achievements.filter(item => item.trim() !== '');
    const filteredChallenges = challenges.filter(item => item.trim() !== '');
    const filteredGoals = tomorrowGoals.filter(item => item.trim() !== '');

    const reflectionData = {
      user_id: user.id,
      date: selectedDate,
      time_part: 'evening' as const,
      understanding_score: data.understanding_score,
      concentration_score: data.concentration_score,
      achievement_score: data.achievement_score,
      condition: data.condition,
      achievements: filteredAchievements,
      challenges: filteredChallenges,
      tomorrow_goals: filteredGoals,
      notes: data.notes,
    };

    let result;
    if (existingReflection) {
      result = await updateReflection(existingReflection.id, reflectionData);
    } else {
      result = await createReflection(reflectionData);
    }

    if (result.success) {
      toast.success(existingReflection ? '저녁 리플렉션이 수정되었습니다!' : '저녁 리플렉션이 저장되었습니다!');
      router.push('/reflection');
    } else {
      toast.error(result.error || '저장에 실패했습니다');
    }
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // 날짜 네비게이션 함수들
  const navigateToDate = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate);
    router.push(`/reflection/evening?${params.toString()}`);
  };

  const goToPreviousDay = () => {
    const currentDate = parseDate(selectedDate);
    if (currentDate) {
      const previousDay = subDays(currentDate, 1);
      navigateToDate(dateToString(previousDay));
    }
  };

  const goToNextDay = () => {
    const currentDate = parseDate(selectedDate);
    if (currentDate) {
      const nextDay = addDays(currentDate, 1);
      navigateToDate(dateToString(nextDay));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      navigateToDate(dateToString(date));
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div key={selectedDate} className="container mx-auto p-6 max-w-4xl">
      {/* 헤더 */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          🌙 저녁 자율학습 리플렉션
        </h1>
        <p className="text-muted-foreground">
          {isViewMode ? '저녁 자율학습 리플렉션을 확인합니다' : '저녁 자율학습을 마치고 하루의 학습을 되돌아보세요'}
        </p>
        
        {/* 날짜 선택 및 네비게이션 */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            disabled={isViewMode}
          >
            <ChevronLeft className="h-4 w-4" />
            이전일
          </Button>
          
          <div className="flex-1 min-w-[200px]">
            <DatePicker
              value={parseDate(selectedDate) || undefined}
              onChange={handleDateChange}
              placeholder="날짜 선택"
              disabled={isViewMode}
              className="w-full"
            />
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            disabled={isViewMode}
          >
            다음일
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 선택된 날짜 표시 및 안내 메시지 */}
        <div className="text-sm text-muted-foreground space-y-2">
          <div>
            {formatDateKorean(selectedDate)}
            {selectedDate === getTodayString() && (
              <Badge variant="default" className="ml-2 text-xs">오늘</Badge>
            )}
          </div>
          {selectedDate < getTodayString() && !isViewMode && (
            <div className="text-amber-600 text-xs">
              💡 과거 날짜의 리플렉션을 작성하고 있습니다.
            </div>
          )}
          {selectedDate > getTodayString() && !isViewMode && (
            <div className="text-blue-600 text-xs">
              📅 미래 날짜의 리플렉션을 작성하고 있습니다.
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 점수 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 학습 성과 평가</CardTitle>
              <CardDescription>
                저녁 자율학습에 대한 이해도, 집중도, 성취도를 1-10점으로 평가해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="understanding_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>이해도</span>
                      <Badge>{field.value}/10</Badge>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={10}
                        min={1}
                        step={1}
                        disabled={isViewMode}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      학습 내용을 얼마나 이해했나요?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concentration_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>집중도</span>
                      <Badge>{field.value}/10</Badge>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={10}
                        min={1}
                        step={1}
                        disabled={isViewMode}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      자율학습에 얼마나 집중할 수 있었나요?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="achievement_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>성취도</span>
                      <Badge>{field.value}/10</Badge>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={10}
                        min={1}
                        step={1}
                        disabled={isViewMode}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      목표한 만큼 성취할 수 있었나요?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>컨디션</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="오늘의 컨디션을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="좋음">😊 좋음</SelectItem>
                        <SelectItem value="보통">😐 보통</SelectItem>
                        <SelectItem value="나쁨">😔 나쁨</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      오늘 저녁의 전반적인 컨디션은 어땠나요?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 성취 사항 */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 오늘의 성취</CardTitle>
              <CardDescription>
                저녁 자율학습에서 성취한 것들을 기록해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={achievement}
                      onChange={(e) => updateListItem(setAchievements, index, e.target.value)}
                      placeholder={`성취 사항 ${index + 1}`}
                      disabled={isViewMode}
                    />
                    {!isViewMode && achievements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem(setAchievements, index)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem(setAchievements)}
                  >
                    + 성취 사항 추가
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 어려웠던 점 */}
          <Card>
            <CardHeader>
              <CardTitle>🤔 어려웠던 점</CardTitle>
              <CardDescription>
                저녁 자율학습에서 어려웠던 점이나 개선이 필요한 부분을 기록해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {challenges.map((challenge, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={challenge}
                      onChange={(e) => updateListItem(setChallenges, index, e.target.value)}
                      placeholder={`어려웠던 점 ${index + 1}`}
                      disabled={isViewMode}
                    />
                    {!isViewMode && challenges.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem(setChallenges, index)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem(setChallenges)}
                  >
                    + 어려웠던 점 추가
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 내일 목표 */}
          <Card>
            <CardHeader>
              <CardTitle>📝 내일 목표</CardTitle>
              <CardDescription>
                내일 달성하고 싶은 목표를 설정해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tomorrowGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateListItem(setTomorrowGoals, index, e.target.value)}
                      placeholder={`내일 목표 ${index + 1}`}
                      disabled={isViewMode}
                    />
                    {!isViewMode && tomorrowGoals.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem(setTomorrowGoals, index)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem(setTomorrowGoals)}
                  >
                    + 내일 목표 추가
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 하루 전체 돌아보기 */}
          <Card>
            <CardHeader>
              <CardTitle>🌟 하루 전체 돌아보기</CardTitle>
              <CardDescription>
                오늘 하루를 전체적으로 돌아보며 느낀 점을 자유롭게 작성해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="오늘 하루를 돌아보며 느낀 점, 개선할 점, 감사한 일 등을 자유롭게 작성해보세요..."
                        rows={5}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/reflection')}
            >
              목록으로
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '저장 중...' : existingReflection ? '수정하기' : '저장하기'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}