import { format, formatDistanceToNow, isValid } from 'date-fns'
import { he } from 'date-fns/locale'

export function formatDate(date: Date | string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '—'
  return format(d, pattern, { locale: he })
}

export function formatDateHebrew(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'dd בMMMM yyyy', { locale: he })
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: he })
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 דק\''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} דק'`
  if (m === 0) return `${h} שע'`
  return `${h} שע' ${m} דק'`
}

export function formatCurrency(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency }).format(amount)
}

export function formatHours(hours: number): string {
  if (!hours || hours <= 0) return '0'
  return hours.toFixed(1).replace(/\.0$/, '')
}

export function serializeDate(d: Date | string | null | undefined): string | null {
  if (!d) return null
  if (d instanceof Date) return d.toISOString()
  return d
}

export function deserializeDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}
