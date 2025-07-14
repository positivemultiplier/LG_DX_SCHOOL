'use client'

/**
 * Phase 3: Advanced GitHub Analytics Page
 * 고급 GitHub 분석 페이지
 */

import { AdvancedGitHubDashboard } from '@/components/github/advanced-dashboard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GitHubAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* 네비게이션 */}
        <div className="mb-6">
          <Link href="/settings/github">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to GitHub Settings
            </Button>
          </Link>
        </div>

        {/* 대시보드 컴포넌트 */}
        <AdvancedGitHubDashboard />
      </div>
    </div>
  )
}
