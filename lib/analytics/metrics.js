import { BUCKETS } from './constants'

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

function avg(arr) {
  if (!arr.length) return 0
  return sum(arr) / arr.length
}

function median(arr) {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function computePercentile(arr, p) {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return Math.round(lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo))
}

export function computeKPIs(customers, percentile = 50, repeatThreshold = 2) {
  const total = customers.length
  const ltvs = customers.map(c => c.netVolume)
  const totalLTV = sum(ltvs)
  const avgLTV = avg(ltvs)
  const medianLTV = median(ltvs)
  const percentileLTV = computePercentile(ltvs, percentile)
  const repeatCount = customers.filter(c => c.paymentCount >= repeatThreshold).length
  const repeatRate = total > 0 ? (repeatCount / total) * 100 : 0

  return {
    totalCustomers: total,
    totalLTV,
    avgLTV,
    medianLTV,
    percentileLTV,
    repeatRate,
  }
}

export function computeBucketStats(customers, percentile = 50) {
  return BUCKETS.map(bucket => {
    const group = customers.filter(c => c.bucket === bucket)
    const ltvs = group.map(c => c.netVolume)
    const totalLTV = sum(ltvs)
    const avgLTV = avg(ltvs)
    const medianLTV = median(ltvs)
    const percentileLTV = computePercentile(ltvs, percentile)

    return {
      bucket,
      customers: group.length,
      totalLTV,
      avgLTV,
      medianLTV,
      percentileLTV,
    }
  })
}