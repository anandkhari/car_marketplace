'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import { formatMoney } from '@/lib/formatMoney'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#2D2D2F] border border-gray-100 dark:border-[#3A3A3C] rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900 dark:text-[#F2F2F7] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs mt-0.5" style={{ color: p.fill }}>
          {p.name}: {formatMoney(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function AvgPercentileChart({ allBucketStats, subBucketStats, nonBucketStats, percentile }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const tickColor = isDark ? '#6B6B70' : '#9ca3af'

  const pLabel = `P${percentile}`

  const data = allBucketStats.map((b, i) => ({
    bucket: b.bucket,
    'All — Avg': b.avgLTV,
    [`All — ${pLabel}`]: b.percentileLTV,
    'Sub — Avg': subBucketStats[i]?.avgLTV ?? 0,
    'Non-sub — Avg': nonBucketStats[i]?.avgLTV ?? 0,
  }))

  const seriesWithLabel = [
    { key: 'All — Avg',         color: '#185FA5' },
    { key: `All — ${pLabel}`,   color: '#85B7EB' },
    { key: 'Sub — Avg',         color: '#639922' },
    { key: 'Non-sub — Avg',     color: '#97C459' },
  ]

  return (
    <div className="bg-white dark:bg-[#242426] border border-gray-100 dark:border-[#2D2D2F] rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 dark:text-[#F2F2F7] mb-0.5">
        Avg vs P{percentile} LTV by bucket
      </div>
      <div className="text-xs text-gray-400 dark:text-[#6B6B70] mb-4">
        Compared across all customers, subscribers, and non-subscribers
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {seriesWithLabel.map(s => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8E8E93]">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
            {s.key}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
          {seriesWithLabel.map(s => (
            <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={20} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
