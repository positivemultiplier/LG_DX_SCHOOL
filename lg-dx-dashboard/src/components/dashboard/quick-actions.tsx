'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Eye, 
  Calendar, 
  Clock, 
  GitBranch, 
  BarChart3,
  BookOpen,
  Target,
  Users,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  todayReflections: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  currentTimePart: 'morning' | 'afternoon' | 'evening' | 'rest';
}

export function QuickActions({ todayReflections, currentTimePart }: QuickActionsProps) {
  const getCurrentTimeAction = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour < 12) return 'morning';
    if (hour >= 13 && hour < 17) return 'afternoon';
    if (hour >= 19 && hour < 22) return 'evening';
    return 'rest';
  };

  const getRecommendedAction = () => {
    const timeNow = getCurrentTimeAction();
    
    if (timeNow === 'morning' && !todayReflections.morning) {
      return {
        text: '오전 리플렉션 작성',
        href: '/reflection/morning',
        icon: <Plus className="h-4 w-4" />,
        variant: 'default' as const,
        urgent: true
      };
    }
    
    if (timeNow === 'afternoon' && !todayReflections.afternoon) {
      return {
        text: '오후 리플렉션 작성',
        href: '/reflection/afternoon',
        icon: <Plus className="h-4 w-4" />,
        variant: 'default' as const,
        urgent: true
      };
    }
    
    if (timeNow === 'evening' && !todayReflections.evening) {
      return {
        text: '저녁 리플렉션 작성',
        href: '/reflection/evening',
        icon: <Plus className="h-4 w-4" />,
        variant: 'default' as const,
        urgent: true
      };
    }

    // 미완료된 리플렉션이 있는지 확인
    if (!todayReflections.morning) {
      return {
        text: '오전 리플렉션 작성',
        href: '/reflection/morning',
        icon: <Plus className="h-4 w-4" />,
        variant: 'outline' as const,
        urgent: false
      };
    }
    
    if (!todayReflections.afternoon) {
      return {
        text: '오후 리플렉션 작성',
        href: '/reflection/afternoon',
        icon: <Plus className="h-4 w-4" />,
        variant: 'outline' as const,
        urgent: false
      };
    }
    
    if (!todayReflections.evening) {
      return {
        text: '저녁 리플렉션 작성',
        href: '/reflection/evening',
        icon: <Plus className="h-4 w-4" />,
        variant: 'outline' as const,
        urgent: false
      };
    }

    return {
      text: '리플렉션 히스토리 보기',
      href: '/reflection',
      icon: <Eye className="h-4 w-4" />,
      variant: 'outline' as const,
      urgent: false
    };
  };

  const recommendedAction = getRecommendedAction();

  const quickActionItems = [
    {
      title: '새 리플렉션',
      description: '오늘의 학습 경험 기록',
      icon: <Plus className="h-5 w-5" />,
      items: [
        {
          text: '🌅 오전수업',
          href: '/reflection/morning',
          completed: todayReflections.morning,
          timeRange: '09:00-12:00'
        },
        {
          text: '🌞 오후수업',
          href: '/reflection/afternoon',
          completed: todayReflections.afternoon,
          timeRange: '13:00-17:00'
        },
        {
          text: '🌙 저녁자율학습',
          href: '/reflection/evening',
          completed: todayReflections.evening,
          timeRange: '19:00-22:00'
        }
      ]
    },
    {
      title: '분석 및 리포트',
      description: '학습 패턴 및 성과 분석',
      icon: <BarChart3 className="h-5 w-5" />,
      items: [
        {
          text: '고급 분석',
          href: '/analytics',
          description: '상세 성과 분석'
        },
        {
          text: '월간 리포트',
          href: '/analytics?tab=trends',
          description: '월간 학습 리포트'
        },
        {
          text: 'GitHub 활동',
          href: '/analytics?tab=github',
          description: 'GitHub 커밋 분석'
        }
      ]
    },
    {
      title: '설정 및 관리',
      description: '개인 설정 및 목표 관리',
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          text: '학습 목표',
          href: '/goals',
          description: '개인 학습 목표 설정'
        },
        {
          text: '과목 관리',
          href: '/subjects',
          description: '학습 과목 관리'
        },
        {
          text: 'GitHub 연동',
          href: '/settings/github',
          description: 'GitHub 계정 연동'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* 추천 액션 */}
      <Card className={recommendedAction.urgent ? 'border-orange-200 bg-orange-50/50' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            추천 액션
            {recommendedAction.urgent && (
              <Badge variant="destructive" className="text-xs">
                지금 하기
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            현재 시간에 맞는 권장 작업
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{recommendedAction.text}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getCurrentTimeAction() === 'rest' ? '휴식 시간' : '학습 시간'}
              </div>
            </div>
            <Button 
              asChild 
              variant={recommendedAction.variant}
              className={recommendedAction.urgent ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Link href={recommendedAction.href} className="flex items-center gap-2">
                {recommendedAction.icon}
                시작하기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 빠른 액션 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActionItems.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  {'completed' in item ? (
                    // 리플렉션 아이템
                    <Button
                      asChild
                      variant={item.completed ? 'outline' : 'ghost'}
                      size="sm"
                      className="w-full justify-between"
                    >
                      <Link href={item.href}>
                        <div className="flex items-center gap-2">
                          <span>{item.text}</span>
                          {item.completed && (
                            <Badge variant="secondary" className="text-xs">완료</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.timeRange}
                        </span>
                      </Link>
                    </Button>
                  ) : (
                    // 일반 아이템
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Link href={item.href}>
                        <div className="text-left">
                          <div className="font-medium">{item.text}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 오늘의 상태 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            오늘의 진행 상황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">오전수업</div>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                todayReflections.morning 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {todayReflections.morning ? '✓' : '○'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">오후수업</div>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                todayReflections.afternoon 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {todayReflections.afternoon ? '✓' : '○'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">저녁자율학습</div>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                todayReflections.evening 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {todayReflections.evening ? '✓' : '○'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              완료율: {Object.values(todayReflections).filter(Boolean).length}/3 
              ({Math.round((Object.values(todayReflections).filter(Boolean).length / 3) * 100)}%)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}