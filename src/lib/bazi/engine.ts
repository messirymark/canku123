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

export interface BaziResult {
  // 基本信息
  birthDate: string
  birthTime: string
  gender: 'male' | 'female'
  birthHourZhi: string

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
 */
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female'
): BaziResult {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
  return calculateFromSolar(solar, gender)
}

/**
 * 排八字 - 农历输入
 * @param isLeap 是否闰月
 */
export function calculateBaziFromLunar(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  isLeap: boolean,
  gender: 'male' | 'female'
): BaziResult {
  const lunar = Lunar.fromYmdHms(year, isLeap ? -month : month, day, hour, minute, 0)
  const solar = lunar.getSolar()
  return calculateFromSolar(solar, gender)
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
  }

  result.elementCounts = countElements(result)
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

export { GAN_WUXING, ZHI_WUXING, GAN_YINYANG, getShiShen }
