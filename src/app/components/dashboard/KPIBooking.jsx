import { getFilterLabel } from './DateRangeFilter'

function fmt(n) { return '$' + Math.round(n).toLocaleString() }
function fmtK(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'm'
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k'
  return fmt(n)
}

function Card({ label, value, sub }) {
  return (
    <div className="bg-gray-50 dark:bg-[#2D2D2F] rounded-lg p-3">
      <div className="text-xs text-gray-400 dark:text-[#6B6B70] mb-1 tracking-wide">{label}</div>
      <div className="text-2xl font-medium text-gray-900 dark:text-[#F2F2F7]">{value}</div>
      <div className="text-xs text-gray-500 dark:text-[#8E8E93] mt-0.5">{sub}</div>
    </div>
  )
}

export default function KPIBooking({ kpis, dateRange, percentile, repeatThreshold }) {
  const rangeLabel  = getFilterLabel(dateRange)
  const repeatLabel = repeatThreshold === 1 ? '1+ booking' : `${repeatThreshold}+ bookings`

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      <Card
        label="Total customers"
        value={kpis.totalCustomers.toLocaleString()}
        sub={rangeLabel}
      />
      <Card
        label="Total LTV"
        value={fmtK(kpis.totalLTV)}
        sub="Sum of net revenue"
      />
      <Card
        label="Avg LTV / customer"
        value={fmt(kpis.avgLTV)}
        sub="Mean across segments"
      />
      <Card
        label={`P${percentile} LTV`}
        value={fmt(kpis.percentileLTV)}
        sub={`${percentile}th percentile`}
      />
      <Card
        label="Repeat rate"
        value={kpis.repeatRate.toFixed(1) + '%'}
        sub={`Made ${repeatLabel}`}
      />
    </div>
  )
}
