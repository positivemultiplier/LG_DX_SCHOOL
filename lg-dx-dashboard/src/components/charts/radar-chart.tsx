'use client'

import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend 
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors, chartTheme, customChartStyles } from '@/lib/chart-themes'

interface RadarChartData {
  subject: string
  morning: number
  afternoon: number
  evening: number
  fullMark: number
}

interface ThreePartRadarChartProps {
  data: RadarChartData[]
  loading?: boolean
  title?: string
  description?: string
  showLegend?: boolean
  period?: string
}

export function ThreePartRadarChart({ 
  data, 
  loading = false, 
  title = "3-Part 성과 비교", 
  description = "시간대별 학습 성과 분석",
  showLegend = true,
  period = "이번 주"
}: ThreePartRadarChartProps) {
  
  // 데이터 검증 및 기본값 처리
  const chartData = data && data.length > 0 ? data : generateSampleRadarData()
  const hasRealData = data && data.length > 0
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">차트 로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 빈 데이터 처리는 제거하고 항상 차트를 표시

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="bg-white p-3 border rounded-lg shadow-lg"
          style={{
            backgroundColor: chartTheme.tooltip.backgroundColor,
            color: chartTheme.tooltip.color,
            border: chartTheme.tooltip.border,
            borderRadius: chartTheme.tooltip.borderRadius,
            fontSize: chartTheme.tooltip.fontSize,
            padding: chartTheme.tooltip.padding
          }}
        >
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const timePartName = {
              morning: '🌅 오전수업',
              afternoon: '🌞 오후수업', 
              evening: '🌙 저녁자율학습'
            }[entry.dataKey] || entry.dataKey
            
            return (
              <p 
                key={index} 
                style={{ color: entry.color }}
                className="text-sm"
              >
                {timePartName}: {entry.value}/10
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">{period}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasRealData && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800 font-medium">📊 샘플 데이터</div>
            <div className="text-xs text-blue-600">실제 데이터가 없어 샘플 데이터를 표시합니다. 리플렉션을 작성하면 실제 데이터가 나타납니다.</div>
          </div>
        )}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={chartTheme.defaults.margin}>
              <PolarGrid 
                stroke={customChartStyles.radar.grid.stroke}
                strokeWidth={customChartStyles.radar.grid.strokeWidth}
              />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{
                  fontSize: chartTheme.axis.tick.fontSize,
                  fill: chartTheme.axis.tick.fill,
                  fontFamily: chartTheme.defaults.fontFamily
                }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={0}
                domain={[0, 10]}
                tick={{
                  fontSize: customChartStyles.radar.tick.fontSize,
                  fill: customChartStyles.radar.tick.fill
                }}
                tickCount={6}
              />
              
              {/* 오전수업 */}
              <Radar
                name="오전수업"
                dataKey="morning"
                stroke={chartColors.timeParts.morning}
                fill={chartColors.timeParts.morning}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  strokeWidth: 2,
                  fill: chartColors.timeParts.morning 
                }}
              />
              
              {/* 오후수업 */}
              <Radar
                name="오후수업"
                dataKey="afternoon"
                stroke={chartColors.timeParts.afternoon}
                fill={chartColors.timeParts.afternoon}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  strokeWidth: 2,
                  fill: chartColors.timeParts.afternoon 
                }}
              />
              
              {/* 저녁자율학습 */}
              <Radar
                name="저녁자율학습"
                dataKey="evening"
                stroke={chartColors.timeParts.evening}
                fill={chartColors.timeParts.evening}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ 
                  r: 3, 
                  strokeWidth: 2,
                  fill: chartColors.timeParts.evening 
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {showLegend && (
                <Legend 
                  wrapperStyle={{
                    fontSize: chartTheme.legend.fontSize,
                    color: chartTheme.legend.fill,
                    paddingTop: '20px'
                  }}
                  iconSize={chartTheme.legend.iconSize}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 차트 설명 */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs border-t pt-4">
          <div className="space-y-1">
            <div 
              className="w-3 h-3 rounded-full mx-auto"
              style={{ backgroundColor: chartColors.timeParts.morning }}
            />
            <div className="font-medium">오전수업</div>
            <div className="text-muted-foreground">09:00-12:00</div>
          </div>
          <div className="space-y-1">
            <div 
              className="w-3 h-3 rounded-full mx-auto"
              style={{ backgroundColor: chartColors.timeParts.afternoon }}
            />
            <div className="font-medium">오후수업</div>
            <div className="text-muted-foreground">13:00-17:00</div>
          </div>
          <div className="space-y-1">
            <div 
              className="w-3 h-3 rounded-full mx-auto"
              style={{ backgroundColor: chartColors.timeParts.evening }}
            />
            <div className="font-medium">저녁자율학습</div>
            <div className="text-muted-foreground">19:00-22:00</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function generateSampleRadarData(): RadarChartData[] {
  const subjects = [
    'Frontend 개발',
    'Backend 개발', 
    'Database',
    'DevOps',
    'Data Science',
    'Algorithm'
  ]
  
  return subjects.map(subject => ({
    subject,
    morning: Math.floor(Math.random() * 4) + 6, // 6-10 범위
    afternoon: Math.floor(Math.random() * 4) + 6,
    evening: Math.floor(Math.random() * 4) + 6,
    fullMark: 10
  }))
}