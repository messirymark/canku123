import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 添加人生大事
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { year, age, month, day, event, category, notes, daYunIndex, daYunGan, daYunZhi, liuNianGan, liuNianZhi } = body

    if (!year || !event) {
      return NextResponse.json({ error: '缺少必要参数: year, event' }, { status: 400 })
    }

    // 验证八字记录存在
    const bazi = await db.baziRecord.findUnique({ where: { id } })
    if (!bazi) {
      return NextResponse.json({ error: '八字记录不存在' }, { status: 404 })
    }

    const lifeEvent = await db.lifeEvent.create({
      data: {
        baziId: id,
        year: parseInt(year),
        age: parseInt(age) || parseInt(year) - parseInt(bazi.birthDate.split('-')[0]),
        month: month || null,
        day: day || null,
        event,
        category: category || 'other',
        notes: notes || null,
        daYunIndex: daYunIndex !== undefined ? parseInt(daYunIndex) : null,
        daYunGan: daYunGan || null,
        daYunZhi: daYunZhi || null,
        liuNianGan: liuNianGan || null,
        liuNianZhi: liuNianZhi || null,
      },
    })

    return NextResponse.json({ lifeEvent })
  } catch (error) {
    return NextResponse.json(
      { error: '添加事件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// 获取某八字的所有事件
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const events = await db.lifeEvent.findMany({
      where: { baziId: id },
      orderBy: { year: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json(
      { error: '获取事件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
