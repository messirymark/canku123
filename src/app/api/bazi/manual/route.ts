import { NextRequest, NextResponse } from 'next/server'
import { calculateBaziFromPillars } from '@/lib/bazi/engine'
import { createBaziRecord, isGithubConfigured } from '@/lib/github-db'

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      yearGan, yearZhi, monthGan, monthZhi,
      dayGan, dayZhi, hourGan, hourZhi,
      gender, name, birthYear, notes, saveToDb = true,
    } = body

    // 校验
    const required = { yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi }
    for (const [field, val] of Object.entries(required)) {
      if (!val || !TIANGAN.includes(val) && !DIZHI.includes(val)) {
        return NextResponse.json({ error: `参数无效: ${field}` }, { status: 400 })
      }
    }
    // 分别校验干和支
    const ganFields = { yearGan, monthGan, dayGan, hourGan }
    const zhiFields = { yearZhi, monthZhi, dayZhi, hourZhi }
    for (const [field, val] of Object.entries(ganFields)) {
      if (!TIANGAN.includes(val)) return NextResponse.json({ error: `${field} 不是有效的天干` }, { status: 400 })
    }
    for (const [field, val] of Object.entries(zhiFields)) {
      if (!DIZHI.includes(val)) return NextResponse.json({ error: `${field} 不是有效的地支` }, { status: 400 })
    }

    if (!gender || !['male', 'female'].includes(gender)) {
      return NextResponse.json({ error: '性别参数无效' }, { status: 400 })
    }

    const result = calculateBaziFromPillars(
      yearGan, yearZhi, monthGan, monthZhi,
      dayGan, dayZhi, hourGan, hourZhi,
      gender,
      { name, birthYear, notes }
    )

    // 入库
    let recordId = null
    if (saveToDb && isGithubConfigured()) {
      const record = await createBaziRecord({
        name: name || null,
        gender,
        birthDate: birthYear ? `${birthYear}-00-00` : '未知',
        birthTime: '未知',
        birthHour: DIZHI.indexOf(hourZhi),
        yearGan, yearZhi,
        monthGan, monthZhi,
        dayGan, dayZhi,
        hourGan, hourZhi,
        dayMaster: result.dayMaster,
        forward: true,
        startAge: 0,
        startYear: birthYear || 0,
        elementCounts: JSON.stringify(result.elementCounts),
        isPublic: true,
        notes: notes || null,
        isManual: true,
        daYuns: [],
      })
      recordId = record.id
    }

    return NextResponse.json({ bazi: result, recordId })
  } catch (error) {
    console.error('Manual BaZi error:', error)
    return NextResponse.json(
      { error: '录入失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
