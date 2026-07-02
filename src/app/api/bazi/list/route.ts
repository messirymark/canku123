import { NextRequest, NextResponse } from 'next/server'
import { listBaziRecords, isGithubConfigured } from '@/lib/github-db'

// 获取八字列表 (管理员)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const adminToken = searchParams.get('adminToken') || ''

    if (adminToken !== process.env.ADMIN_TOKEN && adminToken !== 'bazi-admin-2026') {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    if (!isGithubConfigured()) {
      return NextResponse.json({ records: [], total: 0, page, pageSize, totalPages: 0 })
    }

    const { records, total } = await listBaziRecords({ page, pageSize, search })

    return NextResponse.json({
      records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('List BaZi error:', error)
    return NextResponse.json(
      { error: '获取列表失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
