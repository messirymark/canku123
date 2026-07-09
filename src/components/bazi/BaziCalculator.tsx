'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BaziChart } from './BaziChart'
import { Timeline } from './Timeline'
import { toast } from 'sonner'
import { Loader2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CITY_LONGITUDES } from '@/lib/bazi/engine'

// 城市列表
const CITIES = Object.keys(CITY_LONGITUDES).sort()

const HOURS = [
  { value: '0', label: '子时 23:00-01:00', hour: 23 },
  { value: '1', label: '丑时 01:00-03:00', hour: 1 },
  { value: '2', label: '寅时 03:00-05:00', hour: 3 },
  { value: '3', label: '卯时 05:00-07:00', hour: 5 },
  { value: '4', label: '辰时 07:00-09:00', hour: 7 },
  { value: '5', label: '巳时 09:00-11:00', hour: 9 },
  { value: '6', label: '午时 11:00-13:00', hour: 11 },
  { value: '7', label: '未时 13:00-15:00', hour: 13 },
  { value: '8', label: '申时 15:00-17:00', hour: 15 },
  { value: '9', label: '酉时 17:00-19:00', hour: 17 },
  { value: '10', label: '戌时 19:00-21:00', hour: 19 },
  { value: '11', label: '亥时 21:00-23:00', hour: 21 },
]

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱'] as const

// 年份范围
const YEAR_MIN = 1900
const YEAR_MAX = 2030
const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

type CalendarType = 'solar' | 'lunar'
type InputMode = 'date' | 'pillars'

