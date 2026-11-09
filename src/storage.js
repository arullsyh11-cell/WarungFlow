export const STORAGE_KEY = 'warungflow.data.v1'
export const APP_VERSION = 1

export function localDateISO(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `wf-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createInitialData() {
  return {
    version: APP_VERSION,
    profile: { name: 'Saya' },
    shifts: [],
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialData()
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.shifts)) return createInitialData()
    return {
      version: APP_VERSION,
      profile: { name: String(parsed.profile?.name || 'Saya') },
      shifts: parsed.shifts.map((shift) => ({
        ...shift,
        transactions: Array.isArray(shift.transactions) ? shift.transactions : [],
      })),
    }
  } catch (error) {
    console.error('Gagal membaca data WarungFlow:', error)
    return createInitialData()
  }
}

export function persistData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: APP_VERSION }))
    return true
  } catch (error) {
    console.error('Gagal menyimpan data WarungFlow:', error)
    return false
  }
}

export function validateBackup(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      Array.isArray(value.shifts) &&
      value.shifts.every((shift) =>
        shift &&
        typeof shift.id === 'string' &&
        typeof shift.date === 'string' &&
        typeof shift.startAt === 'string' &&
        Array.isArray(shift.transactions) &&
        shift.transactions.every((tx) =>
          tx &&
          typeof tx.id === 'string' &&
          typeof tx.product === 'string' &&
          typeof tx.createdAt === 'string' &&
          Number.isFinite(Number(tx.quantity)) &&
          Number.isFinite(Number(tx.unitPrice)),
        ),
      ),
  )
}

export function money(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function number(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value) || 0)
}

export function formatDate(dateString, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!dateString) return '—'
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('id-ID', options).format(date)
}

export function formatTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function shiftTotals(shift) {
  const transactions = shift?.transactions || []
  return transactions.reduce(
    (total, tx) => ({
      revenue: total.revenue + Number(tx.quantity) * Number(tx.unitPrice),
      items: total.items + Number(tx.quantity),
      count: total.count + 1,
    }),
    { revenue: 0, items: 0, count: 0 },
  )
}

export function getTodayGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}
