'use client'

import { useDashboard } from '@/hooks/useDashboard'
import UploadZone from '@/components/dashboard/UploadZone'
import KPIStrip from '@/components/dashboard/KPIStrip'
import BucketBarChart from '@/components/dashboard/BucketBarChart'
import LTVDonutChart from '@/components/dashboard/LTVDonutChart'
import AvgMedianChart from '@/components/dashboard/AvgMedianChart'
import BucketTable from '@/components/dashboard/BucketTable'
import ScatterChart from '@/components/dashboard/ScatterChart'

export default function Page() {
  const {
    isLoading,
    error,
    fileName,
    dateRange,
    hasData,
    kpis,
    bucketStats,
    filteredCustomers,
    percentile,
    repeatThreshold,
    handleFileUpload,
    setDateRange,
    setPercentile,
    setRepeatThreshold,
  } = useDashboard()

  if (!hasData) {
    return (
      <UploadZone
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  const repeatBadge = repeatThreshold === 1
    ? '1+ booking'
    : `${repeatThreshold}+ bookings`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Top bar */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Booking frequency dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Car detailing marketplace · customer cohort analysis
              {fileName && (
                <span className="ml-2 text-blue-400">· {fileName}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={e => setDateRange(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
              <option value={365}>Last 12 months</option>
              <option value={0}>All time</option>
            </select>

            <label className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
              Upload new
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) handleFileUpload(file)
                }}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Metric sliders */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-3">
            <span className="text-xs font-medium text-gray-500 w-40 shrink-0">Percentile metric</span>
            <input
              type="range"
              min={1}
              max={99}
              step={1}
              defaultValue={50}
              onChange={e => setPercentile(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-md px-2.5 py-1 shrink-0 w-12 text-center tabular-nums">
              P{percentile}
            </span>
          </div>

          <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-3">
            <span className="text-xs font-medium text-gray-500 w-40 shrink-0">Repeat rate threshold</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              defaultValue={2}
              onChange={e => setRepeatThreshold(Number(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className="text-xs font-semibold bg-green-100 text-green-700 rounded-md px-2.5 py-1 shrink-0 w-24 text-center tabular-nums">
              {repeatBadge}
            </span>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mb-8">
          <KPIStrip
            kpis={kpis}
            dateRange={dateRange}
            percentile={percentile}
            repeatThreshold={repeatThreshold}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BucketBarChart bucketStats={bucketStats} />
          <LTVDonutChart bucketStats={bucketStats} />
        </div>

        {/* Charts row 2 */}
        <div className="mb-4">
          <AvgMedianChart bucketStats={bucketStats} percentile={percentile} />
        </div>

        {/* Scatter chart */}
        <div className="mb-4">
          <ScatterChart
            filteredCustomers={filteredCustomers}
            percentile={percentile}
            avgLTV={kpis.avgLTV}
            percentileLTV={kpis.percentileLTV}
          />
        </div>

        {/* Table */}
        <BucketTable bucketStats={bucketStats} percentile={percentile} />

      </div>
    </div>
  )
}
