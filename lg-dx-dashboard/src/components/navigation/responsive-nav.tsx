'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu,
  BarChart3, 
  Calendar, 
  GitBranch, 
  TrendingUp, 
  Users,
  Home,
  Settings,
  BookOpen,
  Target,
  Award,
  Brain,
  ChevronRight
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
  isNew?: boolean
}

const navigationItems: NavItem[] = [
  {
    title: '대시보드',
    href: '/',
    icon: Home,
    description: '학습 현황 요약'
  },
  {
    title: '분석 개요',
    href: '/analytics',
    icon: BarChart3,
    description: '상세 성과 분석'
  },
  {
    title: '코치 분석',
    href: '/analytics/coach',
    icon: Users,
    description: '전문가 관점 분석',
    isNew: true
  },
  {
    title: '학습 기록',
    href: '/reflections',
    icon: BookOpen,
    description: '일일 리플렉션'
  },
  {
    title: '목표 관리',
    href: '/goals',
    icon: Target,
    description: '학습 목표 설정'
  },
  {
    title: '설정',
    href: '/settings',
    icon: Settings,
    description: '환경 설정'
  }
]

interface ResponsiveNavProps {
  className?: string
}

export function ResponsiveNav({ className }: ResponsiveNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className={cn('lg:hidden', className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="text-left">LG DX Dashboard</SheetTitle>
          </SheetHeader>
          
          <div className="px-6 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      'hover:bg-gray-100 hover:text-gray-900',
                      isActive 
                        ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                        : 'text-gray-700'
                    )}
                  >
                    <Icon className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.isNew && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            NEW
                          </Badge>
                        )}
                        {item.badge && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* 빠른 액션 */}
          <div className="border-t px-6 py-4">
            <div className="text-xs font-medium text-gray-500 mb-3">빠른 액션</div>
            <div className="space-y-2">
              <Button 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/reflections/new">
                  <BookOpen className="h-3 w-3 mr-2" />
                  새 리플렉션 작성
                </Link>
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/analytics/coach">
                  <Brain className="h-3 w-3 mr-2" />
                  AI 코칭 받기
                </Link>
              </Button>
            </div>
          </div>
          
          {/* 학습 진행 상황 */}
          <div className="border-t px-6 py-4">
            <div className="text-xs font-medium text-gray-500 mb-3">이번 주 진행</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>리플렉션</span>
                  <span>5/7일</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>GitHub 활동</span>
                  <span>12 커밋</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>평균 점수</span>
                  <span>7.8/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

ResponsiveNav.displayName = 'ResponsiveNav'