import { Solar, Lunar } from 'lunar-typescript'

// 天干
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
// 地支
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
// 五行
export const WUXING = ['金', '木', '水', '火', '土']
// 十二时辰
export const SHICHEN = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时'
]
// 时辰对应的时间范围
export const SHICHEN_HOURS = [
  [23, 1],   // 子时 23:00-01:00
  [1, 3],    // 丑时
  [3, 5],    // 寅时
  [5, 7],    // 卯时
  [7, 9],    // 辰时
  [9, 11],   // 巳时
  [11, 13],  // 午时
  [13, 15],  // 未时
  [15, 17],  // 申时
  [17, 19],  // 酉时
  [19, 21],  // 戌时
  [21, 23],  // 亥时
]

// 天干五行
const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}

// 地支五行
const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

// 天干阴阳
const GAN_YINYANG: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
}

// 十神
function getShiShen(dayGan: string, targetGan: string): string {
  const dayElement = GAN_WUXING[dayGan]
  const targetElement = GAN_WUXING[targetGan]
  const dayYin = GAN_YINYANG[dayGan] === '阴'
  const targetYin = GAN_YINYANG[targetGan] === '阴'
  const sameYin = dayYin === targetYin

  if (dayElement === targetElement) {
    return sameYin ? '比肩' : '劫财'
  }
  // 生我
  const shengWo: Record<string, string> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' }
  if (shengWo[dayElement] === targetElement) {
    return sameYin ? '正印' : '偏印'
  }
  // 我生
  const woSheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  if (woSheng[dayElement] === targetElement) {
    return sameYin ? '食神' : '伤官'
  }
  // 克我
  const keWo: Record<string, string> = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' }
  if (keWo[dayElement] === targetElement) {
    return sameYin ? '正官' : '七杀'
  }
  // 我克
  const woKe: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' }
  if (woKe[dayElement] === targetElement) {
    return sameYin ? '正财' : '偏财'
  }
  return ''
}

export interface Pillar {
  gan: string
  zhi: string
  ganZhi: string
  ganWuxing: string
  zhiWuxing: string
  ganShiShen: string  // 天干十神 (相对日主)
  zhiShiShenZhi: string  // 地支主气十神
  zhiHideGan: string[]
  naYin: string
  xun: string       // 旬
  xunKong: string[]  // 旬空
  diShi: string     // 地势 (十二长生)
}

export interface DaYunInfo {
  index: number
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  gan: string
  zhi: string
  ganZhi: string
  liuNian: LiuNianInfo[]
}

export interface LiuNianInfo {
  year: number
  age: number
  gan: string
  zhi: string
  ganZhi: string
}

export interface ShenshaResult {
  name: string
  position: string  // 在哪柱: 年/月/日/时
  gan?: string
  zhi?: string
}

export interface BranchRelation {
  type: '六合' | '三合' | '相冲' | '相刑' | '相害' | '自刑'
  branches: string[]
  description: string
  pillars: string[]  // 涉及的柱
}

export interface BaziResult {
  // 基本信息
  birthDate: string
  birthTime: string
  gender: 'male' | 'female'
  birthHourZhi: string

  // 真太阳时
  birthplace?: string
  longitude?: number
  solarTimeAdjusted?: boolean
  adjustedTime?: string

  // 四柱
  yearPillar: Pillar
  monthPillar: Pillar
  dayPillar: Pillar
  hourPillar: Pillar

  // 日主
  dayMaster: string
  dayMasterWuxing: string

  // 大运
  forward: boolean
  startAge: number
  startYear: number
  daYun: DaYunInfo[]

  // 五行统计
  elementCounts: Record<string, number>

  // 节气信息
  jieQi: string
  lunarDate: string
  solarTerm: string

  // 胎元/命宫
  taiYuan: string
  mingGong: string
  shenGong: string

  // 神煞
  shensha: ShenshaResult[]

  // 地支关系
  branchRelations: BranchRelation[]
}

