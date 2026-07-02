import { createClient } from '@libsql/client'

// Turso 数据库配置
// 免费云端 SQLite，数据持久化
const TURSO_URL = 'libsql://bazi-app-messirymark.turso.io'
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

let dbClient: ReturnType<typeof createClient> | null = null

function getDb() {
  if (!dbClient) {
    dbClient = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN,
    })
  }
  return dbClient
}

export { getDb }
