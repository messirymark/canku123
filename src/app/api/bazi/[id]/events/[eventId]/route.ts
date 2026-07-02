import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 更新人生大事
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params
    const body = await request.json()
    const { event, category, notes, year, age, month, day, daYunIndex, daYunGan, daYunZhi, liuNianGan, liuNianZhi } = body

    const updateData: any = {}
    if (event !== undefined) updateData.event = event
    if (category !== undefined) updateData.category = category
    if (notes !== undefined) updateData.notes = notes
    if (year !== undefined) updateData.year = parseInt(year)
    if (age !== undefined) updateData.age = parseInt(age)
    if (month !== undefined) updateData.month = month
    if (day !== undefined) updateData.day = day
    if (daYunIndex !== undefined) updateData.daYunIndex = parseInt(daYunIndex)
    if (daYunGan !== undefined) updateData.daYunGan = daYunGan
    if (daYunZhi !== undefined) updateData.daYunZhi = daYunZhi
    if (liuNianGan !== undefined) updateData.liuNianGan = liuNianGan
    if (liuNianZhi !== undefined) updateData.liuNianZhi = liuNianZhi

    const lifeEvent = await db.lifeEvent.update({
      where: { id: eventId },
      data: updateData,
    })

    return NextResponse.json({ lifeEvent })
  } catch (error) {
    return NextResponse.json(
      { error: '更新事件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// 删除人生大事
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params
    await db.lifeEvent.delete({ where: { id: eventId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '删除事件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
