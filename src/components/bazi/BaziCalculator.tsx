'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BaziChart } from './BaziChart'
import { Timeline } from './Timeline'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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

export function BaziCalculator() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [year, setYear] = useState('1990')
  const [month, setMonth] = useState('5')
  const [day, setDay] = useState('15')
  const [hourIdx, setHourIdx] = useState('5') // 巳时 09:00-11:00
  const [minute, setMinute] = useState('0')
  const [saveToDb, setSaveToDb] = useState(true)
  const [loading, setLoading] = useState(false)
  const [baziData, setBaziData] = useState<any>(null)
  const [recordId, setRecordId] = useState<string | null>(null)

  const handleCalculate = useCallback(async () => {
    setLoading(true)
    try {
      const hourValue = HOURS.find(h => h.value === hourIdx)?.hour ?? 9
      const response = await fetch('/api/bazi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          gender,
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          hour: hourValue,
          minute: parseInt(minute),
          saveToDb,
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
  }, [name, gender, year, month, day, hourIdx, minute, saveToDb])

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">出生信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">姓名 (可选)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="姓名"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">性别</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-xs">年</Label>
              <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="month" className="text-xs">月</Label>
              <Input id="month" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="day" className="text-xs">日</Label>
              <Input id="day" type="number" min="1" max="31" value={day} onChange={(e) => setDay(e.target.value)} className="h-9" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">出生时辰</Label>
              <Select value={hourIdx} onValueChange={setHourIdx}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map(h => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minute" className="text-xs">分钟</Label>
              <Input id="minute" type="number" min="0" max="59" value={minute} onChange={(e) => setMinute(e.target.value)} className="h-9" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={saveToDb} onCheckedChange={setSaveToDb} id="save-db" />
              <Label htmlFor="save-db" className="text-xs cursor-pointer">
                自动入库 (供他人查询参考)
              </Label>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '排八字'}
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
