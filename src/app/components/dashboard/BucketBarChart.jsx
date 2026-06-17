'use client'

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
import { useTheme } from 'next-themes'
import { BUCKET_COLORS } from '@/lib/analytics/constants'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#2D2D2F] border border-gray-100 dark:border-[#3A3A3C] rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900 dark:text-[#F2F2F7]">{label}</p>
      <p className="text-xs text-gray-500 dark:text-[#6B6B70] mt-0.5">
        {payload[0].value.toLocaleString()} customers
      </p>
    </div>
  )
}

export default function BucketBarChart({ bucketStats }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const tickColor = isDark ? '#6B6B70' : '#9ca3af'

  return (
    <div className="bg-white dark:bg-[#242426] border border-gray-100 dark:border-[#2D2D2F] rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 dark:text-[#F2F2F7] mb-0.5">
        Customer distribution by booking count
      </div>
      <div className="text-xs text-gray-400 dark:text-[#6B6B70] mb-4">
        Grouped into frequency buckets
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {bucketStats.map((b, i) => (
          <span key={b.bucket} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8E8E93]">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: BUCKET_COLORS[i] }}
            />
            {b.bucket}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={bucketStats} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
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