function buildPillar(
  eightChar: any,
  prefix: 'Year' | 'Month' | 'Day' | 'Time',
  dayGan: string
): Pillar {
  const gan = eightChar[`get${prefix}Gan`]()
  const zhi = eightChar[`get${prefix}Zhi`]()
  const ganZhi = eightChar[`get${prefix}`]()
  const hideGan = eightChar[`get${prefix}HideGan`]()

  return {
    gan,
    zhi,
    ganZhi,
    ganWuxing: GAN_WUXING[gan] || '',
    zhiWuxing: ZHI_WUXING[zhi] || '',
    ganShiShen: prefix === 'Day' ? '日主' : getShiShen(dayGan, gan),
    zhiShiShenZhi: '',
    zhiHideGan: Array.isArray(hideGan) ? hideGan : [],
    naYin: eightChar[`get${prefix}NaYin`](),
    xun: eightChar[`get${prefix}Xun`](),
    xunKong: (eightChar[`get${prefix}XunKong`]() || '').split('').reduce((acc: string[], _, i: number, arr: string[]) => {
      if (i % 2 === 1) { acc.push(arr[i - 1] + arr[i]) }
      return acc
    }, []),
    diShi: eightChar[`get${prefix}DiShi`](),
  }
}

function countElements(result: BaziResult): Record<string, number> {
  const counts: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar, result.hourPillar]
  for (const p of pillars) {
    counts[p.ganWuxing]++
    counts[p.zhiWuxing]++
  }
  return counts
}

/**
 * 排八字 - 公历输入
 * @param birthplace 出生地（城市名，用于真太阳时校正）
 * @param longitude 出生地经度（直接传入，优先于 birthplace）
 */
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female',
  birthplace?: string,
  longitude?: number
): BaziResult {
  let actualHour = hour
  let actualMinute = minute
  let solarTimeAdjusted = false
  let adjustedTime: string | undefined

  // 真太阳时校正
  const lng = longitude ?? (birthplace ? CITY_LONGITUDES[birthplace]?.longitude : undefined)
  if (lng !== undefined) {
    const adjusted = calculateTrueSolarTime(year, month, day, hour, minute, lng)
    if (adjusted.adjusted) {
      actualHour = adjusted.hour
      actualMinute = adjusted.minute
      solarTimeAdjusted = true
      adjustedTime = `${String(adjusted.hour).padStart(2, '0')}:${String(adjusted.minute).padStart(2, '0')}`
    }
  }

  const solar = Solar.fromYmdHms(year, month, day, actualHour, actualMinute, 0)
  const result = calculateFromSolar(solar, gender)
  result.birthplace = birthplace
  result.longitude = lng
  result.solarTimeAdjusted = solarTimeAdjusted
  result.adjustedTime = adjustedTime
  return result
}

/**
 * 排八字 - 农历输入
 * @param isLeap 是否闰月
 * @param birthplace 出生地（城市名，用于真太阳时校正）
 */
export function calculateBaziFromLunar(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  isLeap: boolean,
  gender: 'male' | 'female',
  birthplace?: string,
  longitude?: number
): BaziResult {
  const lunar = Lunar.fromYmdHms(year, isLeap ? -month : month, day, hour, minute, 0)
  const solar = lunar.getSolar()
  // 转换为公历后再做真太阳时校正
  const solarYear = solar.getYear()
  const solarMonth = solar.getMonth()
  const solarDay = solar.getDay()
  const solarHour = solar.getHour()
  const solarMinute = solar.getMinute()

  return calculateBazi(solarYear, solarMonth, solarDay, solarHour, solarMinute, gender, birthplace, longitude)
}

/**
 * 从 Solar 对象排八字
 */
