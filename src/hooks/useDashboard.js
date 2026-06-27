'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { filterByDateRange } from '@/lib/analytics/filter'
import { computeKPIs, computeBucketStats, computeTipStats, computeReturnIntervals } from '@/lib/analytics/metrics'
import { computeBookingOutcomes } from '@/lib/analytics/bookingOutcomes'

export function useDashboard() {
  const {
    canada,
    us,
    isLoadingFromSupabase,
    supabaseError,
    setSupabaseError,
    isSavingToSupabase,
    savingCountry,
  } = useDashboardStore()

  const [country, setCountry] = useState('canada')
  const [dateRange, setDateRange] = useState(0)
  const [customerType, setCustomerType] = useState('all') // 'all' | 'sub' | 'non'

  // Slider display values (instant)
  const [rawPercentile, setRawPercentile] = useState(50)
  const [rawRepeatThreshold, setRawRepeatThreshold] = useState(2)

  // Debounced values (drive computations)
  const [percentile, setPercentile] = useState(50)
  const [repeatThreshold, setRepeatThreshold] = useState(2)
  const [isComputing, setIsComputing] = useState(false)

  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    setIsComputing(true)
    const timer = setTimeout(() => {
      setPercentile(rawPercentile)
      setRepeatThreshold(rawRepeatThreshold)
      setIsComputing(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [rawPercentile, rawRepeatThreshold])

  const store = country === 'canada' ? canada : us
  const payments = store.payments.data
  // Date-range filtered customers (all types)
  const filteredCustomers = useMemo(() =>
    filterByDateRange(store.joined, payments, dateRange),
    [store.joined, payments, dateRange]
  )

  const filteredSubs = useMemo(() =>
    filteredCustomers.filter(c => c.isSubscriber),
    [filteredCustomers]
  )

  const filteredNonSubs = useMemo(() =>
    filteredCustomers.filter(c => !c.isSubscriber),
    [filteredCustomers]
  )

  // Active view (follows customerType toggle)
  const viewCustomers = useMemo(() => {
    if (customerType === 'sub') return filteredSubs
    if (customerType === 'non') return filteredNonSubs
    return filteredCustomers
  }, [filteredCustomers, filteredSubs, filteredNonSubs, customerType])

  // All-time customers (not date-filtered) — segment toggle still applies
  const allTimeCustomers = useMemo(() => {
    const all = store.joined
    if (customerType === 'sub') return all.filter(c => c.isSubscriber)
    if (customerType === 'non') return all.filter(c => !c.isSubscriber)
    return all
  }, [store.joined, customerType])

  // KPIs and outcomes follow the active view
  const kpis = useMemo(() =>
    computeKPIs(viewCustomers, percentile, repeatThreshold),
    [viewCustomers, percentile, repeatThreshold]
  )

  // Repeat rate always uses all-time data regardless of date filter
  const allTimeRepeatRate = useMemo(() => {
    if (!allTimeCustomers.length) return 0
    const repeaters = allTimeCustomers.filter(
      c => (c.bookingCount ?? 0) >= repeatThreshold
    ).length
    return Math.round((repeaters / allTimeCustomers.length) * 100 * 10) / 10
  }, [allTimeCustomers, repeatThreshold])

  const kpisWithAllTimeRepeat = useMemo(() => ({
    ...kpis,
    repeatRate: allTimeRepeatRate,
  }), [kpis, allTimeRepeatRate])

  const bucketStats = useMemo(() =>
    computeBucketStats(viewCustomers, percentile),
    [viewCustomers, percentile]
  )

  const bookingOutcomes = useMemo(() =>
    computeBookingOutcomes(viewCustomers),
    [viewCustomers]
  )

  // NEW: Tip calculation based on customerType toggle and date range
  const tipCustomers = useMemo(() => {
    if (customerType === 'sub')
      return filteredCustomers.filter(c => c.isSubscriber)
    if (customerType === 'non')
      return filteredCustomers.filter(c => !c.isSubscriber)
    return filteredCustomers
  }, [filteredCustomers, customerType])

  const tipStats = useMemo(
    () => computeTipStats(tipCustomers),
    [tipCustomers]
  )

  // Reconstruct allGaps from per-customer bookingGaps arrays — pure Method B.
  // Works after both fresh upload (bookingGaps computed in join.js) and
  // page refresh (bookingGaps loaded from Supabase booking_gaps jsonb column).
  const allGaps = useMemo(() => {
    const gaps = []
    for (const c of allTimeCustomers) {
      if (Array.isArray(c.bookingGaps) && c.bookingGaps.length > 0) {
        gaps.push(...c.bookingGaps)
      }
    }
    return gaps
  }, [allTimeCustomers])

  // Return intervals — allTimeCustomers for repeaters/distribution,
  // allGaps (Logic B) for avg/median/fastest/slowest
  const returnIntervals = useMemo(
    () => computeReturnIntervals(allTimeCustomers, allGaps),
    [allTimeCustomers, allGaps]
  )

  // All-three bucket stat sets for AvgPercentileChart and BucketTable tabs
  const allBucketStats = useMemo(() =>
    computeBucketStats(filteredCustomers, percentile),
    [filteredCustomers, percentile]
  )

  const subBucketStats = useMemo(() =>
    computeBucketStats(filteredSubs, percentile),
    [filteredSubs, percentile]
  )

  const nonBucketStats = useMemo(() =>
    computeBucketStats(filteredNonSubs, percentile),
    [filteredNonSubs, percentile]
  )

  console.log('=== RETURN INTERVALS DEBUG ===')
  console.log('store.joined length:', store?.joined?.length)
  console.log('allGaps length:', allGaps?.length)
  console.log('allTimeCustomers length:', allTimeCustomers?.length)
  console.log('repeaters count:', allTimeCustomers?.filter(c => (c.bookingCount ?? 0) >= 2).length)
  console.log('customers with avgGapDays > 0:', allTimeCustomers?.filter(c => (c.avgGapDays ?? 0) > 0).length)
  console.log('returnIntervals:', JSON.stringify(returnIntervals))

  return {
    // country
    country,
    setCountry,
    // readiness
    isReady: store.isReady,
    canadaReady: canada.isReady,
    usReady: us.isReady,
    // supabase state
    isLoadingFromSupabase,
    supabaseError,
    setSupabaseError,
    isSavingToSupabase,
    savingCountry,
    // metadata for the current country
    uploadedAt: store.uploadedAt,
    paymentsCount: store.paymentsCount ?? 0,
    subscriberCount: store.subscriberIds?.length ?? 0,
    dateRange,
    setDateRange,
    customerType,
    setCustomerType,
    rawPercentile,
    setRawPercentile,
    rawRepeatThreshold,
    setRawRepeatThreshold,
    percentile,
    repeatThreshold,
    isComputing,
    // computed data
    filteredCustomers,
    viewCustomers,
    kpis: kpisWithAllTimeRepeat,
    bucketStats,
    bookingOutcomes,
    allBucketStats,
    subBucketStats,
    nonBucketStats,
    // NEW: Computed Tip Stats
    tipStats,
    // NEW: Return interval stats (all-time, not date-filtered)
    returnIntervals,
  }
}