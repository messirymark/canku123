'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, ChevronRight, Loader2 } from 'lucide-react'

const WUXING_COLORS: Record<string, string> = {
  '木': 'text-green-600 dark:text-green-400',
  '火': 'text-red-600 dark:text-red-400',
  '土': 'text-yellow-600 dark:text-yellow-400',
  '金': 'text-gray-600 dark:text-gray-300',
  '水': 'text-blue-600 dark:text-blue-400',
}

const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
}

const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

const CATEGORY_LABELS: Record<string, string> = {
  marriage: '婚姻',
  career: '事业',
  health: '健康',
  wealth: '财运',
  education: '学业',
  family: '家庭',
  travel: '出行',
  other: '其他',
}

const CATEGORY_COLORS: Record<string, string> = {
  marriage: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
  career: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  health: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
  wealth: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
  education: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  family: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
  travel: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/40 dark:text-gray-300',
}

interface LiuNianInfo {
  year: number
  age: number
  gan: string
  zhi: string
  ganZhi: string
}

interface DaYunInfo {
  index: number
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  gan: string
  zhi: string
  ganZhi: string
  liuNian: LiuNianInfo[]
}

interface LifeEvent {
  id: string
  year: number
  age: number
  event: string
  category: string
  notes: string | null
  daYunIndex: number | null
  daYunGan: string | null
  daYunZhi: string | null
  liuNianGan: string | null
  liuNianZhi: string | null
}

interface TimelineProps {
  bazi: {
    daYun: DaYunInfo[]
    birthDate: string
    startAge: number
    startYear: number
    dayMaster: string
  }
  recordId: string | null
}