function calculateFromSolar(solar: Solar, gender: 'male' | 'female'): BaziResult {
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  // 子时换日柱: sect=1 表示23:00后换下一日的日柱
  eightChar.setSect(1)

  const dayGan = eightChar.getDayGan()
  const year = solar.getYear()
  const hour = solar.getHour()
  const minute = solar.getMinute()

  const yearPillar = buildPillar(eightChar, 'Year', dayGan)
  const monthPillar = buildPillar(eightChar, 'Month', dayGan)
  const dayPillar = buildPillar(eightChar, 'Day', dayGan)
  const hourPillar = buildPillar(eightChar, 'Time', dayGan)

  // 计算时辰地支
  let birthHourIdx: number
  if (hour === 23 || hour < 1) {
    birthHourIdx = 0 // 子时
  } else {
    birthHourIdx = Math.floor((hour + 1) / 2)
  }

  // 大运
  const yun = eightChar.getYun(gender === 'male' ? 1 : 0)
  const daYunList = yun.getDaYun()

  const daYun: DaYunInfo[] = daYunList.map((dy: any, i: number) => {
    const liuNianList = dy.getLiuNian()
    const liuNian: LiuNianInfo[] = liuNianList.map((ln: any) => ({
      year: ln.getYear(),
      age: ln.getAge(),
      gan: ln.getGanZhi()[0],
      zhi: ln.getGanZhi()[1],
      ganZhi: ln.getGanZhi(),
    }))

    const ganZhi = dy.getGanZhi() || ''
    return {
      index: i,
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      startYear: dy.getStartYear(),
      endYear: dy.getEndYear(),
      gan: ganZhi[0] || '',
      zhi: ganZhi[1] || '',
      ganZhi: ganZhi || '童限',
      liuNian,
    }
  })

  const result: BaziResult = {
    birthDate: `${year}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`,
    birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    gender,
    birthHourZhi: DIZHI[birthHourIdx],

    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    dayMaster: dayGan,
    dayMasterWuxing: GAN_WUXING[dayGan] || '',

    forward: yun.isForward(),
    startAge: yun.getStartYear(),
    startYear: yun.getStartSolar().getYear(),
    daYun,

    elementCounts: { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 },

    jieQi: lunar.getJieQi() || '',
    lunarDate: lunar.toString(),
    solarTerm: lunar.getJieQi() || '',

    taiYuan: eightChar.getTaiYuan(),
    mingGong: eightChar.getMingGong(),
    shenGong: eightChar.getShenGong(),

    shensha: [],
    branchRelations: [],
  }

  result.elementCounts = countElements(result)
  result.shensha = calculateShensha(dayGan, yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi)
  result.branchRelations = calculateBranchRelations(yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi)
  return result
}

/**
 * 从时辰索引获取时间范围
 */
export function getHourRange(hourZhi: string): string {
  const idx = DIZHI.indexOf(hourZhi)
  if (idx === -1) return ''
  const [start, end] = SHICHEN_HOURS[idx]
  const startStr = String(start).padStart(2, '0')
  const endStr = String(end).padStart(2, '0')
  return `${startStr}:00-${endStr}:00`
}

/**
 * 获取时辰索引
 */
export function getBirthHourIndex(hour: number): number {
  if (hour === 23 || hour < 1) return 0
  return Math.floor((hour + 1) / 2)
}

/**
 * 获取时辰名称
 */
export function getShichenName(hour: number): string {
  return SHICHEN[getBirthHourIndex(hour)]
}

// ============ 手动录入：从四柱构建八字 ============

// 60甲子纳音表
const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

// 地支藏干
const ZHI_HIDE_GAN: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '辛', '癸'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲'],
}

// 十二长生
const DI_SHI_STAGES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养']

// 五行长生位（地支索引）— 阴阳同生同死，均顺行
const CHANG_SHENG_ZHI: Record<string, number> = {
  '木': 11, // 亥
  '火': 2,  // 寅
  '土': 2,  // 寅（同火）
  '金': 5,  // 巳
  '水': 8,  // 申
}

// 旬名
const XUN_NAMES = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅']

// 计算甲子序号 (0-59)
function getJiaZiIndex(gan: string, zhi: string): number {
  const ganIdx = TIANGAN.indexOf(gan)
  const zhiIdx = DIZHI.indexOf(zhi)
  return (ganIdx * 6 - zhiIdx * 5 + 60) % 60
}

