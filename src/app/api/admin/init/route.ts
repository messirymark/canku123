import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 初始化管理员账户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: '缺少用户名或密码' }, { status: 400 })
    }

    // 检查是否已有管理员
    const existing = await db.adminUser.findFirst()
    if (existing) {
      return NextResponse.json({ error: '管理员账户已存在' }, { status: 400 })
    }

    // 简单哈希 (生产环境应使用 bcrypt)
    const passwordHash = Buffer.from(password).toString('base64')

    const admin = await db.adminUser.create({
      data: {
        username,
        passwordHash,
      },
    })

    return NextResponse.json({ success: true, adminId: admin.id })
  } catch (error) {
    return NextResponse.json(
      { error: '初始化失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// 管理员登录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const password = searchParams.get('password')

    if (!username || !password) {
      return NextResponse.json({ error: '缺少用户名或密码' }, { status: 400 })
    }

    const admin = await db.adminUser.findUnique({ where: { username } })
    if (!admin) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const passwordHash = Buffer.from(password).toString('base64')
    if (admin.passwordHash !== passwordHash) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      token: 'bazi-admin-2026',
      admin: { id: admin.id, username: admin.username },
    })
  } catch (error) {
    return NextResponse.json(
      { error: '登录失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