export function Timeline({ bazi, recordId }: TimelineProps) {
  const [events, setEvents] = useState<LifeEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expandedDaYuns, setExpandedDaYuns] = useState<Set<number>>(new Set())

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!recordId) return
    setLoadingEvents(true)
    try {
      const res = await fetch(`/api/bazi/${recordId}/events`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setLoadingEvents(false)
    }
  }, [recordId])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Track scroll progress
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const progress = max > 0 ? (el.scrollTop / max) * 100 : 0
    setScrollProgress(progress)
  }, [])

  // Scroll to specific year
  const scrollToYear = useCallback((year: number) => {
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector(`[data-year="${year}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  // Get events for a specific year
  const getEventsForYear = useCallback((year: number) => {
    return events.filter(e => e.year === year)
  }, [events])

  // Add/Edit event
  const handleSaveEvent = async (eventData: any) => {
    if (!recordId) {
      toast.error('八字未入库，无法添加事件')
      return
    }

    try {
      if (editingEvent) {
        // Update
        const res = await fetch(`/api/bazi/${recordId}/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        })
        if (!res.ok) throw new Error('更新失败')
        toast.success('事件已更新')
      } else {
        // Create
        const res = await fetch(`/api/bazi/${recordId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        })
        if (!res.ok) throw new Error('添加失败')
        toast.success('事件已添加')
      }
      setEditingEvent(null)
      setDialogOpen(false)
      fetchEvents()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!recordId) return
    try {
      const res = await fetch(`/api/bazi/${recordId}/events/${eventId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('删除失败')
      toast.success('事件已删除')
      fetchEvents()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const birthYear = parseInt(bazi.birthDate.split('-')[0])
  const currentYear = new Date().getFullYear()
  const totalYears = bazi.daYun.reduce((sum, dy) => sum + dy.liuNian.length, 0)

  // Toggle DaYun expansion
  const toggleDaYun = useCallback((idx: number) => {
    setExpandedDaYuns(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }, [])

  // Default: expand current DaYun on mount
  useEffect(() => {
    const idx = bazi.daYun.findIndex(dy => currentYear >= dy.startYear && currentYear <= dy.endYear)
    if (idx >= 0) {
      setExpandedDaYuns(new Set([idx]))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="border-amber-200/60 dark:border-zinc-700/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">
            大运 · 流年 · 人生履历
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-300"
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-300"
              onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-300 hidden sm:flex"
              onClick={() => scrollToYear(currentYear)}
            >
              今年
            </Button>
          </div>
        </div>
        {/* Scroll progress bar */}
        <div className="h-1 bg-amber-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{birthYear}年 出生</span>
          <span>{totalYears}年 人生履历</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Timeline Scroll Area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[800px] overflow-y-auto px-4 pb-4 timeline-scroll hide-scrollbar"
          style={{ scrollbarWidth: 'thin' }}
        >
          {loadingEvents && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
            </div>
          )}

          {bazi.daYun.map((daYun, dyIdx) => {
            const isChildhood = daYun.ganZhi === '童限' || !daYun.gan
            const isCurrentDaYun = currentYear >= daYun.startYear && currentYear <= daYun.endYear
            const isExpanded = expandedDaYuns.has(dyIdx)
            const yearEventsInDaYun = events.filter(e => e.year >= daYun.startYear && e.year <= daYun.endYear)
            return (
              <div key={dyIdx} className="mb-2">
                {/* Da Yun Header — clickable to toggle */}
                <div
                  className={`sticky top-0 z-10 backdrop-blur-sm py-2 border-b cursor-pointer select-none transition-colors ${
                    isCurrentDaYun
                      ? 'bg-amber-100/95 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600'
                      : 'bg-white/95 dark:bg-zinc-900/95 border-amber-200/50 dark:border-zinc-700/50'
                  } hover:bg-amber-50 dark:hover:bg-zinc-800/95`}
                  onClick={() => toggleDaYun(dyIdx)}
                >
                  <div className="flex items-center gap-3">
                    {/* Expand/Collapse chevron */}
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    }

                    {/* Da Yun Pillar */}
                    <div className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 font-bold text-xl flex-shrink-0 ${
                      isChildhood
                        ? 'border-gray-300 bg-gray-50 text-gray-400'
                        : isCurrentDaYun
                          ? 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 ring-2 ring-amber-400/50'
                          : 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                    }`}>
                      {isChildhood ? '童' : (
                        <div className="flex flex-col items-center leading-none">
                          <span className={WUXING_COLORS[GAN_WUXING[daYun.gan]]}>{daYun.gan}</span>
                          <span className={WUXING_COLORS[ZHI_WUXING[daYun.zhi]]}>{daYun.zhi}</span>
                        </div>
                      )}
                    </div>

                    {/* Da Yun Info */}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
                        {isChildhood ? '童限' : `第${daYun.index}步大运`} · {daYun.ganZhi}
                        {isCurrentDaYun && (
                          <Badge variant="outline" className="text-xs bg-amber-200 text-amber-900 border-amber-400 dark:bg-amber-800/50 dark:text-amber-200 dark:border-amber-600">
                            当前大运
                          </Badge>
                        )}
                        {!isExpanded && yearEventsInDaYun.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300">
                            {yearEventsInDaYun.length}条大事
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {daYun.startAge}岁 - {daYun.endAge}岁 · {daYun.startYear}年 - {daYun.endYear}年
                      </div>
                    </div>

                    {/* Add Event Button — stopPropagation to not toggle */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <AddEventButton
                        onAdd={() => {
                          setEditingEvent(null)
                          setDialogOpen(true)
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Liu Nian (Yearly) Entries — collapsible */}
                {isExpanded && (
                  <div className="ml-7 border-l-2 border-amber-200/50 dark:border-zinc-700/50">
                    {daYun.liuNian.map((ln, lnIdx) => {
                    const yearEvents = getEventsForYear(ln.year)
                    const hasEvents = yearEvents.length > 0
                    const isCurrentYear = ln.year === currentYear
                    return (
                      <div key={lnIdx} data-year={ln.year} className={`relative pl-4 py-2 group timeline-item ${isCurrentYear ? 'bg-amber-50/50 dark:bg-amber-900/10 rounded-lg' : ''}`}>
                        {/* Timeline dot */}
                        <div className={`absolute -left-[5px] top-4 w-2 h-2 rounded-full ${
                          hasEvents ? 'bg-amber-500' : 'bg-amber-200 dark:bg-zinc-600'
                        }`} />

                        {/* Year content */}
                        <div className={`rounded-lg p-2 transition-colors ${
                          hasEvents
                            ? 'bg-amber-50/60 dark:bg-zinc-800/40'
                            : 'hover:bg-amber-50/30 dark:hover:bg-zinc-800/20'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${isCurrentYear ? 'text-amber-700 dark:text-amber-300 underline decoration-amber-400 underline-offset-2' : 'text-amber-900 dark:text-amber-100'}`}>
                              {ln.year}年
                            </span>
                            {isCurrentYear && (
                              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                                今年
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {ln.age}岁
                            </span>
                            <span className={`text-sm font-bold ${WUXING_COLORS[GAN_WUXING[ln.gan]]}`}>
                              {ln.gan}
                            </span>
                            <span className={`text-sm font-bold ${WUXING_COLORS[ZHI_WUXING[ln.zhi]]}`}>
                              {ln.zhi}
                            </span>

                            {/* Quick add event */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                setEditingEvent({
                                  id: '',
                                  year: ln.year,
                                  age: ln.age,
                                  event: '',
                                  category: 'other',
                                  notes: null,
                                  daYunIndex: daYun.index,
                                  daYunGan: daYun.gan,
                                  daYunZhi: daYun.zhi,
                                  liuNianGan: ln.gan,
                                  liuNianZhi: ln.zhi,
                                })
                                setDialogOpen(true)
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Events for this year */}
                          {yearEvents.map(evt => (
                            <div
                              key={evt.id}
                              className="mt-1 p-2 rounded border bg-white/60 dark:bg-zinc-800/60 border-amber-200/40 dark:border-zinc-700/40"
                            >
                              <div className="flex items-start gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs flex-shrink-0 ${CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other}`}
                                >
                                  {CATEGORY_LABELS[evt.category] || evt.category}
                                </Badge>
                                <div className="flex-1 text-sm">
                                  <div className="font-medium text-amber-900 dark:text-amber-100">
                                    {evt.event}
                                  </div>
                                  {evt.notes && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {evt.notes}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditingEvent(evt)
                                      setDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500"
                                    onClick={() => handleDeleteEvent(evt.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Event Dialog */}
        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingEvent={editingEvent}
          daYuns={bazi.daYun}
          birthYear={birthYear}
          onSave={handleSaveEvent}
        />
      </CardContent>
    </Card>
  )
}

function AddEventButton({ onAdd }: { onAdd: () => void }) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs border-amber-300 text-amber-700"
      onClick={onAdd}
    >
      <Plus className="h-3 w-3" />
      <span className="hidden sm:inline">添加大事</span>
    </Button>
  )
}

function EventDialog({
  open,
  onOpenChange,
  editingEvent,
  daYuns,
  birthYear,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEvent: LifeEvent | null
  daYuns: DaYunInfo[]
  birthYear: number
  onSave: (data: any) => void
}) {
  const [year, setYear] = useState('')
  const [age, setAge] = useState('')
  const [event, setEvent] = useState('')
  const [category, setCategory] = useState('other')
  const [notes, setNotes] = useState('')
  const [daYunIndex, setDaYunIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingEvent) {
      setYear(String(editingEvent.year))
      setAge(String(editingEvent.age))
      setEvent(editingEvent.event)
      setCategory(editingEvent.category)
      setNotes(editingEvent.notes || '')
      setDaYunIndex(editingEvent.daYunIndex)
    } else {
      setYear(String(new Date().getFullYear()))
      setAge(String(new Date().getFullYear() - birthYear))
      setEvent('')
      setCategory('other')
      setNotes('')
      setDaYunIndex(null)
    }
  }, [editingEvent, birthYear, open])

  const handleSubmit = async () => {
    if (!year || !event) {
      toast.error('请填写年份和事件描述')
      return
    }

    // Find the matching DaYun and LiuNian
    const yearNum = parseInt(year)
    const matchedDaYun = daYuns.find(dy => yearNum >= dy.startYear && yearNum <= dy.endYear)
    const daYun = matchedDaYun && matchedDaYun.gan ? matchedDaYun : null

    setSaving(true)
    await onSave({
      year: yearNum,
      age: parseInt(age) || yearNum - birthYear,
      event,
      category,
      notes: notes || undefined,
      daYunIndex: daYun?.index ?? null,
      daYunGan: daYun?.gan ?? null,
      daYunZhi: daYun?.zhi ?? null,
      liuNianGan: null, // Will be computed by the Gan/Zhi of the year
      liuNianZhi: null,
    })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingEvent?.id ? '编辑人生大事' : '添加人生大事'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">年份</Label>
              <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">年龄</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">事件描述</Label>
            <Textarea
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="如：考上大学、结婚、创业..."
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">分类</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">备注 (可选)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="详细说明..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
