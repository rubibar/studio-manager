import { WORK_START, WORK_END } from './constants'

/** Sun(0) through Thu(4) */
export function isWorkingDay(d: Date): boolean {
  const dow = d.getDay()
  return dow >= 0 && dow <= 4
}

/** Working day + 10:00-18:00 */
export function isWorkingHour(d: Date): boolean {
  return isWorkingDay(d) && d.getHours() >= WORK_START && d.getHours() < WORK_END
}

/** Thu 18:00 to Sun 10:00 */
export function isWeekendFrozen(d: Date): boolean {
  const dow = d.getDay()
  if (dow === 5 || dow === 6) return true
  if (dow === 4 && d.getHours() >= WORK_END) return true
  if (dow === 0 && d.getHours() < WORK_START) return true
  return false
}

/** Sun 10:00-13:00 — R&D holy time */
export function isSundayRDHolyTime(d: Date): boolean {
  return d.getDay() === 0 && d.getHours() >= 10 && d.getHours() < 13
}

/** Count working hours between two dates (capped at 2000) */
export function countWorkingHoursBetween(from: Date, to: Date): number {
  if (!from || !to || to <= from) return 0
  let hours = 0
  const cursor = new Date(from)
  cursor.setMinutes(0, 0, 0)
  if (cursor < from) cursor.setHours(cursor.getHours() + 1)
  while (cursor < to && hours < 2000) {
    if (isWorkingDay(cursor) && cursor.getHours() >= WORK_START && cursor.getHours() < WORK_END) {
      hours++
    }
    cursor.setHours(cursor.getHours() + 1)
  }
  return hours
}
