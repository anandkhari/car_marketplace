import { useMemo } from 'react'
import {
  ScatterChart as RechartsScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const BUCKET_X = {
  '1 booking': 1,
  '2 bookings': 2,
  '3 bookings': 3,
  '4 bookings': 4,
  '5+ bookings': 5,
}

const X_LABELS = {
  1: '1 booking',
  2: '2 bookings',
  3: '3 bookings',
  4: '4 bookings',
  5: '5+ bookings',
}

function jitter(seed, bucketIndex) {
  const x = Math.sin(seed + bucketIndex) * 10000
  const frac = x - Math.floor(x)
  return (frac - 0.5) * 0.5
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900">{d.bucket}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        LTV: ${Math.round(d.y).toLocaleString()}
      </p>
    </div>
  )
}

export default function ScatterChart({ filteredCustomers, percentile, avgLTV, percentileLTV }) {
  // Memoized so recharts sees a stable array reference unless customers actually change
  const points = useMemo(() => filteredCustomers.map((c, i) => {
    const bucketIndex = BUCKET_X[c.bucket] ?? 1
    return {
      x: bucketIndex + jitter(i, bucketIndex),
      y: c.netVolume,
      bucket: c.bucket,
    }
  }), [filteredCustomers])

  if (!points.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-xs text-gray-400">No customers in selected date range.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 mb-0.5">
        Individual customer LTV — all buckets
      </div>
      <div className="text-xs text-gray-400 mb-4">
        Each dot = one customer · lines = avg &amp; P{percentile}
      </div>

      <div className="flex gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 border-t-2 border-[#D85A30] shrink-0" />
          Avg
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 border-t-2 border-dashed border-[#7F77DD] shrink-0" />
          P{percentile}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <RechartsScatter margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(0,0,0,0.05)" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={v => X_LABELS[v] ?? ''}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => '$' + v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
          <Scatter
            data={points}
            fill="rgba(24, 95, 165, 0.35)"
            stroke="rgba(24, 95, 165, 0.6)"
            strokeWidth={0.5}
          />
          <ReferenceLine
            y={avgLTV}
            stroke="#D85A30"
            strokeWidth={1.5}
            label={{ value: 'Avg', position: 'insideTopRight', fontSize: 10, fill: '#D85A30' }}
          />
          <ReferenceLine
            y={percentileLTV}
            stroke="#7F77DD"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            label={{ value: `P${percentile}`, position: 'insideTopRight', fontSize: 10, fill: '#7F77DD' }}
          />
        </RechartsScatter>
      </ResponsiveContainer>
    </div>
  )
}
