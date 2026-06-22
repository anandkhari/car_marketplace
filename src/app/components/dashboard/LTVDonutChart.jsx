'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import { BUCKET_COLORS } from '@/lib/analytics/constants'
import { formatMoneyCompact } from '@/lib/formatMoney'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white dark:bg-[#2D2D2F] border border-gray-100 dark:border-[#3A3A3C] rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900 dark:text-[#F2F2F7]">{d.name}</p>
      <p className="text-xs text-gray-500 dark:text-[#6B6B70] mt-0.5">
        {d.value.toFixed(1)}% of total LTV
      </p>
    </div>
  )
}

export default function LTVDonutChart({ bucketStats, totalLTV }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const centerValueFill = isDark ? '#F2F2F7' : '#111827'
  const centerLabelFill = isDark ? '#6B6B70' : '#9ca3af'
  const strokeColor     = isDark ? '#242426' : 'white'

  const data = bucketStats.map(b => ({
    name: b.bucket,
    value: totalLTV > 0 ? parseFloat((b.totalLTV / totalLTV * 100).toFixed(1)) : 0,
  }))

  const formattedTotal = formatMoneyCompact(totalLTV)

  return (
    <div className="bg-white dark:bg-[#242426] border border-gray-100 dark:border-[#2D2D2F] rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 dark:text-[#F2F2F7] mb-0.5">
        Lifetime value share by bucket
      </div>
      <div className="text-xs text-gray-400 dark:text-[#6B6B70] mb-4">
        % of total LTV contributed per bucket
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {bucketStats.map((b, i) => (
          <span key={b.bucket} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8E8E93]">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: BUCKET_COLORS[i] }}
            />
            {b.bucket} {data[i].value}%
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="80%"
            dataKey="value"
            strokeWidth={2}
            stroke={strokeColor}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={BUCKET_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-6" fontSize="18" fontWeight="500" fill={centerValueFill}>
              {formattedTotal}
            </tspan>
            <tspan x="50%" dy="20" fontSize="11" fill={centerLabelFill}>
              total LTV
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
