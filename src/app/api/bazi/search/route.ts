import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 搜索相似八字
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearGan = searchParams.get('yearGan')
    const yearZhi = searchParams.get('yearZhi')
    const monthGan = searchParams.get('monthGan')
    const monthZhi = searchParams.get('monthZhi')
    const dayGan = searchParams.get('dayGan')
    const dayZhi = searchParams.get('dayZhi')
    const hourGan = searchParams.get('hourGan')
    const hourZhi = searchParams.get('hourZhi')
    const dayMaster = searchParams.get('dayMaster')
    const matchMode = searchParams.get('matchMode') || 'exact' // exact / partial / dayMaster

    // 构建查询条件
    const where: any = { isPublic: true }

    if (matchMode === 'dayMaster') {
      // 仅匹配日主
      if (dayGan) where.dayGan = dayGan
      if (dayZhi) where.dayZhi = dayZhi
    } else if (matchMode === 'partial') {
      // 部分匹配: 匹配已有的柱
      if (yearGan) where.yearGan = yearGan
      if (yearZhi) where.yearZhi = yearZhi
      if (monthGan) where.monthGan = monthGan
      if (monthZhi) where.monthZhi = monthZhi
      if (dayGan) where.dayGan = dayGan
      if (dayZhi) where.dayZhi = dayZhi
      if (hourGan) where.hourGan = hourGan
      if (hourZhi) where.hourZhi = hourZhi
    } else {
      // 精确匹配 (四柱完全相同)
      if (yearGan) where.yearGan = yearGan
      if (yearZhi) where.yearZhi = yearZhi
      if (monthGan) where.monthGan = monthGan
      if (monthZhi) where.monthZhi = monthZhi
      if (dayGan) where.dayGan = dayGan
      if (dayZhi) where.dayZhi = dayZhi
      if (hourGan) where.hourGan = hourGan
      if (hourZhi) where.hourZhi = hourZhi
    }

    const records = await db.baziRecord.findMany({
      where,
      include: {
        lifeEvents: {
          orderBy: { year: 'asc' },
        },
        daYuns: {
          orderBy: { index: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // 计算匹配度
    const results = records.map(record => {
      let matchScore = 0
      const totalFields = 8
      if (yearGan && record.yearGan === yearGan) matchScore++
      if (yearZhi && record.yearZhi === yearZhi) matchScore++
      if (monthGan && record.monthGan === monthGan) matchScore++
      if (monthZhi && record.monthZhi === monthZhi) matchScore++
      if (dayGan && record.dayGan === dayGan) matchScore++
      if (dayZhi && record.dayZhi === dayZhi) matchScore++
      if (hourGan && record.hourGan === hourGan) matchScore++
      if (hourZhi && record.hourZhi === hourZhi) matchScore++

      return {
        ...record,
        matchScore: Math.round((matchScore / totalFields) * 100),
        matchCount: matchScore,
      }
    })

    // 按匹配度排序
    results.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      total: results.length,
      results,
    })
  } catch (error) {
    console.error('Search BaZi error:', error)
    return NextResponse.json(
      { error: '查询失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
