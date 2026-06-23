'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const Plot = dynamic(
  () => import('react-plotly.js'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

const BUCKET_INDEX = {
  '1 booking':   0,
  '2 bookings':  1,
  '3 bookings':  2,
  '4 bookings':  3,
  '5+ bookings': 4,
}

const BUCKETS = [
  '1 booking',
  '2 bookings',
  '3 bookings',
  '4 bookings',
  '5+ bookings',
]

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
  return (frac - 0.5) * 0.35
}

function xPos(c) {
  const bi = BUCKET_INDEX[c.bucket] ?? 0
  const seed = stableIndex(c.id || String(Math.random()))
  return bi + 1 + jitter(seed, bi * 1000)
}

function buildTrace(customers, name, symbol, color, borderColor) {
  return {
    type: 'scatter',
    mode: 'markers',
    name,
    x: customers.map(c => xPos(c)),
    y: customers.map(c => c.net ?? 0),
    text: customers.map(c => {
      const tipLine = (c.tipTotal ?? 0) > 0
        ? `<br>Tips: $${Number(c.tipTotal).toFixed(2)}`
        : ''
      return (
        `<b>${c.name || 'Unidentified'}</b><br>` +
        `LTV: $${Number(c.net ?? 0).toFixed(2)}<br>` +
        `Bookings: ${c.bookingCount ?? '—'}<br>` +
        `Segment: ${name}` +
        tipLine
      )
    }),
    hoverinfo: 'text',
    marker: {
      symbol,
      size: 7,
      color,
      line: { color: borderColor, width: 0.8 },
    },
  }
}

function buildReferenceTraces(customers, percentile, isDark) {
  const avgX = []
  const avgY = []
  const pctX = []
  const pctY = []

  BUCKETS.forEach((bucket, bi) => {
    const ltvs = customers
      .filter(c => c.bucket === bucket)
      .map(c => c.net ?? 0)
      .filter(v => v > 0)

    if (!ltvs.length) return

    const avg = ltvs.reduce((a, b) => a + b, 0) / ltvs.length

    const sorted = [...ltvs].sort((a, b) => a - b)
    const idx = (percentile / 100) * (sorted.length - 1)
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    const pVal = lo === hi
      ? sorted[lo]
      : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)

    const xStart = bi + 0.62
    const xEnd   = bi + 1.38

    avgX.push(xStart, xEnd, null)
    avgY.push(Math.round(avg * 100) / 100, Math.round(avg * 100) / 100, null)
    pctX.push(xStart, xEnd, null)
    pctY.push(Math.round(pVal * 100) / 100, Math.round(pVal * 100) / 100, null)
  })

  const avgTrace = {
    type: 'scatter',
    mode: 'lines',
    name: 'Avg LTV',
    x: avgX,
    y: avgY,
    line: { color: '#D85A30', width: 2 },
    hoverinfo: 'skip',
    showlegend: true,
  }

  const pctTrace = {
    type: 'scatter',
    mode: 'lines',
    name: `P${percentile} LTV`,
    x: pctX,
    y: pctY,
    line: { color: '#7F77DD', width: 2, dash: 'dash' },
    hoverinfo: 'skip',
    showlegend: true,
  }

  return [avgTrace, pctTrace]
}