// 计算旬空
function getXunKong(gan: string, zhi: string): { xun: string; xunKong: string[] } {
  const idx = getJiaZiIndex(gan, zhi)
  const xunIdx = Math.floor(idx / 10)
  const kongStart = (10 - xunIdx * 2 + 12) % 12
  return {
    xun: XUN_NAMES[xunIdx],
    xunKong: [DIZHI[kongStart], DIZHI[(kongStart + 1) % 12]],
  }
}

// 计算地势（十二长生）
function getDiShi(dayGan: string, zhi: string): string {
  const element = GAN_WUXING[dayGan]
  const changShengIdx = CHANG_SHENG_ZHI[element]
  const zhiIdx = DIZHI.indexOf(zhi)
  const stageIdx = (zhiIdx - changShengIdx + 12) % 12
  return DI_SHI_STAGES[stageIdx]
}

function buildPillarFromGanZhi(gan: string, zhi: string, dayGan: string, isDayMaster = false): Pillar {
  const { xun, xunKong } = getXunKong(gan, zhi)
  return {
    gan,
    zhi,
    ganZhi: gan + zhi,
    ganWuxing: GAN_WUXING[gan] || '',
    zhiWuxing: ZHI_WUXING[zhi] || '',
    ganShiShen: isDayMaster ? '日主' : getShiShen(dayGan, gan),
    zhiShiShenZhi: '',
    zhiHideGan: ZHI_HIDE_GAN[zhi] || [],
    naYin: NAYIN_TABLE[gan + zhi] || '',
    xun,
    xunKong,
    diShi: getDiShi(dayGan, zhi),
  }
}

/**
 * 从四柱天干地支直接构建八字（用于古人手动录入）
 * @param startAge 起运岁数（手动指定，默认1）
 * 大运方向：阳男阴女顺排，阴男阳女逆排（与传统规则一致）
 */
export function calculateBaziFromPillars(
  yearGan: string, yearZhi: string,
  monthGan: string, monthZhi: string,
  dayGan: string, dayZhi: string,
  hourGan: string, hourZhi: string,
  gender: 'male' | 'female',
  options: { name?: string; birthYear?: number; notes?: string; startAge?: number } = {}
): BaziResult {
  const yearPillar = buildPillarFromGanZhi(yearGan, yearZhi, dayGan)
  const monthPillar = buildPillarFromGanZhi(monthGan, monthZhi, dayGan)
  const dayPillar = buildPillarFromGanZhi(dayGan, dayZhi, dayGan, true)
  const hourPillar = buildPillarFromGanZhi(hourGan, hourZhi, dayGan)

  // 大运方向：阳男阴女顺排，阴男阳女逆排
  const yearGanYinYang = GAN_YINYANG[yearGan]
  const isYang = yearGanYinYang === '阳'
  const forward = (gender === 'male' && isYang) || (gender === 'female' && !isYang)

  const startAge = options.startAge ?? 1
  const birthYear = options.birthYear || 0

  // 从月柱推10步大运
  const monthJiaZiIdx = getJiaZiIndex(monthGan, monthZhi)
  const daYun: DaYunInfo[] = []
  for (let i = 0; i < 10; i++) {
    const idx = forward
      ? (monthJiaZiIdx + 1 + i) % 60
      : (monthJiaZiIdx - 1 - i + 600) % 60
    const gan = TIANGAN[idx % 10]
    const zhi = DIZHI[idx % 12]

    const dyStartAge = startAge + i * 10
    const dyEndAge = dyStartAge + 9
    const dyStartYear = birthYear ? birthYear + dyStartAge : 0
    const dyEndYear = birthYear ? dyStartYear + 9 : 0

    // 流年（每步大运10年）
    const liuNian: LiuNianInfo[] = []
    for (let j = 0; j < 10; j++) {
      const lnAge = dyStartAge + j
      const lnYear = birthYear ? birthYear + lnAge : 0
      const lnIdx = (lnYear > 0 ? getJiaZiIndexByYear(lnYear) : idx + j) % 60
      liuNian.push({
        year: lnYear,
        age: lnAge,
        gan: TIANGAN[lnIdx % 10],
        zhi: DIZHI[lnIdx % 12],
        ganZhi: TIANGAN[lnIdx % 10] + DIZHI[lnIdx % 12],
      })
    }

    daYun.push({
      index: i,
      startAge: dyStartAge,
      endAge: dyEndAge,
      startYear: dyStartYear,
      endYear: dyEndYear,
      gan,
      zhi,
      ganZhi: gan + zhi,
      liuNian,
    })
  }

  const result: BaziResult = {
    birthDate: options.birthYear ? `${options.birthYear}-00-00` : '未知',
    birthTime: '未知',
    gender,
    birthHourZhi: hourZhi,

    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    dayMaster: dayGan,
    dayMasterWuxing: GAN_WUXING[dayGan] || '',

    forward,
    startAge,
    startYear: birthYear,
    daYun,

    elementCounts: { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 },

    jieQi: '',
    lunarDate: options.notes || '手动录入',
    solarTerm: '',

    taiYuan: '',
    mingGong: '',
    shenGong: '',

    shensha: [],
    branchRelations: [],
  }

  result.elementCounts = countElements(result)
  result.shensha = calculateShensha(dayGan, yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi)
  result.branchRelations = calculateBranchRelations(yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi)
  return result
}

