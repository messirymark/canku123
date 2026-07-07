'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Sparkles, GitMerge, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PillarData {
  gan: string
  zhi: string
  ganZhi: string
  ganWuxing: string
  zhiWuxing: string
  ganShiShen: string
  naYin: string
  zhiHideGan: string[]
  diShi: string
  xun: string
  xunKong: string[]
}

interface ShenshaResult {
  name: string
  position: string
  gan?: string
  zhi?: string
}

interface BranchRelation {
  type: '六合' | '三合' | '相冲' | '相刑' | '相害' | '自刑'
  branches: string[]
  description: string
  pillars: string[]
}

interface BaziData {
  yearPillar: PillarData
  monthPillar: PillarData
  dayPillar: PillarData
  hourPillar: PillarData
  dayMaster: string
  dayMasterWuxing: string
  forward: boolean
  startAge: number
  startYear: number
  elementCounts: Record<string, number>
  jieQi: string
  lunarDate: string
  taiYuan: string
  mingGong: string
  shenGong: string
  birthDate: string
  birthTime: string
  gender: string
  birthHourZhi: string
  birthplace?: string
  longitude?: number
  solarTimeAdjusted?: boolean
  adjustedTime?: string
  shensha?: ShenshaResult[]
  branchRelations?: BranchRelation[]
}

const WUXING_COLORS: Record<string, string> = {
  '木': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  '火': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  '土': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  '金': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600',
  '水': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
}

const WUXING_BAR_COLORS: Record<string, string> = {
  '木': 'bg-green-500',
  '火': 'bg-red-500',
  '土': 'bg-yellow-500',
  '金': 'bg-gray-400',
  '水': 'bg-blue-500',
}

const WUXING_EMOJI: Record<string, string> = {
  '木': '🌳', '火': '🔥', '土': '🏔️', '金': '⚔️', '水': '💧'
}

const RELATION_STYLE: Record<string, string> = {
  '六合': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '三合': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '相冲': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  '相刑': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '相害': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '自刑': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
}

function PillarColumn({
  label,
  pillar,
  isDayMaster,
}: {
  label: string
  pillar: PillarData
  isDayMaster?: boolean
}) {
  const ganColor = WUXING_COLORS[pillar.ganWuxing] || ''
  const zhiColor = WUXING_COLORS[pillar.zhiWuxing] || ''

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      {/* Label */}
      <div className="text-xs font-medium text-amber-800 dark:text-amber-200">{label}</div>

      {/* 十神 */}
      <div className="text-xs text-muted-foreground h-4">
        {isDayMaster ? '日主' : pillar.ganShiShen}
      </div>

      {/* 天干 */}
      <div className={cn('w-full text-center py-2 rounded-lg border-2 font-bold text-2xl', ganColor)}>
        {pillar.gan}
      </div>

      {/* 地支 */}
      <div className={cn('w-full text-center py-2 rounded-lg border-2 font-bold text-2xl', zhiColor)}>
        {pillar.zhi}
      </div>

      {/* 藏干 */}
      <div className="text-xs text-muted-foreground">
        {pillar.zhiHideGan.length > 0 ? pillar.zhiHideGan.join('') : '—'}
      </div>

      {/* 纳音 */}
      <div className="text-xs text-amber-700/70 dark:text-amber-300/50">
        {pillar.naYin}
      </div>

      {/* 地势 */}
      <div className="text-xs text-muted-foreground">
        {pillar.diShi}
      </div>
    </div>
  )
}