export default function ScatterPlot({
  filteredCustomers = [],
  customerType = 'all',
  dotFilter = 'all',
  isDark = false,
  rawPercentile,
  percentile = 50,
}) {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const FILTERS = {
    all:      () => true,
    top:      c => (c.net ?? 0) > 1000,
    loyal:    c => c.firstPayment && new Date(c.firstPayment) < oneYearAgo,
    generous: c => (c.tipTotal ?? 0) > 50,
  }

  const displayCustomers = useMemo(() => {
    return filteredCustomers
      .filter(c =>
        c.bucket != null &&
        BUCKET_INDEX[c.bucket] !== undefined &&
        (c.net ?? 0) > 0
      )
      .filter(FILTERS[dotFilter] || FILTERS.all)
  }, [filteredCustomers, dotFilter])

  const traces = useMemo(() => {
    const subs    = displayCustomers.filter(c => c.isSubscriber)
    const nonSubs = displayCustomers.filter(c => !c.isSubscriber)
    const result  = []

    if (customerType !== 'non') {
      result.push(buildTrace(
        subs,
        'Subscriber',
        'circle',
        'rgba(24,95,165,0.5)',
        'rgba(24,95,165,0.8)'
      ))
    }
    if (customerType !== 'sub') {
      result.push(buildTrace(
        nonSubs,
        'Non-subscriber',
        'triangle-up',
        'rgba(99,153,34,0.5)',
        'rgba(99,153,34,0.8)'
      ))
    }
    return result
  }, [displayCustomers, customerType])

  const refTraces = useMemo(() =>
    buildReferenceTraces(displayCustomers, percentile, isDark),
    [displayCustomers, percentile, isDark]
  )

  const allTraces = useMemo(() => [...traces, ...refTraces], [traces, refTraces])

  const layout = useMemo(() => {
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    const tickColor = isDark ? '#6B6B70' : '#9ca3af'

    return {
      paper_bgcolor: 'transparent',
      plot_bgcolor:  'transparent',
      margin: { t: 10, r: 20, b: 60, l: 70 },
      showlegend: false,
      xaxis: {
        title: { text: 'booking bucket', font: { size: 10, color: tickColor } },
        tickmode: 'array',
        tickvals: [1, 2, 3, 4, 5],
        ticktext: ['1 booking', '2 bookings', '3 bookings', '4 bookings', '5+ bookings'],
        range: [0.4, 5.6],
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { size: 10, color: tickColor },
      },
      yaxis: {
        title: { text: 'lifetime value', font: { size: 10, color: tickColor } },
        gridcolor: gridColor,
        zeroline: false,
        tickprefix: '$',
        tickfont: { size: 10, color: tickColor },
      },
      hovermode: 'closest',
      dragmode:  'zoom',
    }
  }, [isDark])

  const config = {
    responsive: true,
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToRemove: [
      'select2d',
      'lasso2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toImage',
    ],
    displaylogo: false,
  }

  if (!filteredCustomers.length) {
    return (
      <div className="bg-white dark:bg-[#242426] border border-gray-100 dark:border-[#2D2D2F] rounded-xl p-4 mb-3">
        <p className="text-xs text-gray-400 dark:text-[#6B6B70]">
          No customers in selected date range.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#242426] border border-gray-100 dark:border-[#2D2D2F] rounded-xl p-4 mb-3">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-[#F2F2F7]">
            Individual customer LTV
          </span>

          {/* Info icon with tooltip */}
          <div className="relative group">
            <svg
              className="w-3.5 h-3.5 text-gray-400 dark:text-[#6B6B70] cursor-help"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01"/>
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
              <div className="bg-gray-900 dark:bg-[#F2F2F7] text-white dark:text-[#1C1C1E] text-[11px] rounded-lg px-3 py-2 text-center leading-relaxed shadow-lg">
                {`Showing all ${displayCustomers.length.toLocaleString()} customers. Scroll to zoom, drag to pan.`}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Subtitle */}
      <p className="text-xs text-gray-400 dark:text-[#6B6B70] mb-3">
        {displayCustomers.length.toLocaleString()} customers · scroll to zoom · drag to pan
      </p>

      {/* Custom legend */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-500 dark:text-[#8E8E93]">
        {(customerType === 'all' || customerType === 'sub') && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: 'rgba(24,95,165,0.5)' }}
            />
            Subscriber
          </span>
        )}

        {(customerType === 'all' || customerType === 'non') && (
          <span className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
              <polygon points="5,0 0,10 10,10" fill="rgba(99,153,34,0.5)" />
            </svg>
            Non-subscriber
          </span>
        )}

        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 shrink-0 bg-[#D85A30]" />
          Avg LTV
        </span>

        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-5 shrink-0"
            style={{
              background: 'repeating-linear-gradient(90deg,#7F77DD 0,#7F77DD 5px,transparent 5px,transparent 9px)',
            }}
          />
          P{rawPercentile} LTV
        </span>
      </div>

      {/* Chart */}
      <Plot
        data={allTraces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: 'calc(100vh - 220px)' }}
        useResizeHandler
      />
    </div>
  )
}
