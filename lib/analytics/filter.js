// ── Old API (kept for backward compat) ────────────────────────────────────────

export function getLatestDate(customers) {
  return customers.reduce((latest, c) =>
    c.lastPayment > latest ? c.lastPayment : latest
  , new Date(0))
}

export function filterCustomers(customers, dateRange) {
  if (dateRange === 0) return customers
  const latest = getLatestDate(customers)
  const cutoff = new Date(latest)
  cutoff.setDate(cutoff.getDate() - dateRange)
  return customers.filter(c => c.lastPayment >= cutoff)
}

// ── New API ───────────────────────────────────────────────────────────────────

export function getLatestPaymentDate(payments) {
  return payments.reduce((latest, p) =>
    p.createdAt > latest ? p.createdAt : latest
  , new Date(0))
}

// ── Date helpers (all local time) ─────────────────────────────────────────────

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getQuarterStart(date) {
  const month = date.getMonth()
  const quarterMonth = Math.floor(month / 3) * 3
  return new Date(date.getFullYear(), quarterMonth, 1)
}

function getLastQuarter(date) {
  const month = date.getMonth()
  const quarterMonth = Math.floor(month / 3) * 3
  const startMonth = quarterMonth - 3
  const year = startMonth < 0 ? date.getFullYear() - 1 : date.getFullYear()
  const adjustedStart = ((startMonth % 12) + 12) % 12
  const start = new Date(year, adjustedStart, 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(year, adjustedStart + 3, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function parseLocalDate(str) {
  if (!str) return null
  if (str instanceof Date) return new Date(str)
  const [year, month, day] = String(str).split('-').map(Number)
  return new Date(year, month - 1, day)
}

// ── Main filter ───────────────────────────────────────────────────────────────

export function filterByDateRange(joinedCustomers, payments, dateRange) {
  // ── Mode 1: number-based (unchanged) ─────────────────────────────────────
  if (typeof dateRange === 'number') {
    if (dateRange === 0) return joinedCustomers
    const latest = getLatestPaymentDate(payments)
    const cutoff = new Date(latest)
    cutoff.setDate(cutoff.getDate() - dateRange)
    return joinedCustomers.filter(c => c.lastPayment >= cutoff)
  }

  // ── Mode 2: object-based ──────────────────────────────────────────────────
  if (typeof dateRange === 'object' && dateRange !== null) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    let start, end

    switch (dateRange.type) {

      case 'today':
        start = todayStart
        end = today
        break

      case 'weekToDate':
        start = getMonday(now)
        end = today
        break

      case 'monthToDate':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        end = today
        break

      case 'quarterToDate':
        start = getQuarterStart(now)
        start.setHours(0, 0, 0, 0)
        end = today
        break

      case 'yearToDate':
        start = new Date(now.getFullYear(), 0, 1)
        start.setHours(0, 0, 0, 0)
        end = today
        break

      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0)
        end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
        break

      case 'lastWeek': {
        const monday = getMonday(now)
        end = new Date(monday)
        end.setDate(end.getDate() - 1)
        end.setHours(23, 59, 59, 999)
        start = new Date(monday)
        start.setDate(start.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        break
      }

      case 'lastMonth': {
        const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(firstThisMonth)
        end.setDate(end.getDate() - 1)
        end.setHours(23, 59, 59, 999)
        start = new Date(end.getFullYear(), end.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        break
      }

      case 'lastQuarter': {
        const lq = getLastQuarter(now)
        start = lq.start
        end   = lq.end
        break
      }

      case 'lastYear':
        start = new Date(now.getFullYear() - 1, 0, 1)
        start.setHours(0, 0, 0, 0)
        end = new Date(now.getFullYear() - 1, 11, 31)
        end.setHours(23, 59, 59, 999)
        break

      case 'lastN': {
        const { n, unit } = dateRange
        end = today
        start = new Date(now)
        if (unit === 'days')   start.setDate(start.getDate() - n)
        if (unit === 'weeks')  start.setDate(start.getDate() - n * 7)
        if (unit === 'months') start.setMonth(start.getMonth() - n)
        start.setHours(0, 0, 0, 0)
        break
      }

      case 'since':
        start = parseLocalDate(dateRange.date)
        start.setHours(0, 0, 0, 0)
        end = today
        break

      case 'pre20':
        start = new Date(0)
        end   = new Date(2026, 4, 31, 23, 59, 59, 999)
        break

      case 'post20':
        start = new Date(2026, 5, 1, 0, 0, 0, 0)
        end   = today
        break

      case 'year':
        start = new Date(dateRange.year, 0, 1, 0, 0, 0, 0)
        end   = new Date(dateRange.year, 11, 31, 23, 59, 59, 999)
        break

      case 'custom':
        start = parseLocalDate(dateRange.start)
        start.setHours(0, 0, 0, 0)
        end = parseLocalDate(dateRange.end)
        end.setHours(23, 59, 59, 999)
        break

      default:
        return joinedCustomers
    }

    return joinedCustomers.filter(c => {
      const d = c.lastPayment instanceof Date ? c.lastPayment : new Date(c.lastPayment)
      return d >= start && d <= end
    })
  }

  return joinedCustomers
}

// ── Label helper ──────────────────────────────────────────────────────────────

export function getFilterLabel(dateRange) {
  if (typeof dateRange === 'number') {
    if (dateRange === 0) return 'All time'
    if (dateRange === 365) return 'Last 12 months'
    return 'Last ' + dateRange + ' days'
  }
  if (!dateRange?.type) return 'All time'
  const labels = {
    today:         'Today',
    weekToDate:    'Week to date',
    monthToDate:   'Month to date',
    quarterToDate: 'Quarter to date',
    yearToDate:    'Year to date',
    yesterday:     'Yesterday',
    lastWeek:      'Last week',
    lastMonth:     'Last month',
    lastQuarter:   'Last quarter',
    lastYear:      'Last year',
    pre20:         'Pre-2.0 launch',
    post20:        'Post-2.0 launch',
  }
  if (labels[dateRange.type]) return labels[dateRange.type]
  if (dateRange.type === 'lastN') return `Last ${dateRange.n} ${dateRange.unit}`
  if (dateRange.type === 'since') return `Since ${dateRange.date}`
  if (dateRange.type === 'year') return String(dateRange.year)
  if (dateRange.type === 'custom') {
    const fmt = d => {
      const dt = d instanceof Date ? d : parseLocalDate(String(d))
      if (!dt) return ''
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`
  }
  return 'Custom'
}

// ── Available years helper ────────────────────────────────────────────────────

export function getAvailableYears(payments) {
  const years = new Set()
  payments.forEach(p => {
    const d = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)
    if (!isNaN(d.getTime())) years.add(d.getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
}