function FiveElementBar({ elementCounts }: { elementCounts: Record<string, number> }) {
  const elements = (['木', '火', '土', '金', '水'] as const)
  const total = elements.reduce((sum, e) => sum + (elementCounts[e] || 0), 0) || 1

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-amber-800 dark:text-amber-200">五行能量</div>
      <div className="space-y-1">
        {elements.map(e => {
          const count = elementCounts[e] || 0
          const pct = Math.round((count / total) * 100)
          return (
            <div key={e} className="flex items-center gap-2">
              <span className="text-xs w-8 flex items-center gap-0.5">
                <span>{WUXING_EMOJI[e]}</span>
                <span className="text-muted-foreground">{e}</span>
              </span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                <div
                  className={cn('h-full rounded-full transition-all', WUXING_BAR_COLORS[e])}
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/80">
                  {count} ({pct}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ShenshaDisplay({ shensha }: { shensha: ShenshaResult[] }) {
  if (!shensha || shensha.length === 0) return null

  // Group by position
  const byPosition: Record<string, ShenshaResult[]> = {}
  for (const s of shensha) {
    const key = s.position.charAt(0) // 年/月/日/时
    if (!byPosition[key]) byPosition[key] = []
    byPosition[key].push(s)
  }

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        神煞
      </div>
      <div className="flex flex-wrap gap-1.5">
        {shensha.map((s, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-xs bg-amber-50/50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300"
          >
            {s.name}
            <span className="text-muted-foreground ml-1">·{s.position}</span>
          </Badge>
        ))}
      </div>
    </div>
  )
}

function BranchRelationDisplay({ relations }: { relations: BranchRelation[] }) {
  if (!relations || relations.length === 0) return null

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1">
        <GitMerge className="h-3 w-3" />
        地支关系
      </div>
      <div className="flex flex-wrap gap-1.5">
        {relations.map((r, i) => (
          <span
            key={i}
            className={cn('text-xs px-2 py-0.5 rounded-full', RELATION_STYLE[r.type] || '')}
          >
            {r.description}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BaziChart({ bazi, recordId }: { bazi: BaziData; recordId?: string | null }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <Card className="border-amber-200/60 dark:border-zinc-700/60 overflow-hidden">
      <CardHeader className="bg-amber-50/50 dark:bg-zinc-800/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">四柱八字</CardTitle>
          {recordId && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
              已入库
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {bazi.birthDate} {bazi.birthTime} · {bazi.gender === 'male' ? '男' : '女'} · {bazi.lunarDate}
        </div>
        {/* 真太阳时提示 */}
        {bazi.solarTimeAdjusted && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400">
            <AlertCircle className="h-3 w-3" />
            <span>
              已按{bazi.birthplace}（东经{bazi.longitude}°）校正真太阳时
              {bazi.adjustedTime && `，校正后 ${bazi.adjustedTime}`}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Four Pillars */}
        <div className="flex gap-2 sm:gap-4 justify-around">
          <PillarColumn label="年柱" pillar={bazi.yearPillar} />
          <PillarColumn label="月柱" pillar={bazi.monthPillar} />
          <PillarColumn label="日柱" pillar={bazi.dayPillar} isDayMaster />
          <PillarColumn label="时柱" pillar={bazi.hourPillar} />
        </div>

        {/* 五行能量条 */}
        <FiveElementBar elementCounts={bazi.elementCounts} />

        {/* 神煞 */}
        {bazi.shensha && bazi.shensha.length > 0 && (
          <ShenshaDisplay shensha={bazi.shensha} />
        )}

        {/* 地支关系 */}
        {bazi.branchRelations && bazi.branchRelations.length > 0 && (
          <BranchRelationDisplay relations={bazi.branchRelations} />
        )}

        {/* 高级信息折叠 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
        >
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showAdvanced ? '收起高级信息' : '展开高级信息（胎元·命宫·身宫·旬空）'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">胎元</span>
              <span className="font-medium text-amber-800 dark:text-amber-200">{bazi.taiYuan || '—'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">命宫</span>
              <span className="font-medium text-amber-800 dark:text-amber-200">{bazi.mingGong || '—'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">身宫</span>
              <span className="font-medium text-amber-800 dark:text-amber-200">{bazi.shenGong || '—'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">旬空</span>
              <span className="font-medium text-amber-800 dark:text-amber-200">
                {bazi.dayPillar.xunKong?.length > 0 ? bazi.dayPillar.xunKong.join('、') : '—'}
              </span>
            </div>
            {bazi.jieQi && (
              <div className="flex justify-between p-2 rounded bg-muted/50 col-span-2">
                <span className="text-muted-foreground">节气</span>
                <span className="font-medium text-amber-800 dark:text-amber-200">{bazi.jieQi}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
