'use client'

import { useState } from 'react'

function FilterIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M8 12h8M11 18h2" />
    </svg>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-400 dark:text-[#6B6B70] uppercase px-5 pt-5 pb-2">
      {children}
    </p>
  )
}

function Divider() {
  return <hr className="border-slate-200/60 dark:border-[#2D2D2F] mx-4 my-2" />
}

function SegmentButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`block w-[calc(100%-1.5rem)] mx-3 text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
        active
          ? 'bg-white dark:bg-[#2D2D2F] text-indigo-700 dark:text-[#F2F2F7] font-medium shadow-sm ring-1 ring-slate-200/50 dark:ring-[#3A3A3C]'
          : 'text-slate-600 dark:text-[#8E8E93] hover:bg-slate-200/50 dark:hover:bg-[#2D2D2F] hover:text-slate-900 dark:hover:text-[#F2F2F7]'
      }`}
    >
      {children}
    </button>
  )
}

function DateOption({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-[calc(100%-1.5rem)] mx-3 text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
        active
          ? 'bg-white dark:bg-[#2D2D2F] text-indigo-700 dark:text-[#F2F2F7] font-medium shadow-sm ring-1 ring-slate-200/50 dark:ring-[#3A3A3C]'
          : 'text-slate-600 dark:text-[#8E8E93] hover:bg-slate-200/50 dark:hover:bg-[#2D2D2F] hover:text-slate-900 dark:hover:text-[#F2F2F7]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
          active ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-300 dark:bg-[#3A3A3C]'
        }`}
      />
      {children}
    </button>
  )
}

function CountryPillToggle({ country, onChange }) {
  return (
    <div className="mx-3 flex items-center bg-slate-100 dark:bg-[#1C1C1E] rounded-full p-1">
      {['canada', 'us'].map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-all duration-200 ${
            country === c
              ? 'bg-slate-900 dark:bg-[#F2F2F7] text-white dark:text-[#1C1C1E] shadow-sm'
              : 'text-slate-500 dark:text-[#6B6B70] hover:text-slate-700 dark:hover:text-[#F2F2F7]'
          }`}
        >
          {c === 'canada' ? 'Canada' : 'US'}
        </button>
      ))}
    </div>
  )
}

function isDateActive(dateRange, value) {
  if (typeof value === 'number') return typeof dateRange === 'number' && dateRange === value
  return typeof dateRange === 'object' && dateRange !== null && dateRange.type === value.type
}

function getYears() {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear - 1; y >= 2020; y--) {
    years.push(y)
  }
  return years
}