// 根据公历年份获取该年立春后的甲子序号 (0-59)
// 年干支的算法：(year - 4) % 60 即为该年的甲子序号
function getJiaZiIndexByYear(year: number): number {
  return ((year - 4) % 60 + 60) % 60
}

// ============ 真太阳时校正 ============

// 中国主要城市经度表（按省份/直辖市）
export const CITY_LONGITUDES: Record<string, { longitude: number; name: string }> = {
  // 直辖市
  '北京': { longitude: 116.41, name: '北京' },
  '上海': { longitude: 121.47, name: '上海' },
  '天津': { longitude: 117.20, name: '天津' },
  '重庆': { longitude: 106.55, name: '重庆' },
  // 华北
  '石家庄': { longitude: 114.51, name: '石家庄' },
  '太原': { longitude: 112.55, name: '太原' },
  '呼和浩特': { longitude: 111.75, name: '呼和浩特' },
  // 东北
  '沈阳': { longitude: 123.43, name: '沈阳' },
  '长春': { longitude: 125.32, name: '长春' },
  '哈尔滨': { longitude: 126.63, name: '哈尔滨' },
  // 华东
  '南京': { longitude: 118.78, name: '南京' },
  '杭州': { longitude: 120.16, name: '杭州' },
  '合肥': { longitude: 117.27, name: '合肥' },
  '福州': { longitude: 119.30, name: '福州' },
  '南昌': { longitude: 115.89, name: '南昌' },
  '济南': { longitude: 117.00, name: '济南' },
  // 华中
  '郑州': { longitude: 113.65, name: '郑州' },
  '武汉': { longitude: 114.31, name: '武汉' },
  '长沙': { longitude: 112.94, name: '长沙' },
  // 华南
  '广州': { longitude: 113.27, name: '广州' },
  '南宁': { longitude: 108.37, name: '南宁' },
  '海口': { longitude: 110.20, name: '海口' },
  '深圳': { longitude: 114.06, name: '深圳' },
  // 西南
  '成都': { longitude: 104.07, name: '成都' },
  '贵阳': { longitude: 106.63, name: '贵阳' },
  '昆明': { longitude: 102.83, name: '昆明' },
  '拉萨': { longitude: 91.11, name: '拉萨' },
  // 西北
  '西安': { longitude: 108.95, name: '西安' },
  '兰州': { longitude: 103.83, name: '兰州' },
  '西宁': { longitude: 101.78, name: '西宁' },
  '银川': { longitude: 106.23, name: '银川' },
  '乌鲁木齐': { longitude: 87.62, name: '乌鲁木齐' },
  // 港澳台
  '香港': { longitude: 114.17, name: '香港' },
  '澳门': { longitude: 113.55, name: '澳门' },
  '台北': { longitude: 121.55, name: '台北' },
}

