import { BUCKETS } from './constants'

function sum(arr) { return arr.reduce((a, b) => a + b, 0) }
function avg(arr) { return arr.length ? sum(arr) / arr.length : 0 }

function computePercentile(arr, p) {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return Math.round(lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo))
}

// Duck-typed accessors — work for both old (netVolume/paymentCount) and
// new joined (net/bookingCount) record shapes so both dashboards share one file.
const getLTV = c => c.net ?? c.netVolume ?? 0
const getCount = c => c.bookingCount ?? c.paymentCount ?? 0

// Client's exact formula:
// MAX(0, ROUND(paymentCount - (refundedVolume + disputeLosses) / avgPkg))
// Small refunds round away naturally — no hard threshold needed.
export function computeAdjustedBookingCount(paymentCount, refundedVolume, disputeLosses, minPkg, avgPkg) {
  const reversed = refundedVolume + disputeLosses
  return Math.max(0, Math.round(paymentCount - (reversed / avgPkg)))
}

export function computeKPIs(customers, percentile = 50, repeatThreshold = 2) {
  const total = customers.length
  const ltvs = customers.map(getLTV)
  const totalLTV = sum(ltvs)
  const avgLTV = avg(ltvs)
  const percentileLTV = computePercentile(ltvs, percentile)
  const medianLTV = computePercentile(ltvs, 50)

  // Repeat rate: only customers with adjusted bookings > 0 (null-bucket excluded)
  const bucketable = customers.filter(c => c.bucket != null)
  const repeatCount = bucketable.filter(c => getCount(c) >= repeatThreshold).length
  const repeatRate = bucketable.length > 0 ? (repeatCount / bucketable.length) * 100 : 0

  // Health metrics: ALL customers including null-bucket
  const gross = sum(customers.map(c => c.gross ?? 0))
  const refunded = sum(customers.map(c => c.refunded ?? 0))
  const disputeLosses = sum(customers.map(c => c.disputeLosses ?? 0))
  const refundRate = gross > 0 ? ((refunded + disputeLosses) / gross) * 100 : 0

  return {
    totalCustomers: total,
    totalLTV,
    avgLTV,
    medianLTV,
    percentileLTV,
    repeatRate,
    gross,
    refunded,
    disputeLosses,
    net: totalLTV,
    refundRate,
  }
}

export function computeBucketStats(customers, percentile = 50) {
  // Customers with null bucket (adjusted count = 0) are excluded from
  // frequency distribution but their revenue still flows into health totals
  // via the HealthTable which uses the full customers array directly.
  const bucketable = customers.filter(c => c.bucket != null)

  return BUCKETS.map(bucket => {
    const group = bucketable.filter(c => c.bucket === bucket)
    const ltvs = group.map(getLTV)
    const totalLTV = sum(ltvs)
    const avgLTV = avg(ltvs)
    const percentileLTV = computePercentile(ltvs, percentile)
    const medianLTV = computePercentile(ltvs, 50)

    const gross = sum(group.map(c => c.gross ?? 0))
    const refunded = sum(group.map(c => c.refunded ?? 0))
    const disputeLosses = sum(group.map(c => c.disputeLosses ?? 0))
    const net = totalLTV
    const refundRate = gross > 0 ? ((refunded + disputeLosses) / gross) * 100 : 0
    const subscriberCount = group.filter(c => c.isSubscriber).length
    const nonSubscriberCount = group.length - subscriberCount

    return {
      bucket,
      customers: group.length,
      totalLTV,
      avgLTV,
      medianLTV,
      percentileLTV,
      subscriberCount,
      nonSubscriberCount,
      gross,
      refunded,
      disputeLosses,
      net,
      refundRate,
    }
  })
}
