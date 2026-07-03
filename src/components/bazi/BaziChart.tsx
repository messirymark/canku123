'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
}

const WUXING_COLORS: Record<string, string> = {
  '木': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  '火': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  '土': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  '金': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600',
  '水': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
}

const WUXING_EMOJI: Record<string, string> = {
  '木': '🌳', '火': '🔥', '土': '🏔️', '金': '⚔️', '水': '💧'
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
      <div className={`w-full text-center py-2 rounded-lg border-2 font-bold text-2xl ${ganColor}`}>
        {pillar.gan}
      </div>

      {/* 地支 */}
      <div className={`w-full text-center py-2 rounded-lg border-2 font-bold text-2xl ${zhiColor}`}>
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

export function BaziChart({ bazi, recordId }: { bazi: BaziData; recordId?: string | null }) {
  const elements = (['金', '木', '水', '火', '土'] as const)
  const totalElements = Object.values(bazi.elementCounts).reduce((a, b) => a + b, 0)

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
      </CardHeader>

      <CardContent className="pt-4">
        {/* Four Pillars */}
        <div className="flex gap-2 sm:gap-4 justify-around mb-4">
          <PillarColumn label="年柱" pillar={bazi.yearPillar} />
          <PillarColumn label="月柱" pillar={bazi.monthPillar} />
          <PillarColumn label="日柱" pillar={bazi.dayPillar} isDayMaster />
          <PillarColumn label="时柱" pillar={bazi.hourPillar} />
        </div>

        {/* Day Master Info (hidden per user request) */}
      </CardContent>
    </Card>
  )
}
