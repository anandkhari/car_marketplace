'use client'

import { formatMoneyCompact as fmtK } from '@/lib/formatMoney'

function pct(count, total) {
  return total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%'
}

function OutcomeCard({
  title, count, total, lines, showPercentage = true,
  cardClass, titleClass, countClass, subClass, lineClass,
}) {
  return (
    <div className={`rounded-xl border-2 p-4 ${cardClass}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${titleClass}`}>
        {title}
      </div>
      <div className={`text-2xl font-semibold mb-0.5 ${countClass}`}>
        {count.toLocaleString()}
        <span className={`text-xs font-normal ml-2 ${subClass}`}>bookings</span>
      </div>
      {showPercentage ? (
        <div className={`text-xs mb-3 ${subClass}`}>{pct(count, total)} of total</div>
      ) : (
        <div className={`text-xs mb-3 ${subClass}`}>Overall volume</div>
      )}
      {lines.map((line, i) => (
        <div key={i} className={`text-xs mt-1 ${lineClass}`}>{line}</div>
      ))}
    </div>
  )
}

export default function BookingOutcomes({ outcomes }) {
  const { totalBookings, fullProfit, partialRefund, fullRefund, disputeLoss } = outcomes

  const totalVolume =
    (fullProfit.revenue || 0) +
    (partialRefund.kept || 0) +
    (partialRefund.grossLost || 0) +
    (fullRefund.totalLoss || 0) +
    (disputeLoss.totalLoss || 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

      {/* Total Bookings */}
      <OutcomeCard
        title="Total Bookings"
        count={totalBookings}
        total={totalBookings}
        showPercentage={false}
        lines={[`Gross volume: ${fmtK(totalVolume)}`]}
        cardClass="bg-white border-gray-200 dark:bg-[#2D2D2F] dark:border-[#3A3A3C]"
        titleClass="text-slate-500 dark:text-[#8E8E93]"
        countClass="text-gray-900 dark:text-[#F2F2F7]"
        subClass="text-gray-400 dark:text-[#6B6B70]"
        lineClass="text-gray-600 dark:text-[#8E8E93]"
      />

      {/* Full profit */}
      <OutcomeCard
        title="Net Bookings"
        count={fullProfit.count}
        total={totalBookings}
        lines={[`Revenue kept: ${fmtK(fullProfit.revenue)}`]}
        cardClass="bg-green-50 border-green-200 dark:bg-[#242426] dark:border-green-900"
        titleClass="text-green-700 dark:text-green-400"
        countClass="text-green-800 dark:text-green-300"
        subClass="text-green-500 dark:text-green-700"
        lineClass="text-green-600 dark:text-green-700"
      />

      {/* Partial refund */}
      <OutcomeCard
        title="Partial refund"
        count={partialRefund.count}
        total={totalBookings}
        lines={[
          `Lost to refund: ${fmtK(partialRefund.grossLost)}`,
          `Kept: ${fmtK(partialRefund.kept)}`,
        ]}
        cardClass="bg-amber-50 border-amber-200 dark:bg-[#242426] dark:border-amber-900"
        titleClass="text-amber-700 dark:text-amber-400"
        countClass="text-amber-800 dark:text-amber-300"
        subClass="text-amber-500 dark:text-amber-700"
        lineClass="text-amber-600 dark:text-amber-700"
      />

      {/* Full refund */}
      <OutcomeCard
        title="Full refund"
        count={fullRefund.count}
        total={totalBookings}
        lines={[`Total loss: ${fmtK(fullRefund.totalLoss)}`]}
        cardClass="bg-red-50 border-red-200 dark:bg-[#242426] dark:border-red-900"
        titleClass="text-red-700 dark:text-red-400"
        countClass="text-red-800 dark:text-red-300"
        subClass="text-red-500 dark:text-red-700"
        lineClass="text-red-600 dark:text-red-700"
      />

      {/* Dispute loss */}
      <OutcomeCard
        title="Dispute loss"
        count={disputeLoss.count}
        total={totalBookings}
        lines={[`Total loss: ${fmtK(disputeLoss.totalLoss)}`]}
        cardClass="bg-purple-50 border-purple-200 dark:bg-[#242426] dark:border-purple-900"
        titleClass="text-purple-700 dark:text-purple-400"
        countClass="text-purple-800 dark:text-purple-300"
        subClass="text-purple-500 dark:text-purple-700"
        lineClass="text-purple-600 dark:text-purple-700"
      />

    </div>
  )
}