// 中国夏令时实施年份 (1986-1991)
const DST_YEARS = [1986, 1987, 1988, 1989, 1990, 1991]

/**
 * 计算真太阳时
 * @param year 年
 * @param month 月
 * @param day 日
 * @param hour 时（北京时间）
 * @param minute 分
 * @param longitude 出生地经度
 * @returns 校正后的时分
 */
export function calculateTrueSolarTime(
  year: number, month: number, day: number,
  hour: number, minute: number, longitude: number
): { hour: number; minute: number; adjusted: boolean } {
  // 1. 夏令时回拨（1986-1991年中国实行夏令时，拨快1小时）
  let adjustedHour = hour
  let adjustedMinute = minute
  if (DST_YEARS.includes(year)) {
    // 夏令时期间（5月第二个周日至9月第三个周日，简化为5-9月）
    if (month >= 5 && month <= 9) {
      adjustedHour = hour - 1
      if (adjustedHour < 0) {
        adjustedHour = 23
        // 日期往前一天（简化处理，不影响排盘因为lunar-typescript会处理）
      }
    }
  }

  // 2. 经度校正：真太阳时 = 北京时间 + (经度 - 120) × 4分钟
  const standardMeridian = 120 // 北京时间对应的东八区中央经线
  const longitudeDiff = longitude - standardMeridian
  const longitudeCorrectionMinutes = longitudeDiff * 4 // 每度差4分钟

  // 3. 均时差（Equation of Time）
  // B = 2π * (N - 81) / 365, N = day of year
  const N = getDayOfYear(year, month, day)
  const B = 2 * Math.PI * (N - 81) / 365
  const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)

  // 总校正分钟数
  const totalCorrection = longitudeCorrectionMinutes + eotMinutes

  // 校正后的时间
  let totalMinutes = adjustedHour * 60 + adjustedMinute + totalCorrection
  // 归一化到 0-1439
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440

  return {
    hour: Math.floor(totalMinutes / 60),
    minute: Math.round(totalMinutes % 60),
    adjusted: Math.abs(totalCorrection) >= 1,
  }
}

function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day)
  const start = new Date(year, 0, 1)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
}


// ============ 神煞计算 ============

// 天乙贵人：以日干查地支
const TIANYI_GUIREN: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '辛': ['寅', '午'],
}

// 文昌：以日干查地支
const WENCHANG: Record<string, string> = {
  '甲': '巳', '乙': '午', '丙': '申', '戊': '申',
  '丁': '酉', '己': '酉', '庚': '亥', '辛': '子',
  '壬': '寅', '癸': '卯',
}

// 羊刃：以日干查地支
const YANGREN: Record<string, string> = {
  '甲': '卯', '乙': '寅', '丙': '午', '戊': '午',
  '丁': '巳', '己': '巳', '庚': '酉', '辛': '申',
  '壬': '子', '癸': '亥',
}

// 桃花/驿马/华盖：以年支（三合局）查
const SANHE_GROUPS: Record<string, string> = {
  '寅': '火', '午': '火', '戌': '火',
  '申': '水', '子': '水', '辰': '水',
  '巳': '金', '酉': '金', '丑': '金',
  '亥': '木', '卯': '木', '未': '木',
}

const TAOHUA: Record<string, string> = {
  '火': '卯', '水': '酉', '金': '午', '木': '子',
}

const YIMA: Record<string, string> = {
  '火': '申', '水': '寅', '金': '亥', '木': '巳',
}

const HUAGAI: Record<string, string> = {
  '火': '戌', '水': '辰', '金': '丑', '木': '未',
}

// 太极贵人：以日干查地支
const TAIJI_GUIREN: Record<string, string[]> = {
  '甲': ['子', '午'], '乙': ['子', '午'],
  '丙': ['卯', '酉'], '丁': ['卯', '酉'],
  '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
  '庚': ['寅', '亥'], '辛': ['寅', '亥'],
  '壬': ['巳', '申'], '癸': ['巳', '申'],
}

