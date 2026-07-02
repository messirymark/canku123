import { NextRequest, NextResponse } from 'next/server'
import { createLifeEvent, getLifeEvents, isGithubConfigured } from '@/lib/github-db'

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

    if (!isGithubConfigured()) {
      // 没有配置 GitHub token，返回成功但不保存
      return NextResponse.json({ 
        lifeEvent: { id: 'temp', baziId: id, year: parseInt(year), event, category: category || 'other' } 
      })
    }

    const record = await getBaziRecord(id)
    if (!record) {
      return NextResponse.json({ error: '八字记录不存在' }, { status: 404 })
    }

    const lifeEvent = await createLifeEvent({
      baziId: id,
      year: parseInt(year),
      age: parseInt(age) || parseInt(year) - parseInt(record.birthDate.split('-')[0]),
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
    })

    return NextResponse.json({ lifeEvent })
  } catch (error) {
    return NextResponse.json(
      { error: '添加事件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

import { getBaziRecord } from '@/lib/github-db'

// 获取某八字的所有事件
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isGithubConfigured()) {
      return NextResponse.json({ events: [] })
    }
    const events = await getLifeEvents(id)
    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json(
      { error: '获取事件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
