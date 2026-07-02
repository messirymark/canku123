'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Loader2, Search, Eye, Calendar, User } from 'lucide-react'

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'] as const

const CATEGORY_LABELS: Record<string, string> = {
  marriage: '婚姻', career: '事业', health: '健康', wealth: '财运',
  education: '学业', family: '家庭', travel: '出行', other: '其他',
}

const CATEGORY_COLORS: Record<string, string> = {
  marriage: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  career: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  health: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  wealth: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  education: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  family: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  travel: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300',
}

export function BaziSearch() {
  const [matchMode, setMatchMode] = useState<'exact' | 'partial' | 'dayMaster'>('partial')
  const [yearGan, setYearGan] = useState('')
  const [yearZhi, setYearZhi] = useState('')
  const [monthGan, setMonthGan] = useState('')
  const [monthZhi, setMonthZhi] = useState('')
  const [dayGan, setDayGan] = useState('')
  const [dayZhi, setDayZhi] = useState('')
  const [hourGan, setHourGan] = useState('')
  const [hourZhi, setHourZhi] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [detailRecord, setDetailRecord] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (yearGan) params.set('yearGan', yearGan)
      if (yearZhi) params.set('yearZhi', yearZhi)
      if (monthGan) params.set('monthGan', monthGan)
      if (monthZhi) params.set('monthZhi', monthZhi)
      if (dayGan) params.set('dayGan', dayGan)
      if (dayZhi) params.set('dayZhi', dayZhi)
      if (hourGan) params.set('hourGan', hourGan)
      if (hourZhi) params.set('hourZhi', hourZhi)
      params.set('matchMode', matchMode)

      const res = await fetch(`/api/bazi/search?${params.toString()}`)
      if (!res.ok) throw new Error('查询失败')
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi, matchMode])

  const handleViewDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/bazi/${id}`)
      if (!res.ok) throw new Error('获取详情失败')
      const data = await res.json()
      setDetailRecord(data.record)
      setDetailOpen(true)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleClear = () => {
    setYearGan(''); setYearZhi('')
    setMonthGan(''); setMonthZhi('')
    setDayGan(''); setDayZhi('')
    setHourGan(''); setHourZhi('')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">
            查询相似八字
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            输入已知的八字信息，查询数据库中相同或相似的八字及其人生大事
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Match Mode */}
          <div className="space-y-1.5">
            <Label className="text-xs">匹配模式</Label>
            <Select value={matchMode} onValueChange={(v) => setMatchMode(v as any)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">完全匹配 (四柱完全相同)</SelectItem>
                <SelectItem value="partial">部分匹配 (按匹配度排序)</SelectItem>
                <SelectItem value="dayMaster">仅匹配日柱 (同日主)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pillar Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PILLAR_NAMES.map((name, idx) => {
              const ganSet = [yearGan, monthGan, dayGan, hourGan][idx]
              const zhiSet = [yearZhi, monthZhi, dayZhi, hourZhi][idx]
              const ganSetter = [setYearGan, setMonthGan, setDayGan, setHourGan][idx]
              const zhiSetter = [setYearZhi, setMonthZhi, setDayZhi, setHourZhi][idx]
              return (
                <div key={name} className="space-y-1.5">
                  <Label className="text-xs">{name}</Label>
                  <div className="grid grid-cols-2 gap-1">
                    <Select value={ganSet} onValueChange={ganSetter}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="干" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIANGAN.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={zhiSet} onValueChange={zhiSetter}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="支" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIZHI.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClear} className="h-9">
              清空
            </Button>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white h-9"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              查询
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <Card className="border-amber-200/60 dark:border-zinc-700/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-900 dark:text-amber-100">
              查询结果 ({results.length} 条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">未找到匹配的八字记录</p>
                <p className="text-xs mt-1">试试降低匹配条件，或排盘后自动入库供他人查询</p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-200/40 dark:border-zinc-700/40 hover:bg-amber-50/30 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {r.name && (
                          <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            {r.name}
                          </span>
                        )}
                        <span className="text-sm font-mono">
                          {r.yearGan}{r.yearZhi} {r.monthGan}{r.monthZhi} {r.dayGan}{r.dayZhi} {r.hourGan}{r.hourZhi}
                        </span>
                        {r.matchScore !== undefined && (
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                            匹配 {r.matchScore}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {r.birthDate} {r.birthTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {r.gender === 'male' ? '男' : '女'}
                        </span>
                        <span>日主: {r.dayMaster}</span>
                        {r._count?.lifeEvents !== undefined && (
                          <span>大事: {r._count.lifeEvents}条</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-amber-300 text-amber-700"
                      onClick={() => handleViewDetail(r.id)}
                    >
                      <Eye className="h-3 w-3" />
                      详情
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-100">
              八字详情 {detailRecord?.name ? `· ${detailRecord.name}` : ''}
            </DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-amber-50/30 dark:bg-zinc-800/30">
                    <div className="text-muted-foreground">年柱</div>
                    <div className="font-bold text-lg text-amber-900 dark:text-amber-100">
                      {detailRecord.yearGan}{detailRecord.yearZhi}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-amber-50/30 dark:bg-zinc-800/30">
                    <div className="text-muted-foreground">月柱</div>
                    <div className="font-bold text-lg text-amber-900 dark:text-amber-100">
                      {detailRecord.monthGan}{detailRecord.monthZhi}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-amber-50/30 dark:bg-zinc-800/30">
                    <div className="text-muted-foreground">日柱</div>
                    <div className="font-bold text-lg text-amber-900 dark:text-amber-100">
                      {detailRecord.dayGan}{detailRecord.dayZhi}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-amber-50/30 dark:bg-zinc-800/30">
                    <div className="text-muted-foreground">时柱</div>
                    <div className="font-bold text-lg text-amber-900 dark:text-amber-100">
                      {detailRecord.hourGan}{detailRecord.hourZhi}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded bg-amber-50/20 dark:bg-zinc-800/20">
                    <span className="text-muted-foreground">性别:</span>{' '}
                    <span className="font-medium">{detailRecord.gender === 'male' ? '男' : '女'}</span>
                  </div>
                  <div className="p-1.5 rounded bg-amber-50/20 dark:bg-zinc-800/20">
                    <span className="text-muted-foreground">日主:</span>{' '}
                    <span className="font-medium">{detailRecord.dayMaster}</span>
                  </div>
                  <div className="p-1.5 rounded bg-amber-50/20 dark:bg-zinc-800/20">
                    <span className="text-muted-foreground">起运:</span>{' '}
                    <span className="font-medium">{detailRecord.startAge}岁</span>
                  </div>
                </div>

                {/* Life Events */}
                <div>
                  <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                    人生大事 ({detailRecord.lifeEvents?.length || 0} 条)
                  </h3>
                  {detailRecord.lifeEvents && detailRecord.lifeEvents.length > 0 ? (
                    <div className="space-y-2">
                      {detailRecord.lifeEvents
                        .sort((a: any, b: any) => a.year - b.year)
                        .map((evt: any) => (
                        <div
                          key={evt.id}
                          className="p-2 rounded border border-amber-200/40 dark:border-zinc-700/40 bg-white/50 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs flex-shrink-0 ${CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other}`}
                            >
                              {CATEGORY_LABELS[evt.category] || evt.category}
                            </Badge>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span>{evt.year}年 ({evt.age}岁)</span>
                                {evt.daYunGan && (
                                  <span>大运: {evt.daYunGan}{evt.daYunZhi}</span>
                                )}
                              </div>
                              <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                {evt.event}
                              </div>
                              {evt.notes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {evt.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      暂无人生大事记录
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
