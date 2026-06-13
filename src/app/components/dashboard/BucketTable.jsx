function fmt(n) {
  return '$' + Math.round(n).toLocaleString()
}

function InlineBar({ value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{fmt(value)}</div>
      <div className="w-full bg-gray-100 rounded-full h-1">
        <div
          className="h-1 rounded-full bg-[#185FA5]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SkewBadge({ avg, percentile }) {
  const isSkewed = avg > percentile
  return (
    <span
      className="text-xs font-medium"
      style={{ color: isSkewed ? '#185FA5' : '#3B6D11' }}
    >
      {isSkewed ? '↑ skewed high' : '≈ symmetric'}
    </span>
  )
}

export default function BucketTable({ bucketStats, percentile }) {
  const maxLTV = Math.max(...bucketStats.map(b => b.totalLTV))

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 mb-0.5">
        Bucket summary table
      </div>
      <div className="text-xs text-gray-400 mb-4">
        Lifetime value, averages, and medians by customer segment
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                Bucket
              </th>
              <th className="text-right font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                Customers
              </th>
              <th className="text-left font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                Total LTV
              </th>
              <th className="text-right font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                Avg LTV
              </th>
              <th className="text-right font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                P{percentile} LTV
              </th>
              <th className="text-right font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                Distribution
              </th>
            </tr>
          </thead>
          <tbody>
            {bucketStats.map((b, i) => (
              <tr
                key={b.bucket}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2.5 border-b border-gray-50 font-medium text-gray-900">
                  {b.bucket}
                </td>
                <td className="px-3 py-2.5 border-b border-gray-50 text-right tabular-nums text-gray-700">
                  {b.customers.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 border-b border-gray-50 min-w-32">
                  <InlineBar value={b.totalLTV} max={maxLTV} />
                </td>
                <td className="px-3 py-2.5 border-b border-gray-50 text-right tabular-nums text-gray-700">
                  {fmt(b.avgLTV)}
                </td>
                <td className="px-3 py-2.5 border-b border-gray-50 text-right tabular-nums text-gray-700">
                  {fmt(b.percentileLTV)}
                </td>
                <td className="px-3 py-2.5 border-b border-gray-50 text-right">
                  <SkewBadge avg={b.avgLTV} percentile={b.percentileLTV} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}