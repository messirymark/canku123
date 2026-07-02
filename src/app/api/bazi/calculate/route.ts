import { NextRequest, NextResponse } from 'next/server'
import { calculateBazi } from '@/lib/bazi/engine'
import { createBaziRecord, isGithubConfigured } from '@/lib/github-db'

// 排八字并自动入库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, month, day, hour, minute, gender, name, saveToDb = true } = body

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json(
        { error: '缺少必要参数: year, month, day, hour, gender' },
        { status: 400 }
      )
    }

    // 计算八字
    const result = calculateBazi(year, month, day, hour, minute || 0, gender)

    // 自动入库
    let recordId = null
    if (saveToDb && isGithubConfigured()) {
      const record = await createBaziRecord({
        name: name || null,
        gender,
        birthDate: result.birthDate,
        birthTime: result.birthTime,
        birthHour: result.birthHourZhi ? '子丑寅卯辰巳午未申酉戌亥'.indexOf(result.birthHourZhi) : 0,
        yearGan: result.yearPillar.gan,
        yearZhi: result.yearPillar.zhi,
        monthGan: result.monthPillar.gan,
        monthZhi: result.monthPillar.zhi,
        dayGan: result.dayPillar.gan,
        dayZhi: result.dayPillar.zhi,
        hourGan: result.hourPillar.gan,
        hourZhi: result.hourPillar.zhi,
        dayMaster: result.dayMaster,
        forward: result.forward,
        startAge: result.startAge,
        startYear: result.startYear,
        elementCounts: JSON.stringify(result.elementCounts),
        isPublic: true,
        daYuns: result.daYun.map(dy => ({
          index: dy.index,
          startAge: dy.startAge,
          endAge: dy.endAge,
          startYear: dy.startYear,
          endYear: dy.endYear,
          gan: dy.gan,
          zhi: dy.zhi,
        })),
      })
      recordId = record.id
    }

    return NextResponse.json({
      bazi: result,
      recordId,
    })
  } catch (error) {
    console.error('Calculate BaZi error:', error)
    return NextResponse.json(
      { error: '排盘失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
