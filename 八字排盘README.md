# 八字排盘 · 命理人生

精准八字排盘应用，支持 iOS、安卓、网页三端发布（PWA）。

## 核心特性

- **以节气换月令**：严格按照二十四节气划分月柱，非农历月初
- **以子时换日柱**：23:00 后自动换下一日柱（晚子时归明日）
- **完整大运流年**：10 步大运 + 每步 10 年流年，一滑到底
- **人生大事备注**：在任意年份添加人生事件，按年展示完整人生履历
- **相似八字查询**：排盘后自动入库，可查询相同/相似八字的人生大事
- **管理员系统**：管理员可查看/编辑/删除/备注所有入库八字
- **PWA 三端发布**：安装到 iOS/安卓桌面，全屏体验

## 技术栈

- Next.js 16 + TypeScript + Turbopack
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM + SQLite
- lunar-typescript（精准八字计算库）
- PWA（manifest.json + apple-web-app）

## 本地开发

```bash
bun install
bun run db:push     # 初始化数据库
bun run dev         # 启动开发服务器 → http://localhost:3000
```

## 生产构建

```bash
bun run build
bun run start
```

## 功能模块

### 1. 排盘（首页）
- 输入出生日期、时辰、性别
- 自动计算四柱八字（年月日时）
- 显示：天干/地支/五行/十神/纳音/地支藏干/地势
- 显示：日主、起运年龄、大运方向、五行分布
- 显示：胎元、命宫、身宫
- 排盘结果自动入库

### 2. 大运流年时间线
- 完整 10 步大运（含童限）
- 每步大运下展开 10 年流年
- 滚动进度条
- "今年"按钮快速定位当前年份
- 当前年份高亮显示
- 每年可添加人生大事

### 3. 相似八字查询
- 手动输入四柱干支
- 三种匹配模式：精确匹配、部分匹配（按匹配度排序）、日主匹配
- 查看匹配记录的人生大事

### 4. 管理面板
- 管理员初始化/登录
- 查看所有八字记录（分页）
- 编辑/删除/查看详情
- 修改人生大事
- 设置记录公开/隐藏

## API 路由

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/bazi/calculate | 排八字 + 自动入库 |
| GET | /api/bazi/search | 搜索相似八字 |
| GET | /api/bazi/list | 管理员查看列表 |
| GET/PUT/DELETE | /api/bazi/[id] | 单条 CRUD |
| POST/GET | /api/bazi/[id]/events | 人生大事管理 |
| PUT/DELETE | /api/bazi/[id]/events/[eventId] | 事件编辑/删除 |
| POST/GET | /api/admin/init | 管理员初始化/登录 |

## 数据库 Schema

- `BaziRecord`：八字记录（四柱、大运方向、五行、来源、公开/隐藏）
- `DaYun`：预存大运数据
- `LifeEvent`：人生大事（年份、分类、大运/流年对应）
- `AdminUser`：管理员账户

## PWA 安装

### iOS
1. 用 Safari 打开网页
2. 点击分享按钮 → 添加到主屏幕

### 安卓
1. 用 Chrome 打开网页
2. 点击菜单 → 添加到主屏幕

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局（PWA meta 配置）
│   ├── page.tsx            # 首页（三 Tab 切换）
│   ├── globals.css         # 全局样式（移动端优化）
│   └── api/
│       ├── bazi/
│       │   ├── calculate/route.ts    # 排盘 API
│       │   ├── search/route.ts       # 查询 API
│       │   ├── list/route.ts         # 管理列表 API
│       │   └── [id]/
│       │       ├── route.ts          # 单条 CRUD
│       │       └── events/
│       │           ├── route.ts      # 事件管理
│       │           └── [eventId]/route.ts
│       └── admin/init/route.ts       # 管理员 API
├── components/
│   └── bazi/
│       ├── BaziCalculator.tsx  # 排盘表单
│       ├── BaziChart.tsx       # 四柱展示
│       ├── Timeline.tsx        # 大运流年时间线
│       ├── BaziSearch.tsx      # 相似八字查询
│       └── AdminPanel.tsx      # 管理面板
└── lib/
    ├── db.ts                   # Prisma 客户端
    └── bazi/
        └── engine.ts           # 八字计算引擎
prisma/
└── schema.prisma               # 数据库 Schema
public/
├── manifest.json               # PWA 清单
├── icon-192.png                # PWA 图标
└── icon-512.png                # PWA 图标
```
