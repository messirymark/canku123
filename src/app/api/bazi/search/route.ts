import { NextRequest, NextResponse } from 'next/server'
import { searchBaziRecords, isGithubConfigured } from '@/lib/github-db'

// 搜索相似八字
export async function GET(request: NextRequest) {
  try {
    if (!isGithubConfigured()) {
      return NextResponse.json({ total: 0, results: [] })
    }

    const { searchParams } = new URL(request.url)
    const yearGan = searchParams.get('yearGan') || ''
    const yearZhi = searchParams.get('yearZhi') || ''
    const monthGan = searchParams.get('monthGan') || ''
    const monthZhi = searchParams.get('monthZhi') || ''
    const dayGan = searchParams.get('dayGan') || ''
    const dayZhi = searchParams.get('dayZhi') || ''
    const hourGan = searchParams.get('hourGan') || ''
    const hourZhi = searchParams.get('hourZhi') || ''
    const matchMode = searchParams.get('matchMode') || 'exact'

    const criteria = { yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi }

    const results = await searchBaziRecords(criteria, matchMode)

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
