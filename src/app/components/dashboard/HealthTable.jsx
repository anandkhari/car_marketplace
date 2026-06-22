'use client'

import { formatMoneyCompact as fmtK } from '@/lib/formatMoney'

function RefundBadge({ rate }) {
  const isHigh = rate > 10
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
        isHigh
          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      }`}
    >
      {rate.toFixed(1)}%
    </span>
  )
}

export default function HealthTable({ allBucketStats }) {
  return (
    <div className="bg-white dark:bg-[#242426] border border-gray-100 dark:border-[#2D2D2F] rounded-xl p-4">
      <div className="text-sm font-medium text-gray-900 dark:text-[#F2F2F7] mb-0.5">Business health by bucket</div>
      <div className="text-xs text-gray-400 dark:text-[#6B6B70] mb-4">
        Gross, refunds, disputes, and net revenue across all customers
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#2D2D2F]">
              <th className="text-left font-medium text-gray-500 dark:text-[#6B6B70] px-3 py-2 border-b border-gray-100 dark:border-[#2D2D2F]">Bucket</th>
              <th className="text-right font-medium text-gray-500 dark:text-[#6B6B70] px-3 py-2 border-b border-gray-100 dark:border-[#2D2D2F]">Gross</th>
              <th className="text-right font-medium px-3 py-2 border-b border-gray-100 dark:border-[#2D2D2F] text-[#A32D2D] dark:text-red-400">Refunds</th>
              <th className="text-right font-medium px-3 py-2 border-b border-gray-100 dark:border-[#2D2D2F] text-[#854F0B] dark:text-amber-400">Disputes</th>
              <th className="text-right font-medium px-3 py-2 border-b border-gray-100 dark:border-[#2D2D2F] text-[#3B6D11] dark:text-green-400">Net</th>
              <th className="text-right font-medium text-gray-500 dark:text-[#6B6B70] px-3 py-2 border-b border-gray-100 dark:border-[#2D2D2F]">Refund rate</th>
            </tr>
          </thead>
          <tbody>
            {allBucketStats.map(b => (
              <tr key={b.bucket} className="hover:bg-gray-50 dark:hover:bg-[#2D2D2F] transition-colors">
                <td className="px-3 py-2.5 border-b border-gray-50 dark:border-[#2D2D2F] font-medium text-gray-900 dark:text-[#F2F2F7]">{b.bucket}</td>
                <td className="px-3 py-2.5 border-b border-gray-50 dark:border-[#2D2D2F] text-right tabular-nums text-gray-700 dark:text-[#F2F2F7]">{fmtK(b.gross)}</td>
                <td className="px-3 py-2.5 border-b border-gray-50 dark:border-[#2D2D2F] text-right tabular-nums text-[#A32D2D] dark:text-red-400">{fmtK(b.refunded)}</td>
                <td className="px-3 py-2.5 border-b border-gray-50 dark:border-[#2D2D2F] text-right tabular-nums text-[#854F0B] dark:text-amber-400">{fmtK(b.disputeLosses)}</td>
                <td className="px-3 py-2.5 border-b border-gray-50 dark:border-[#2D2D2F] text-right tabular-nums font-medium text-[#3B6D11] dark:text-green-400">{fmtK(b.net)}</td>
                <td className="px-3 py-2.5 border-b border-gray-50 dark:border-[#2D2D2F] text-right">
                  <RefundBadge rate={b.refundRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
