'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, LogIn, LogOut, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  marriage: '婚姻', career: '事业', health: '健康', wealth: '财运',
  education: '学业', family: '家庭', travel: '出行', other: '其他',
}

export function AdminPanel() {
  const [token, setToken] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [needsInit, setNeedsInit] = useState(false)

  // Check if admin exists - 用 GET 请求检查，不要用 POST（会误创建管理员）
  const checkAdminStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/init?username=__check__&password=__check__')
      const data = await res.json()
      if (data.error?.includes('密码错误') || data.error?.includes('用户名或密码')) {
        // 有管理员了（只是密码不对）
        setNeedsInit(false)
      } else if (data.success) {
        setNeedsInit(false)
      } else {
        // 没有管理员或数据库未配置
        setNeedsInit(true)
      }
    } catch {
      setNeedsInit(true)
    }
  }, [])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  // Init admin
  const [initUsername, setInitUsername] = useState('')
  const [initPassword, setInitPassword] = useState('')
  const handleInitAdmin = async () => {
    if (!initUsername || !initPassword) {
      toast.error('请填写用户名和密码')
      return
    }
    try {
      const res = await fetch('/api/admin/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: initUsername, password: initPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('管理员创建成功，请登录')
      setNeedsInit(false)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Login
  const handleLogin = async () => {
    if (!initUsername || !initPassword) {
      toast.error('请填写用户名和密码')
      return
    }
    try {
      const res = await fetch(`/api/admin/init?username=${encodeURIComponent(initUsername)}&password=${encodeURIComponent(initPassword)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newToken = data.token
      setToken(newToken)
      setLoggedIn(true)
      toast.success('登录成功')
      // Fetch records with the new token directly
      const params = new URLSearchParams({
        page: '1',
        pageSize: '20',
        adminToken: newToken,
      })
      try {
        const listRes = await fetch(`/api/bazi/list?${params.toString()}`)
        const listData = await listRes.json()
        if (listRes.ok) {
          setRecords(listData.records || [])
          setTotal(listData.total)
          setTotalPages(listData.totalPages)
          setPage(1)
        }
      } catch {}
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Fetch records
  const fetchRecords = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: '20',
        adminToken: token,
      })
      if (search) params.set('search', search)
      const res = await fetch(`/api/bazi/list?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRecords(data.records || [])
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(pageNum)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [token, search])

  // Delete record
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此八字记录？相关的人生大事也会被删除。')) return
    try {
      const res = await fetch(`/api/bazi/${id}?adminToken=${token}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('删除成功')
      fetchRecords(page)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Save edit
  const handleSaveEdit = async (updated: any) => {
    try {
      const res = await fetch(`/api/bazi/${editingRecord.id}?adminToken=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, adminToken: token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('更新成功')
      setEditDialogOpen(false)
      fetchRecords(page)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // View detail
  const handleViewDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/bazi/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDetailRecord(data.record)
      setDetailOpen(true)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Not logged in
  if (!loggedIn) {
    return (
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardHeader>
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">
            {needsInit ? '初始化管理员' : '管理员登录'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-w-sm">
          {needsInit && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-800 dark:text-blue-300">
              首次使用，请创建管理员账户。创建后可以管理数据库中所有八字记录。
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">用户名</Label>
            <Input
              value={initUsername}
              onChange={(e) => setInitUsername(e.target.value)}
              placeholder="管理员用户名"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">密码</Label>
            <Input
              type="password"
              value={initPassword}
              onChange={(e) => setInitPassword(e.target.value)}
              placeholder="密码"
              className="h-9"
            />
          </div>
          <Button
            onClick={needsInit ? handleInitAdmin : handleLogin}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <LogIn className="h-4 w-4" />
            {needsInit ? '创建管理员' : '登录'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Logged in
  return (
    <div className="space-y-4">
      {/* Admin Header */}
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-600 text-white">管理员</Badge>
              <span className="text-xs text-muted-foreground">
                共 {total} 条记录
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名/日柱/日期..."
                className="h-8 w-40 sm:w-60 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && fetchRecords(1)}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => fetchRecords(1)}
              >
                搜索
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  setLoggedIn(false)
                  setToken('')
                  setRecords([])
                }}
              >
                <LogOut className="h-3 w-3" />
                退出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="border-amber-200/60 dark:border-zinc-700/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无八字记录
            </div>
          ) : (
            <div className="divide-y divide-amber-200/30 dark:divide-zinc-700/30">
              {records.map((r: any) => (
                <div key={r.id} className="p-3 flex items-center justify-between hover:bg-amber-50/30 dark:hover:bg-zinc-800/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {r.name && (
                        <span className="text-sm font-medium truncate">{r.name}</span>
                      )}
                      <span className="text-sm font-mono flex-shrink-0">
                        {r.yearGan}{r.yearZhi} {r.monthGan}{r.monthZhi} {r.dayGan}{r.dayZhi} {r.hourGan}{r.hourZhi}
                      </span>
                      {r.source === 'admin' && (
                        <Badge variant="outline" className="text-xs">管理员</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{r.birthDate} {r.birthTime}</span>
                      <span>{r.gender === 'male' ? '男' : '女'}</span>
                      <span>日主: {r.dayMaster}</span>
                      <span>大事: {r._count?.lifeEvents || 0}条</span>
                      {r.isAdminEdited && (
                        <Badge variant="outline" className="text-xs">已编辑</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleViewDetail(r.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingRecord(r); setEditDialogOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-amber-200/30 dark:border-zinc-700/30">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => fetchRecords(page - 1)}
                className="h-8"
              >
                <ChevronLeft className="h-3 w-3" />
                上一页
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => fetchRecords(page + 1)}
                className="h-8"
              >
                下一页
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditRecordDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        record={editingRecord}
        onSave={handleSaveEdit}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-100">
              八字详情 {detailRecord?.name ? `· ${detailRecord.name}` : ''}
            </DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <div className="overflow-y-auto flex-1 pr-4 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: '年柱', gan: detailRecord.yearGan, zhi: detailRecord.yearZhi },
                  { label: '月柱', gan: detailRecord.monthGan, zhi: detailRecord.monthZhi },
                  { label: '日柱', gan: detailRecord.dayGan, zhi: detailRecord.dayZhi },
                  { label: '时柱', gan: detailRecord.hourGan, zhi: detailRecord.hourZhi },
                ].map(p => (
                  <div key={p.label} className="p-2 rounded bg-amber-50/30 dark:bg-zinc-800/30">
                    <div className="text-xs text-muted-foreground">{p.label}</div>
                    <div className="font-bold text-lg text-amber-900 dark:text-amber-100">{p.gan}{p.zhi}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs space-y-1">
                <div>出生: {detailRecord.birthDate} {detailRecord.birthTime}</div>
                <div>性别: {detailRecord.gender === 'male' ? '男' : '女'} | 日主: {detailRecord.dayMaster} | 起运: {detailRecord.startAge}岁</div>
              </div>

              {/* DaYun */}
              {detailRecord.daYuns && detailRecord.daYuns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">大运</h4>
                  <div className="flex flex-wrap gap-1">
                    {detailRecord.daYuns.map((dy: any) => (
                      <div key={dy.id} className="text-xs px-2 py-1 rounded border border-amber-200/40 dark:border-zinc-700/40">
                        {dy.gan}{dy.zhi} ({dy.startAge}-{dy.endAge}岁)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Events */}
              {detailRecord.lifeEvents && detailRecord.lifeEvents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">人生大事 ({detailRecord.lifeEvents.length}条)</h4>
                  <div className="space-y-2">
                    {detailRecord.lifeEvents
                      .sort((a: any, b: any) => a.year - b.year)
                      .map((evt: any) => (
                      <div key={evt.id} className="p-2 rounded border border-amber-200/40 dark:border-zinc-700/40 bg-white/50 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>{evt.year}年 ({evt.age}岁)</span>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[evt.category] || evt.category}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium">{evt.event}</div>
                        {evt.notes && <div className="text-xs text-muted-foreground mt-1">{evt.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditRecordDialog({
  open,
  onOpenChange,
  record,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: any
  onSave: (data: any) => void
}) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (record) {
      setName(record.name || '')
      setGender(record.gender || 'male')
      setIsPublic(record.isPublic ?? true)
    }
  }, [record])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ name, gender, isPublic })
    setSaving(false)
  }

  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑八字记录</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">姓名</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">性别</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={gender === 'male' ? 'default' : 'outline'}
                onClick={() => setGender('male')}
                className={gender === 'male' ? 'bg-amber-600 text-white' : ''}
              >
                男
              </Button>
              <Button
                size="sm"
                variant={gender === 'female' ? 'default' : 'outline'}
                onClick={() => setGender('female')}
                className={gender === 'female' ? 'bg-amber-600 text-white' : ''}
              >
                女
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">公开状态</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isPublic ? 'default' : 'outline'}
                onClick={() => setIsPublic(true)}
                className={isPublic ? 'bg-amber-600 text-white' : ''}
              >
                公开
              </Button>
              <Button
                size="sm"
                variant={!isPublic ? 'default' : 'outline'}
                onClick={() => setIsPublic(false)}
                className={!isPublic ? 'bg-amber-600 text-white' : ''}
              >
                隐藏
              </Button>
            </div>
          </div>
          <div className="p-2 rounded bg-amber-50/30 dark:bg-zinc-800/30 text-xs text-muted-foreground">
            <div>出生: {record.birthDate} {record.birthTime}</div>
            <div>四柱: {record.yearGan}{record.yearZhi} {record.monthGan}{record.monthZhi} {record.dayGan}{record.dayZhi} {record.hourGan}{record.hourZhi}</div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