export function BaziCalculator() {
  const [inputMode, setInputMode] = useState<InputMode>('date')

  // 共享状态
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [saveToDb, setSaveToDb] = useState(true)
  const [loading, setLoading] = useState(false)
  const [baziData, setBaziData] = useState<any>(null)
  const [recordId, setRecordId] = useState<string | null>(null)

  // 日期模式 — 拆成年月日时四个下拉
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [selYear, setSelYear] = useState(1990)
  const [selMonth, setSelMonth] = useState(5)
  const [selDay, setSelDay] = useState(15)
  const [selHourIdx, setSelHourIdx] = useState(5) // 巳时
  const [isLeap, setIsLeap] = useState(false)
  const [birthplace, setBirthplace] = useState<string>('')

  // 四柱模式
  const [pillars, setPillars] = useState({
    yearGan: '', yearZhi: '', monthGan: '', monthZhi: '',
    dayGan: '', dayZhi: '', hourGan: '', hourZhi: '',
  })
  const [birthYear, setBirthYear] = useState('')
  const [notes, setNotes] = useState('')
  const [startAge, setStartAge] = useState('1')

  // 根据年月计算当月天数
  const daysInMonth = useMemo(() => {
    if (calendarType === 'lunar') return 30 // 农历最多30天
    const d = new Date(selYear, selMonth, 0)
    return d.getDate()
  }, [selYear, selMonth, calendarType])

  const handleCalculate = useCallback(async () => {
    setLoading(true)
    try {
      if (inputMode === 'date') {
        const hour = HOURS[selHourIdx].hour
        const minute = 0

        if (!selYear || !selMonth || !selDay) {
          toast.error('请选择出生时间')
          setLoading(false)
          return
        }

        const response = await fetch('/api/bazi/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || undefined,
            gender, year: selYear, month: selMonth, day: selDay, hour, minute,
            saveToDb, calendarType, isLeap,
            birthplace: birthplace || undefined,
          }),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '排盘失败')
        }
        const data = await response.json()
        setBaziData(data.bazi)
        setRecordId(data.recordId)
        toast.success('排盘完成！')
      } else {
        // 四柱模式
        const p = pillars
        if (!p.yearGan || !p.yearZhi || !p.monthGan || !p.monthZhi || !p.dayGan || !p.dayZhi || !p.hourGan || !p.hourZhi) {
          toast.error('请填写完整的四柱')
          setLoading(false)
          return
        }

        const response = await fetch('/api/bazi/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || undefined,
            gender,
            ...p,
            birthYear: birthYear ? Number(birthYear) : undefined,
            notes: notes || undefined,
            startAge: Number(startAge) || 1,
            saveToDb,
          }),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '录入失败')
        }
        const data = await response.json()
        setBaziData(data.bazi)
        setRecordId(data.recordId)
        toast.success('录入完成！')
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [inputMode, name, gender, calendarType, selYear, selMonth, selDay, selHourIdx, isLeap, saveToDb, pillars, birthYear, notes, startAge, birthplace])

  const updatePillar = (field: keyof typeof pillars, value: string) => {
    setPillars(prev => ({ ...prev, [field]: value }))
  }

  // 年份快速调整
  const shiftYear = (delta: number) => {
    setSelYear(y => Math.max(YEAR_MIN, Math.min(YEAR_MAX, y + delta)))
  }

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-amber-900 dark:text-amber-100">
              {inputMode === 'date' ? '出生信息' : '手动录入八字'}
            </CardTitle>
            <div className="flex gap-1">
              <button
                onClick={() => setInputMode('date')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs transition-colors',
                  inputMode === 'date' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                按出生时间
              </button>
              <button
                onClick={() => setInputMode('pillars')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs transition-colors',
                  inputMode === 'pillars' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                按四柱录入
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 姓名 */}
          <div className="space-y-1.5">
            <Label className="text-xs">姓名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入姓名（如：苏轼）"
              className="h-9"
            />
          </div>

          {/* 性别 */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">性别</Label>
            <div className="flex gap-1">
              <button
                onClick={() => setGender('male')}
                className={cn(
                  'px-5 py-1 rounded-md text-sm transition-colors',
                  gender === 'male' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                男
              </button>
              <button
                onClick={() => setGender('female')}
                className={cn(
                  'px-5 py-1 rounded-md text-sm transition-colors',
                  gender === 'female' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                女
              </button>
            </div>
          </div>

          {inputMode === 'date' ? (
            <>
              {/* 历法 */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">历法</Label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCalendarType('solar')}
                    className={cn(
                      'px-4 py-1 rounded-md text-sm transition-colors',
                      calendarType === 'solar' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    公历
                  </button>
                  <button
                    onClick={() => setCalendarType('lunar')}
                    className={cn(
                      'px-4 py-1 rounded-md text-sm transition-colors',
                      calendarType === 'lunar' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    农历
                  </button>
                </div>
              </div>

              {/* 农历闰月 */}
              {calendarType === 'lunar' && (
                <div className="flex items-center justify-between">
                  <Label className="text-xs">闰月</Label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsLeap(false)}
                      className={cn(
                        'px-4 py-1 rounded-md text-sm transition-colors',
                        !isLeap ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      否
                    </button>
                    <button
                      onClick={() => setIsLeap(true)}
                      className={cn(
                        'px-4 py-1 rounded-md text-sm transition-colors',
                        isLeap ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      是
                    </button>
                  </div>
                </div>
              )}

              {/* 年份 — 突出显示，带快速调整 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-amber-800 dark:text-amber-200">年份</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-amber-300 flex-shrink-0"
                    onClick={() => shiftYear(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Select value={String(selYear)} onValueChange={(v) => setSelYear(Number(v))}>
                    <SelectTrigger className="h-10 flex-1 text-center text-lg font-bold text-amber-900 dark:text-amber-100 border-amber-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}年</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-amber-300 flex-shrink-0"
                    onClick={() => shiftYear(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 月日 — 一行两个 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">月</Label>
                  <Select value={String(selMonth)} onValueChange={(v) => setSelMonth(Number(v))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => (
                        <SelectItem key={m} value={String(m)}>{m}月</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">日</Label>
                  <Select value={String(selDay)} onValueChange={(v) => setSelDay(Number(v))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.slice(0, daysInMonth).map(d => (
                        <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 时辰 — 单独一行，避免手机溢出 */}
              <div className="space-y-1.5">
                <Label className="text-xs">时辰</Label>
                <Select value={String(selHourIdx)} onValueChange={(v) => setSelHourIdx(Number(v))}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map(h => (
                      <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                {calendarType === 'lunar' ? '农历' : '公历'} {selYear}年{selMonth}月{selDay}日 {HOURS[selHourIdx].label}
              </p>

              {/* 出生地（真太阳时校正） */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  出生地 <span className="text-muted-foreground">（真太阳时校正，可选）</span>
                </Label>
                <Select value={birthplace} onValueChange={setBirthplace}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="选择出生城市（不选则用北京时间）" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}（东经{CITY_LONGITUDES[c].longitude}°）</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {/* 四柱输入 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PILLAR_LABELS.map((label, idx) => {
                  const ganField = ['yearGan', 'monthGan', 'dayGan', 'hourGan'][idx] as keyof typeof pillars
                  const zhiField = ['yearZhi', 'monthZhi', 'dayZhi', 'hourZhi'][idx] as keyof typeof pillars
                  return (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-xs">{label}</Label>
                      <div className="grid grid-cols-2 gap-1">
                        <Select value={pillars[ganField]} onValueChange={(v) => updatePillar(ganField, v)}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="干" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIANGAN.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={pillars[zhiField]} onValueChange={(v) => updatePillar(zhiField, v)}>
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

              {/* 起运岁数 + 出生年份 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">起运岁数</Label>
                  <Input
                    type="number"
                    value={startAge}
                    onChange={(e) => setStartAge(e.target.value)}
                    placeholder="如：1"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">出生年份 (可选)</Label>
                  <Input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="如：1037"
                    className="h-9"
                  />
                </div>
              </div>

              {/* 备注 */}
              <div className="space-y-1.5">
                <Label className="text-xs">备注 (可选)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="如：北宋文豪、字子瞻"
                  className="h-9"
                />
              </div>

              <p className="text-xs text-amber-600/80 dark:text-amber-400/60">
                大运按年干阴阳+性别自动排定（阳男阴女顺排，阴男阳女逆排），共10步
              </p>
            </>
          )}

          {/* 保存 + 排盘按钮 */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Switch checked={saveToDb} onCheckedChange={setSaveToDb} id="save-db" />
              <Label htmlFor="save-db" className="text-xs cursor-pointer">
                保存入库
              </Label>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : inputMode === 'date' ? '开始排盘' : '录入排盘'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* BaZi Chart */}
      {baziData && (
        <BaziChart bazi={baziData} recordId={recordId} />
      )}

      {/* Timeline */}
      {baziData && baziData.daYun && baziData.daYun.length > 0 && (
        <Timeline bazi={baziData} recordId={recordId} />
      )}
    </div>
  )
}
