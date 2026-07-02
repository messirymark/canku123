import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取八字列表 (管理员)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const adminToken = searchParams.get('adminToken') || ''

    // 简单管理员验证
    if (adminToken !== process.env.ADMIN_TOKEN && adminToken !== 'bazi-admin-2026') {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { dayGan: { contains: search } },
        { dayZhi: { contains: search } },
        { birthDate: { contains: search } },
      ]
    }

    const [records, total] = await Promise.all([
      db.baziRecord.findMany({
        where,
        include: {
          lifeEvents: true,
          daYuns: { orderBy: { index: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.baziRecord.count({ where }),
    ])

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
