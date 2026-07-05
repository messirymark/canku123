# TOOLS.md - Local Notes

## 八字排盘项目 (canku123)

### GitHub
- 仓库: messirymark/canku123
- Token: 用户自己的 PAT（不要硬编码在代码里，GitHub Push Protection 会拦截）
- 数据存储: GitHub 仓库 data.json (通过 GitHub API 读写)

### Vercel
- 项目: canku123
- 域名: canku123.vercel.app
- 环境变量: GITHUB_TOKEN (需手动在 Vercel 面板设置)

### 关键经验

**Vercel 不支持 SQLite 本地文件**
- SQLite 在 Vercel serverless 函数中无法写入
- 解决方案: 改用 GitHub 仓库的 JSON 文件作为数据库 (github-db.ts)
- GitHub API 有请求频率限制，但个人使用够用

**GitHub Push Protection**
- 明文 token 不能推送到仓库
- base64 编码也可能被检测
- 最安全方式: 环境变量注入

**Prisma driverAdapters**
- 需要 `previewFeatures = ["driverAdapters"]`
- `@prisma/adapter-libsql` 的导入名是 `PrismaLibSql`（注意大小写）

**移动端滚动优化**
- `scroll-snap-type` 会导致滑动卡顿，慎用
- `overscroll-behavior-y: none` 会阻止子元素弹性滚动
- `-webkit-overflow-scrolling: touch` 全局添加可改善 iOS 滚动

**八字计算 (lunar-typescript)**
- `setSect(1)` = 子时换日柱（23:00后换下一日柱）
- 节气换月令是默认行为，无需额外配置
- `EightChar.getYun(1)` 参数: 1=男, 0=女
- 农历输入: `Lunar.fromYmdHms(year, isLeap ? -month : month, day, ...)` → `.getSolar()` 转 Solar，再排八字
- 需同时 import `{ Solar, Lunar }` from 'lunar-typescript'

**Vercel 部署**
- push 后 1-2 分钟自动部署完成
- push 被拒绝时先 `git pull origin main --no-rebase` 再 push