export default function SidePanel({
  country,
  onCountryChange,
  customerType,
  onSegmentChange,
  dateRange,
  onDateChange,
  availableYears,
  percentile,
  rawPercentile,
  onPercentileChange,
  repeatThreshold,
  rawRepeatThreshold,
  onRepeatThresholdChange,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(
    dateRange?.type === 'custom'
  )
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const isYearActive = dateRange?.type === 'year'
  const isCustomActive = dateRange?.type === 'custom'
  const isRelativeActive = typeof dateRange === 'number' && dateRange !== 0
  const canApplyCustom = !!(customStart && customEnd)

  function handleApplyCustom() {
    if (!canApplyCustom) return
    onDateChange({
      type: 'custom',
      start: new Date(customStart),
      end: new Date(customEnd),
    })
  }

  const panelContent = (
    <div className="pb-8 mt-10">

      {/* Logo area */}
      <div className="flex items-center gap-3 pt-6 px-6 pb-4">
        <img
          src="/logo.jpeg"
          alt="Panda Hub Logo"
          className="w-32 h-12 shrink-0 drop-shadow-sm rounded-4xl"
        />
      </div>

      <Divider />

      {/* Country */}
      <SectionLabel>Country</SectionLabel>
      <CountryPillToggle country={country} onChange={onCountryChange} />

      {/* Segment */}
      <SectionLabel>Segment</SectionLabel>
      <div className="flex flex-col gap-1">
        <SegmentButton active={customerType === 'all'} onClick={() => onSegmentChange('all')}>
          All customers
        </SegmentButton>
        <SegmentButton active={customerType === 'sub'} onClick={() => onSegmentChange('sub')}>
          Subscribers
        </SegmentButton>
        <SegmentButton active={customerType === 'non'} onClick={() => onSegmentChange('non')}>
          Non-subscribers
        </SegmentButton>
      </div>

      {/* Percentile */}
      <Divider />
      <SectionLabel>Percentile</SectionLabel>
      <div className="flex items-center justify-between px-3 mb-2">
        <button
          onClick={() => onPercentileChange(Math.max(1, rawPercentile - 1))}
          disabled={rawPercentile === 1}
          className="w-7 h-7 rounded-full border border-slate-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2D2D2F] text-slate-600 dark:text-[#AEAEB2] text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#3A3A3C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          −
        </button>
        <span className={`text-sm font-semibold min-w-[48px] text-center ${rawPercentile === 50 ? 'text-slate-600 dark:text-[#8E8E93]' : 'text-indigo-600 dark:text-[#F2F2F7]'}`}>
          P{rawPercentile}
        </span>
        <button
          onClick={() => onPercentileChange(Math.min(99, rawPercentile + 1))}
          disabled={rawPercentile === 99}
          className="w-7 h-7 rounded-full border border-slate-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2D2D2F] text-slate-600 dark:text-[#AEAEB2] text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#3A3A3C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          +
        </button>
      </div>
      <div className="px-3 mb-1">
        <input
          type="range"
          min={1}
          max={99}
          value={rawPercentile}
          onChange={e => onPercentileChange(Number(e.target.value))}
          className="w-full h-1 accent-indigo-500 dark:accent-[#F2F2F7] cursor-pointer"
        />
      </div>
      <div className="px-3 mb-3 flex justify-between text-[10px] text-slate-400 dark:text-[#6B6B70]">
        <span>P1</span>
        <span>P25</span>
        <span>P50</span>
        <span>P75</span>
        <span>P99</span>
      </div>

      {/* Repeat Rate */}
      <Divider />
      <SectionLabel>Repeat Rate</SectionLabel>
      <div className="flex items-center justify-between px-3 mb-2">
        <button
          onClick={() => onRepeatThresholdChange(Math.max(1, rawRepeatThreshold - 1))}
          disabled={rawRepeatThreshold === 1}
          className="w-7 h-7 rounded-full border border-slate-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2D2D2F] text-slate-600 dark:text-[#AEAEB2] text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#3A3A3C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          −
        </button>
        <span className="text-sm font-semibold min-w-[80px] text-center text-slate-600 dark:text-[#8E8E93]">
          {rawRepeatThreshold}+ bookings
        </span>
        <button
          onClick={() => onRepeatThresholdChange(Math.min(5, rawRepeatThreshold + 1))}
          disabled={rawRepeatThreshold === 5}
          className="w-7 h-7 rounded-full border border-slate-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2D2D2F] text-slate-600 dark:text-[#AEAEB2] text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#3A3A3C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          +
        </button>
      </div>
      <div className="px-3 mb-1">
        <input
          type="range"
          min={1}
          max={5}
          value={rawRepeatThreshold}
          onChange={e => onRepeatThresholdChange(Number(e.target.value))}
          className="w-full h-1 accent-green-500 dark:accent-[#F2F2F7] cursor-pointer"
        />
      </div>
      <div className="px-3 mb-3 flex justify-between text-[10px] text-slate-400 dark:text-[#6B6B70]">
        <span>1+</span>
        <span>2+</span>
        <span>3+</span>
        <span>4+</span>
        <span>5+</span>
      </div>

      {/* Date range */}
      <Divider />
      <SectionLabel>Date range</SectionLabel>
      <div className="flex flex-col gap-1">

        {/* Relative period dropdown */}
        <div className="px-4 mx-1 mb-2">
          <select
            value={isRelativeActive ? String(dateRange) : ''}
            onChange={e => {
              if (e.target.value === '') return
              onDateChange(Number(e.target.value))
            }}
            className={`w-full text-sm border border-slate-200 dark:border-[#3A3A3C] rounded-lg px-3 py-2 bg-white dark:bg-[#2D2D2F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-[#F2F2F7] ${
              isRelativeActive
                ? 'text-indigo-700 font-medium ring-1 ring-indigo-100 dark:ring-[#3A3A3C]'
                : 'text-slate-600 cursor-pointer'
            }`}
          >
            <option value="" disabled>Select relative period...</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 180 days</option>
            <option value="365">Last 12 months</option>
          </select>
        </div>

        <Divider />

        <DateOption
          active={isDateActive(dateRange, { type: 'monthToDate' })}
          onClick={() => onDateChange({ type: 'monthToDate' })}
        >
          Month to date
        </DateOption>

        <DateOption
          active={isDateActive(dateRange, { type: 'yearToDate' })}
          onClick={() => onDateChange({ type: 'yearToDate' })}
        >
          Year to date
        </DateOption>

        <Divider />

        <DateOption
          active={isDateActive(dateRange, 0)}
          onClick={() => onDateChange(0)}
        >
          All time
        </DateOption>

        <Divider />

        {/* Specific year dropdown */}
        <div className="px-4 mx-1 mt-1 mb-2">
          <label className="block text-[11px] font-semibold tracking-wide text-slate-400 dark:text-[#6B6B70] uppercase mb-1.5 pl-1">
            Specific year
          </label>
          <select
            value={isYearActive ? String(dateRange.year) : ''}
            onChange={e => {
              if (e.target.value === '') return
              onDateChange({ type: 'year', year: Number(e.target.value) })
            }}
            className={`w-full text-sm border border-slate-200 dark:border-[#3A3A3C] rounded-lg px-3 py-2 bg-white dark:bg-[#2D2D2F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-[#F2F2F7] ${
              isYearActive
                ? 'text-indigo-700 font-medium ring-1 ring-indigo-100 dark:ring-[#3A3A3C]'
                : 'text-slate-600 cursor-pointer'
            }`}
          >
            <option value="" disabled>Select year...</option>
            {getYears().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <Divider />

        {/* Custom range */}
        <DateOption
          active={isCustomActive}
          onClick={() => setShowCustom(true)}
        >
          Custom range
        </DateOption>

        {showCustom && (
          <div className="flex flex-col gap-3 px-4 mx-1 mt-3 bg-white dark:bg-[#2D2D2F] p-4 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-[#3A3A3C]">
            <label className="text-xs font-medium text-slate-500 dark:text-[#8E8E93]">
              From
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="mt-1.5 w-full text-sm border border-slate-200 dark:border-[#3A3A3C] rounded-lg px-3 py-2 bg-slate-50 dark:bg-[#1C1C1E] text-slate-700 dark:text-[#F2F2F7] transition-all focus:bg-white dark:focus:bg-[#2D2D2F] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </label>
            <label className="text-xs font-medium text-slate-500 dark:text-[#8E8E93]">
              To
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="mt-1.5 w-full text-sm border border-slate-200 dark:border-[#3A3A3C] rounded-lg px-3 py-2 bg-slate-50 dark:bg-[#1C1C1E] text-slate-700 dark:text-[#F2F2F7] transition-all focus:bg-white dark:focus:bg-[#2D2D2F] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </label>
            <button
              onClick={handleApplyCustom}
              disabled={!canApplyCustom}
              className={`mt-2 w-full text-sm font-medium rounded-lg px-3 py-2.5 transition-all duration-200 ${
                canApplyCustom
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-slate-100 dark:bg-[#1C1C1E] text-slate-400 dark:text-[#6B6B70] cursor-not-allowed'
              }`}
            >
              Apply Filter
            </button>
          </div>
        )}

      </div>
    </div>
  )

  return (
    <>
      {/* Mobile floating Filters button — positioned above ThemeToggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-[#F2F2F7] text-white dark:text-[#1C1C1E] rounded-full px-5 py-3 text-sm font-semibold shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
      >
        <FilterIcon className="w-4 h-4" />
        Filters
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[45] transition-opacity"
        />
      )}

      {/* Side panel */}
      <aside
        className={`fixed top-0 h-screen w-64 bg-slate-50/80 dark:bg-[#242426] backdrop-blur-xl border-r border-slate-200/60 dark:border-[#2D2D2F] overflow-y-auto transition-transform duration-300 ease-out z-50 md:z-40 md:left-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } scrollbar-hide`}
      >
        {panelContent}
      </aside>
    </>
  )
}
