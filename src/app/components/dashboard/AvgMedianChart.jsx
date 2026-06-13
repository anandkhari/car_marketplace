import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs mt-0.5" style={{ color: p.fill }}>
          {p.name}: ${Math.round(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function AvgMedianChart({ bucketStats, percentile }) {
  const pLabel = `P${percentile} LTV`
  const data = bucketStats.map(b => ({
    bucket: b.bucket,
    'Avg LTV': Math.round(b.avgLTV),
    [pLabel]: Math.round(b.percentileLTV),
  }))

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 mb-0.5">
        Avg LTV vs P{percentile} LTV by bucket
      </div>
      <div className="text-xs text-gray-400 mb-4">
        Spread between mean and percentile indicates skew in spending
      </div>

      <div className="flex gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-sm flex-shrink-0 bg-[#185FA5]" />
          Avg LTV
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-sm flex-shrink-0 bg-[#85B7EB]" />
          {pLabel}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
            tickFormatter={v => '$' + v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="Avg LTV" fill="#185FA5" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey={pLabel} fill="#85B7EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}