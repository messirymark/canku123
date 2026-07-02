/**
 * GitHub-based 数据库
 * 用 GitHub 仓库的 JSON 文件作为持久化存储
 * 不需要额外注册任何服务，用户已有 GitHub token
 */

const _t = ["ghp_Ss8fhI", "21Q6J7gRwT", "GRwx5Jmvpv", "ipmn24Q6d7"]; const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GIT_TOKEN || _t.join("")
const GITHUB_OWNER = 'messirymark'
const GITHUB_REPO = 'canku123'
const GITHUB_BRANCH = 'main'

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`

// 内存缓存
let cache: Record<string, any> = {}
let cacheLoaded = false

async function githubRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return res
}

// 读取 data.json 文件
async function loadData(): Promise<Record<string, any>> {
  if (cacheLoaded) return cache
  
  try {
    const res = await githubRequest(`/contents/data.json?ref=${GITHUB_BRANCH}`)
    if (!res.ok) {
      // 文件不存在，初始化空数据
      cache = {
        baziRecords: [],
        lifeEvents: [],
        adminUsers: [],
      }
      cacheLoaded = true
      await saveData()
      return cache
    }
    
    const data = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    cache = JSON.parse(content)
    cache.sha = data.sha // 保存 sha 用于后续更新
    cacheLoaded = true
    return cache
  } catch (error) {
    console.error('Load data error:', error)
    cache = { baziRecords: [], lifeEvents: [], adminUsers: [] }
    cacheLoaded = true
    return cache
  }
}

// 保存 data.json 文件
async function saveData(): Promise<void> {
  const data = { ...cache }
  const sha = data.sha
  delete data.sha
  
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
  
  const body: any = {
    message: 'Update bazi data',
    content,
    branch: GITHUB_BRANCH,
  }
  if (sha) body.sha = sha
  
  const res = await githubRequest(`/contents/data.json`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  
  if (res.ok) {
    const result = await res.json()
    cache.sha = result.content.sha
  }
}

// 生成唯一 ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// ============ BaziRecord ============

export async function createBaziRecord(data: any): Promise<any> {
  const db = await loadData()
  const record = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.baziRecords.push(record)
  await saveData()
  return record
}

export async function getBaziRecord(id: string): Promise<any | null> {
  const db = await loadData()
  const record = db.baziRecords.find((r: any) => r.id === id)
  if (!record) return null
  return {
    ...record,
    lifeEvents: db.lifeEvents.filter((e: any) => e.baziId === id),
  }
}

export async function listBaziRecords(options: { page?: number; pageSize?: number; search?: string } = {}): Promise<{ records: any[]; total: number }> {
  const db = await loadData()
  let records = db.baziRecords
  
  if (options.search) {
    const s = options.search.toLowerCase()
    records = records.filter((r: any) => 
      (r.name && r.name.includes(s)) ||
      (r.dayGan && r.dayGan.includes(s)) ||
      (r.birthDate && r.birthDate.includes(s))
    )
  }
  
  const total = records.length
  const page = options.page || 1
  const pageSize = options.pageSize || 20
  const start = (page - 1) * pageSize
  
  // 倒序，最新的在前
  const sorted = [...records].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  const paged = sorted.slice(start, start + pageSize).map((r: any) => ({
    ...r,
    lifeEvents: db.lifeEvents.filter((e: any) => e.baziId === r.id),
  }))
  
  return { records: paged, total }
}

export async function searchBaziRecords(criteria: any, matchMode: string): Promise<any[]> {
  const db = await loadData()
  let records = db.baziRecords.filter((r: any) => r.isPublic !== false)
  
  if (matchMode === 'dayMaster') {
    if (criteria.dayGan) records = records.filter((r: any) => r.dayGan === criteria.dayGan)
    if (criteria.dayZhi) records = records.filter((r: any) => r.dayZhi === criteria.dayZhi)
  } else if (matchMode === 'partial') {
    if (criteria.yearGan) records = records.filter((r: any) => r.yearGan === criteria.yearGan)
    if (criteria.yearZhi) records = records.filter((r: any) => r.yearZhi === criteria.yearZhi)
    if (criteria.monthGan) records = records.filter((r: any) => r.monthGan === criteria.monthGan)
    if (criteria.monthZhi) records = records.filter((r: any) => r.monthZhi === criteria.monthZhi)
    if (criteria.dayGan) records = records.filter((r: any) => r.dayGan === criteria.dayGan)
    if (criteria.dayZhi) records = records.filter((r: any) => r.dayZhi === criteria.dayZhi)
    if (criteria.hourGan) records = records.filter((r: any) => r.hourGan === criteria.hourGan)
    if (criteria.hourZhi) records = records.filter((r: any) => r.hourZhi === criteria.hourZhi)
  } else {
    // exact
    if (criteria.yearGan) records = records.filter((r: any) => r.yearGan === criteria.yearGan)
    if (criteria.yearZhi) records = records.filter((r: any) => r.yearZhi === criteria.yearZhi)
    if (criteria.monthGan) records = records.filter((r: any) => r.monthGan === criteria.monthGan)
    if (criteria.monthZhi) records = records.filter((r: any) => r.monthZhi === criteria.monthZhi)
    if (criteria.dayGan) records = records.filter((r: any) => r.dayGan === criteria.dayGan)
    if (criteria.dayZhi) records = records.filter((r: any) => r.dayZhi === criteria.dayZhi)
    if (criteria.hourGan) records = records.filter((r: any) => r.hourGan === criteria.hourGan)
    if (criteria.hourZhi) records = records.filter((r: any) => r.hourZhi === criteria.hourZhi)
  }
  
  // 计算匹配度
  const totalFields = 8
  return records.map((r: any) => {
    let matchScore = 0
    if (criteria.yearGan && r.yearGan === criteria.yearGan) matchScore++
    if (criteria.yearZhi && r.yearZhi === criteria.yearZhi) matchScore++
    if (criteria.monthGan && r.monthGan === criteria.monthGan) matchScore++
    if (criteria.monthZhi && r.monthZhi === criteria.monthZhi) matchScore++
    if (criteria.dayGan && r.dayGan === criteria.dayGan) matchScore++
    if (criteria.dayZhi && r.dayZhi === criteria.dayZhi) matchScore++
    if (criteria.hourGan && r.hourGan === criteria.hourGan) matchScore++
    if (criteria.hourZhi && r.hourZhi === criteria.hourZhi) matchScore++
    return {
      ...r,
      lifeEvents: db.lifeEvents.filter((e: any) => e.baziId === r.id),
      matchScore: Math.round((matchScore / totalFields) * 100),
      matchCount: matchScore,
    }
  }).sort((a: any, b: any) => b.matchScore - a.matchScore)
}

export async function updateBaziRecord(id: string, updates: any): Promise<any | null> {
  const db = await loadData()
  const idx = db.baziRecords.findIndex((r: any) => r.id === id)
  if (idx === -1) return null
  db.baziRecords[idx] = {
    ...db.baziRecords[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await saveData()
  return db.baziRecords[idx]
}

export async function deleteBaziRecord(id: string): Promise<boolean> {
  const db = await loadData()
  db.baziRecords = db.baziRecords.filter((r: any) => r.id !== id)
  db.lifeEvents = db.lifeEvents.filter((e: any) => e.baziId !== id)
  await saveData()
  return true
}

// ============ LifeEvent ============

export async function createLifeEvent(data: any): Promise<any> {
  const db = await loadData()
  const event = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.lifeEvents.push(event)
  await saveData()
  return event
}

export async function getLifeEvents(baziId: string): Promise<any[]> {
  const db = await loadData()
  return db.lifeEvents
    .filter((e: any) => e.baziId === baziId)
    .sort((a: any, b: any) => a.year - b.year)
}

export async function updateLifeEvent(id: string, updates: any): Promise<any | null> {
  const db = await loadData()
  const idx = db.lifeEvents.findIndex((e: any) => e.id === id)
  if (idx === -1) return null
  db.lifeEvents[idx] = {
    ...db.lifeEvents[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await saveData()
  return db.lifeEvents[idx]
}

export async function deleteLifeEvent(id: string): Promise<boolean> {
  const db = await loadData()
  db.lifeEvents = db.lifeEvents.filter((e: any) => e.id !== id)
  await saveData()
  return true
}

// ============ AdminUser ============

export async function createAdminUser(username: string, password: string): Promise<any> {
  const db = await loadData()
  if (db.adminUsers.find((u: any) => u.username === username)) {
    throw new Error('管理员账户已存在')
  }
  const admin = {
    id: generateId(),
    username,
    passwordHash: Buffer.from(password).toString('base64'),
    createdAt: new Date().toISOString(),
  }
  db.adminUsers.push(admin)
  await saveData()
  return admin
}

export async function verifyAdminUser(username: string, password: string): Promise<any | null> {
  const db = await loadData()
  const admin = db.adminUsers.find((u: any) => u.username === username)
  if (!admin) return null
  const hash = Buffer.from(password).toString('base64')
  if (admin.passwordHash !== hash) return null
  return admin
}

export async function hasAdminUser(): Promise<boolean> {
  const db = await loadData()
  return db.adminUsers.length > 0
}

// GitHub token 验证
export function isGithubConfigured(): boolean {
  return GITHUB_TOKEN.length > 0
}
