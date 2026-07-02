import { NextRequest, NextResponse } from 'next/server'
import { createAdminUser, verifyAdminUser, hasAdminUser, isGithubConfigured } from '@/lib/github-db'

// 初始化管理员账户
export async function POST(request: NextRequest) {
  try {
    if (!isGithubConfigured()) {
      return NextResponse.json({ error: '数据库未配置，请设置 GITHUB_TOKEN 环境变量' }, { status: 503 })
    }

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: '缺少用户名或密码' }, { status: 400 })
    }

    // 检查是否已有管理员
    const exists = await hasAdminUser()
    if (exists) {
      return NextResponse.json({ error: '管理员账户已存在' }, { status: 400 })
    }

    const admin = await createAdminUser(username, password)

    return NextResponse.json({
      success: true,
      token: 'bazi-admin-2026',
      admin: { id: admin.id, username: admin.username },
    })
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
    if (!isGithubConfigured()) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const password = searchParams.get('password')

    if (!username || !password) {
      return NextResponse.json({ error: '缺少用户名或密码' }, { status: 400 })
    }

    const admin = await verifyAdminUser(username, password)
    if (!admin) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
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
