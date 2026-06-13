import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { BUCKET_COLORS } from '@/lib/analytics/constants'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {payload[0].value.toLocaleString()} customers
      </p>
    </div>
  )
}

export default function BucketBarChart({ bucketStats }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 mb-0.5">
        Customer distribution by booking count
      </div>
      <div className="text-xs text-gray-400 mb-4">
        Grouped into frequency buckets
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {bucketStats.map((b, i) => (
          <span key={b.bucket} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: BUCKET_COLORS[i] }}
            />
            {b.bucket}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={bucketStats} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="customers" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {bucketStats.map((_, i) => (
              <Cell key={i} fill={BUCKET_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}