// 将星：以年支三合局查
const JIANGXING: Record<string, string> = {
  '火': '午', '水': '子', '金': '酉', '木': '卯',
}

function calculateShensha(
  dayGan: string,
  yearZhi: string, monthZhi: string, dayZhi: string, hourZhi: string
): ShenshaResult[] {
  const results: ShenshaResult[] = []
  const pillars: Array<{ label: string; zhi: string }> = [
    { label: '年', zhi: yearZhi },
    { label: '月', zhi: monthZhi },
    { label: '日', zhi: dayZhi },
    { label: '时', zhi: hourZhi },
  ]

  const allZhi = [yearZhi, monthZhi, dayZhi, hourZhi]
  const sanheGroup = SANHE_GROUPS[yearZhi] || ''

  // 天乙贵人（查日干，看四柱地支）
  const tianyi = TIANYI_GUIREN[dayGan] || []
  for (const p of pillars) {
    if (tianyi.includes(p.zhi)) {
      results.push({ name: '天乙贵人', position: p.label + '支', zhi: p.zhi })
    }
  }

  // 文昌（查日干）
  const wenchang = WENCHANG[dayGan]
  if (wenchang) {
    for (const p of pillars) {
      if (p.zhi === wenchang) {
        results.push({ name: '文昌', position: p.label + '支', zhi: p.zhi })
      }
    }
  }

  // 羊刃（查日干）
  const yangren = YANGREN[dayGan]
  if (yangren) {
    for (const p of pillars) {
      if (p.zhi === yangren) {
        results.push({ name: '羊刃', position: p.label + '支', zhi: p.zhi })
      }
    }
  }

  // 太极贵人（查日干）
  const taiji = TAIJI_GUIREN[dayGan] || []
  for (const p of pillars) {
    if (taiji.includes(p.zhi)) {
      results.push({ name: '太极贵人', position: p.label + '支', zhi: p.zhi })
    }
  }

  // 桃花（查年支三合局）
  const taohua = TAOHUA[sanheGroup]
  if (taohua) {
    for (const p of pillars) {
      if (p.zhi === taohua && p.label !== '年') {
        results.push({ name: '桃花', position: p.label + '支', zhi: p.zhi })
      }
    }
  }

  // 驿马（查年支三合局）
  const yima = YIMA[sanheGroup]
  if (yima) {
    for (const p of pillars) {
      if (p.zhi === yima && p.label !== '年') {
        results.push({ name: '驿马', position: p.label + '支', zhi: p.zhi })
      }
    }
  }

  // 华盖（查年支三合局）
  const huagai = HUAGAI[sanheGroup]
  if (huagai) {
    for (const p of pillars) {
      if (p.zhi === huagai) {
        results.push({ name: '华盖', position: p.label + '支', zhi: p.zhi })
      }
    }
  }

  // 将星（查年支三合局）
  const jiangxing = JIANGXING[sanheGroup]
  if (jiangxing) {
    for (const p of pillars) {
      if (p.zhi === jiangxing && p.label !== '年') {
        results.push({ name: '将星', position: p.label + '支', zhi: p.zhi })
      }
    }
  }

  return results
}


// ============ 地支关系计算 ============

// 六合
const LIUHE: Record<string, string> = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳', '午': '未', '未': '午',
}

// 三合局
const SANHE_JU: Array<{ branches: string[]; element: string }> = [
  { branches: ['申', '子', '辰'], element: '水' },
  { branches: ['寅', '午', '戌'], element: '火' },
  { branches: ['巳', '酉', '丑'], element: '金' },
  { branches: ['亥', '卯', '未'], element: '木' },
]

// 相冲
const CHONG: Record<string, string> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑',
  '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
}

