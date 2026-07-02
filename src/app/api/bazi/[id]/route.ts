import { NextRequest, NextResponse } from 'next/server'
import { getBaziRecord, updateBaziRecord, deleteBaziRecord, isGithubConfigured } from '@/lib/github-db'

// 获取单个八字详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isGithubConfigured()) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
    }
    const record = await getBaziRecord(id)
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
    const { adminToken, ...updateFields } = body

    if (adminToken !== process.env.ADMIN_TOKEN && adminToken !== 'bazi-admin-2026') {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    const record = await updateBaziRecord(id, updateFields)
    if (!record) {
      return NextResponse.json({ error: '未找到记录' }, { status: 404 })
    }
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

    await deleteBaziRecord(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '删除失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
