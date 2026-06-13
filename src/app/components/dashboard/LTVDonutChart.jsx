import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BUCKET_COLORS } from '@/lib/analytics/constants'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900">{d.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {d.value.toFixed(1)}% of total LTV
      </p>
    </div>
  )
}

function CustomLabel({ cx, cy, totalLTV }) {
  const formatted =
    totalLTV >= 1000000
      ? '$' + (totalLTV / 1000000).toFixed(1) + 'm'
      : '$' + (totalLTV / 1000).toFixed(0) + 'k'

  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fontSize="18" fontWeight="500" fill="#111827">
        {formatted}
      </tspan>
      <tspan x={cx} dy="20" fontSize="11" fill="#9ca3af">
        total LTV
      </tspan>
    </text>
  )
}

export default function LTVDonutChart({ bucketStats }) {
  const totalLTV = bucketStats.reduce((a, b) => a + b.totalLTV, 0)

  const data = bucketStats.map(b => ({
    name: b.bucket,
    value: totalLTV > 0 ? parseFloat((b.totalLTV / totalLTV * 100).toFixed(1)) : 0,
  }))

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 mb-0.5">
        Lifetime value share by bucket
      </div>
      <div className="text-xs text-gray-400 mb-4">
        % of total LTV contributed per bucket
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {bucketStats.map((b, i) => (
          <span key={b.bucket} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
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
            stroke="white"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={BUCKET_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-6" fontSize="18" fontWeight="500" fill="#111827">
              {totalLTV >= 1000000
                ? '$' + (totalLTV / 1000000).toFixed(1) + 'm'
                : '$' + (totalLTV / 1000).toFixed(0) + 'k'}
            </tspan>
            <tspan x="50%" dy="20" fontSize="11" fill="#9ca3af">
              total LTV
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}