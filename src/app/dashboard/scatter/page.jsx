'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useDashboard } from '@/hooks/useDashboard'
import SidePanel from '@/components/dashboard/SidePanel'

const Plot = dynamic(
  () => import('react-plotly.js'),
  { ssr: false }
)

const BUCKET_INDEX = {
  '1 booking':   1,
  '2 bookings':  2,
  '3 bookings':  3,
  '4 bookings':  4,
  '5+ bookings': 5,
}

function stableIndex(id) {
  let h = 0
  const s = String(id)
  for (let i = 0; i < s.length; i++)
    h = Math.abs(((h << 5) - h) + s.charCodeAt(i)) | 0
  return h
}

function jitter(seed, offset) {
  const x = Math.sin(seed + offset) * 10000
  const frac = x - Math.floor(x)
  return (frac - 0.5) * 0.28
}

function xPos(c) {
  const bi = BUCKET_INDEX[c.bucket]
  const seed = stableIndex(c.id || '')
  return bi + jitter(seed, bi * 1000) * 0.35
}

export default function ScatterPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const {
    country, setCountry,
    customerType, setCustomerType,
    dateRange, setDateRange,
    percentile, rawPercentile,
    setRawPercentile,
    repeatThreshold, rawRepeatThreshold,
    setRawRepeatThreshold,
    filteredCustomers,
    isReady,
    isLoadingFromSupabase,
  } = useDashboard()

  const validCustomers = useMemo(() =>
    filteredCustomers.filter(
      c => c.bucket != null &&
           BUCKET_INDEX[c.bucket] !== undefined &&
           (c.net ?? 0) > 0
    ),
    [filteredCustomers]
  )

  const { subTrace, nonSubTrace } = useMemo(() => {
    const subscribers    = validCustomers.filter(c => c.isSubscriber)
    const nonSubscribers = validCustomers.filter(c => !c.isSubscriber)

    const sub = {
      type: 'scatter',
      mode: 'markers',
      name: 'Subscriber',
      x: subscribers.map(c => xPos(c)),
      y: subscribers.map(c => c.net ?? 0),
      text: subscribers.map(c =>
        `${c.name || 'Unidentified'}<br>` +
        `LTV: $${(c.net ?? 0).toLocaleString()}<br>` +
        `Bookings: ${c.bookingCount ?? '—'}<br>` +
        `Segment: Subscriber`
      ),
      hoverinfo: 'text',
      marker: {
        symbol: 'circle',
        size: 6,
        color: 'rgba(24,95,165,0.5)',
        line: { color: 'rgba(24,95,165,0.8)', width: 0.5 },
      },
    }

    const nonSub = {
      type: 'scatter',
      mode: 'markers',
      name: 'Non-subscriber',
      x: nonSubscribers.map(c => xPos(c)),
      y: nonSubscribers.map(c => c.net ?? 0),
      text: nonSubscribers.map(c =>
        `${c.name || 'Unidentified'}<br>` +
        `LTV: $${(c.net ?? 0).toLocaleString()}<br>` +
        `Bookings: ${c.bookingCount ?? '—'}<br>` +
        `Segment: Non-subscriber`
      ),
      hoverinfo: 'text',
      marker: {
        symbol: 'triangle-up',
        size: 6,
        color: 'rgba(99,153,34,0.5)',
        line: { color: 'rgba(99,153,34,0.8)', width: 0.5 },
      },
    }

    return { subTrace: sub, nonSubTrace: nonSub }
  }, [validCustomers])

  const traces = useMemo(() => {
    if (customerType === 'sub')  return [subTrace]
    if (customerType === 'non')  return [nonSubTrace]
    return [subTrace, nonSubTrace]
  }, [subTrace, nonSubTrace, customerType])

  const layout = useMemo(() => ({
    paper_bgcolor: 'transparent',
    plot_bgcolor:  'transparent',
    margin: { t: 20, r: 20, b: 60, l: 70 },
    font: {
      color: isDark ? '#AEAEB2' : '#6b7280',
    },
    xaxis: {
      title: 'Booking bucket',
      tickmode: 'array',
      tickvals: [1, 2, 3, 4, 5],
      ticktext: ['1 booking', '2 bookings', '3 bookings', '4 bookings', '5+ bookings'],
      range: [0.4, 5.6],
      gridcolor: isDark ? 'rgba(128,128,128,0.1)' : 'rgba(128,128,128,0.1)',
      zeroline: false,
      color: isDark ? '#6B6B70' : '#9ca3af',
    },
    yaxis: {
      title: 'Lifetime value ($)',
      gridcolor: isDark ? 'rgba(128,128,128,0.1)' : 'rgba(128,128,128,0.1)',
      zeroline: false,
      tickprefix: '$',
      color: isDark ? '#6B6B70' : '#9ca3af',
    },
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'transparent',
      font: { color: isDark ? '#AEAEB2' : '#6b7280' },
    },
    hovermode: 'closest',
    dragmode: 'zoom',
  }), [isDark])

  const config = {
    responsive: true,
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
    modeBarButtonsToAdd: [],
    toImageButtonOptions: {
      format: 'png',
      filename: 'panda_customer_scatter',
      height: 800,
      width: 1400,
      scale: 2,
    },
    displaylogo: false,
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1C1C1E]">

      <SidePanel
        country={country}
        onCountryChange={setCountry}
        customerType={customerType}
        onSegmentChange={setCustomerType}
        dateRange={dateRange}
        onDateChange={setDateRange}
        percentile={percentile}
        rawPercentile={rawPercentile}
        onPercentileChange={setRawPercentile}
        repeatThreshold={repeatThreshold}
        rawRepeatThreshold={rawRepeatThreshold}
        onRepeatThresholdChange={setRawRepeatThreshold}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2D2D2F] bg-white dark:bg-[#242426]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 dark:text-[#8E8E93] hover:text-gray-900 dark:hover:text-[#F2F2F7] flex items-center gap-1"
            >
              ← Back to dashboard
            </button>
            <span className="text-gray-300 dark:text-[#3A3A3C]">|</span>
            <h1 className="text-sm font-medium text-gray-900 dark:text-[#F2F2F7]">
              Customer LTV — Full scatter view
            </h1>
          </div>

          <p className="text-xs text-gray-400 dark:text-[#6B6B70]">
            {validCustomers.length.toLocaleString()} customers ·{' '}
            all dots visible · scroll to zoom · drag to pan
          </p>
        </div>

        {/* Chart area */}
        <div className="flex-1 p-4" style={{ minHeight: 0 }}>
          {isLoadingFromSupabase ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400 dark:text-[#6B6B70]">Loading...</p>
            </div>
          ) : !isReady ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400 dark:text-[#6B6B70]">No data available.</p>
            </div>
          ) : (
            <Plot
              data={traces}
              layout={layout}
              config={config}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          )}
        </div>
      </div>
    </div>
  )
}