// 相刑
const XING: Array<{ pair: [string, string]; name: string }> = [
  { pair: ['寅', '巳'], name: '无恩之刑' },
  { pair: ['巳', '申'], name: '无恩之刑' },
  { pair: ['寅', '申'], name: '无恩之刑' },
  { pair: ['丑', '戌'], name: '恃势之刑' },
  { pair: ['戌', '未'], name: '恃势之刑' },
  { pair: ['丑', '未'], name: '恃势之刑' },
  { pair: ['子', '卯'], name: '无礼之刑' },
]

// 自刑
const ZIXING = ['辰', '午', '酉', '亥']

// 相害
const HAI: Record<string, string> = {
  '子': '未', '未': '子', '丑': '午', '午': '丑',
  '寅': '巳', '巳': '寅', '卯': '辰', '辰': '卯',
  '申': '亥', '亥': '申', '酉': '戌', '戌': '酉',
}

function calculateBranchRelations(
  yearZhi: string, monthZhi: string, dayZhi: string, hourZhi: string
): BranchRelation[] {
  const results: BranchRelation[] = []
  const pillars: Array<{ label: string; zhi: string }> = [
    { label: '年', zhi: yearZhi },
    { label: '月', zhi: monthZhi },
    { label: '日', zhi: dayZhi },
    { label: '时', zhi: hourZhi },
  ]

  // 检查所有两两组合
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const a = pillars[i]
      const b = pillars[j]

      // 六合
      if (LIUHE[a.zhi] === b.zhi) {
        results.push({
          type: '六合',
          branches: [a.zhi, b.zhi],
          description: `${a.label}${a.zhi}与${b.label}${b.zhi}六合`,
          pillars: [a.label, b.label],
        })
      }

      // 相冲
      if (CHONG[a.zhi] === b.zhi) {
        results.push({
          type: '相冲',
          branches: [a.zhi, b.zhi],
          description: `${a.label}${a.zhi}与${b.label}${b.zhi}相冲`,
          pillars: [a.label, b.label],
        })
      }

      // 相刑
      for (const xing of XING) {
        if ((xing.pair[0] === a.zhi && xing.pair[1] === b.zhi) ||
            (xing.pair[0] === b.zhi && xing.pair[1] === a.zhi)) {
          results.push({
            type: '相刑',
            branches: [a.zhi, b.zhi],
            description: `${a.label}${a.zhi}与${b.label}${b.zhi}相刑（${xing.name}）`,
            pillars: [a.label, b.label],
          })
          break
        }
      }

      // 相害
      if (HAI[a.zhi] === b.zhi) {
        results.push({
          type: '相害',
          branches: [a.zhi, b.zhi],
          description: `${a.label}${a.zhi}与${b.label}${b.zhi}相害`,
          pillars: [a.label, b.label],
        })
      }
    }
  }

  // 三合：检查四柱中是否凑齐三合局中的三个
  const zhiList = pillars.map(p => ({ ...p, zhiSet: p.zhi }))
  for (const ju of SANHE_JU) {
    const matched = pillars.filter(p => ju.branches.includes(p.zhi))
    if (matched.length >= 2) {
      // 至少两支同属一个三合局
      const isFull = matched.length >= 3
      results.push({
        type: '三合',
        branches: matched.map(m => m.zhi),
        description: isFull
          ? `${matched.map(m => m.label + m.zhi).join('、')}三合${ju.element}局`
          : `${matched.map(m => m.label + m.zhi).join('、')}半三合${ju.element}局`,
        pillars: matched.map(m => m.label),
      })
    }
  }

  // 自刑：同一地支出现多次
  for (const zhi of ZIXING) {
    const matched = pillars.filter(p => p.zhi === zhi)
    if (matched.length >= 2) {
      results.push({
        type: '自刑',
        branches: [zhi],
        description: `${matched.map(m => m.label + m.zhi).join('、')}自刑`,
        pillars: matched.map(m => m.label),
      })
    }
  }

  return results
}


// ============ 导出辅助函数 ============

export { GAN_WUXING, ZHI_WUXING, GAN_YINYANG, getShiShen }
