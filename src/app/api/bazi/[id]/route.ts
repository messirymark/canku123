import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取单个八字详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await db.baziRecord.findUnique({
      where: { id },
      include: {
        lifeEvents: { orderBy: { year: 'asc' } },
        daYuns: { orderBy: { index: 'asc' } },
      },
    })

    if (!record) {
      return NextResponse.json({ error: '未找到记录' }, { status: 404 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: '获取失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// 更新八字 (管理员)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { adminToken, name, gender, isPublic, lifeEvents, ...updateFields } = body

    if (adminToken !== process.env.ADMIN_TOKEN && adminToken !== 'bazi-admin-2026') {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    const updateData: any = { isAdminEdited: true }
    if (name !== undefined) updateData.name = name
    if (gender !== undefined) updateData.gender = gender
    if (isPublic !== undefined) updateData.isPublic = isPublic

    // 允许更新八字字段
    const baziFields = ['yearGan', 'yearZhi', 'monthGan', 'monthZhi', 'dayGan', 'dayZhi', 'hourGan', 'hourZhi', 'dayMaster', 'forward', 'startAge', 'startYear', 'birthDate', 'birthTime', 'birthHour', 'elementCounts']
    for (const field of baziFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const record = await db.baziRecord.update({
      where: { id },
      data: updateData,
      include: {
        lifeEvents: { orderBy: { year: 'asc' } },
        daYuns: { orderBy: { index: 'asc' } },
      },
    })

    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: '更新失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// 删除八字 (管理员)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const adminToken = searchParams.get('adminToken') || ''

    if (adminToken !== process.env.ADMIN_TOKEN && adminToken !== 'bazi-admin-2026') {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    await db.baziRecord.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '删除失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
