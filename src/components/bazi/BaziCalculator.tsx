'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { BaziChart } from './BaziChart'
import { Timeline } from './Timeline'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

type CalendarType = 'solar' | 'lunar'

export function BaziCalculator() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [datetime, setDatetime] = useState('1990-05-15T10:00')
  const [isLeap, setIsLeap] = useState(false)
  const [saveToDb, setSaveToDb] = useState(true)
  const [loading, setLoading] = useState(false)
  const [baziData, setBaziData] = useState<any>(null)
  const [recordId, setRecordId] = useState<string | null>(null)

  const handleCalculate = useCallback(async () => {
    setLoading(true)
    try {
      // 解析 datetime-local: "1990-05-15T10:00"
      const [datePart, timePart] = datetime.split('T')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hour, minute] = (timePart || '00:00').split(':').map(Number)

      if (!year || !month || !day) {
        toast.error('请选择出生时间')
        setLoading(false)
        return
      }

      const response = await fetch('/api/bazi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          gender,
          year,
          month,
          day,
          hour,
          minute,
          saveToDb,
          calendarType,
          isLeap,
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
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [name, gender, calendarType, datetime, isLeap, saveToDb])

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">出生信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 姓名 */}
          <div className="space-y-1.5">
            <Label className="text-xs">姓名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入姓名"
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
                  gender === 'male'
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                男
              </button>
              <button
                onClick={() => setGender('female')}
                className={cn(
                  'px-5 py-1 rounded-md text-sm transition-colors',
                  gender === 'female'
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                女
              </button>
            </div>
          </div>

          {/* 历法 */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">历法</Label>
            <div className="flex gap-1">
              <button
                onClick={() => setCalendarType('solar')}
                className={cn(
                  'px-4 py-1 rounded-md text-sm transition-colors',
                  calendarType === 'solar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                公历
              </button>
              <button
                onClick={() => setCalendarType('lunar')}
                className={cn(
                  'px-4 py-1 rounded-md text-sm transition-colors',
                  calendarType === 'lunar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
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
                    !isLeap
                      ? 'bg-amber-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  否
                </button>
                <button
                  onClick={() => setIsLeap(true)}
                  className={cn(
                    'px-4 py-1 rounded-md text-sm transition-colors',
                    isLeap
                      ? 'bg-amber-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  是
                </button>
              </div>
            </div>
          )}

          {/* 出生时间 */}
          <div className="space-y-1.5">
            <Label className="text-xs">出生时间 (必填)</Label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="h-9"
            />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {calendarType === 'lunar' ? '农历' : '公历'} {datetime.replace('T', ' ')}
            </p>
          </div>

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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '开始排盘'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* BaZi Chart */}
      {baziData && (
        <BaziChart bazi={baziData} recordId={recordId} />
      )}

      {/* Timeline */}
      {baziData && (
        <Timeline bazi={baziData} recordId={recordId} />
      )}
    </div>
  )
}
