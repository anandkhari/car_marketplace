'use client'

import { useState, useRef, useEffect } from 'react'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su']

function MiniCalendar({ value, onChange, minDate, maxDate }) {
  const [viewing, setViewing] = useState(value ? new Date(value) : new Date())

  useEffect(() => {
    if (value) setViewing(new Date(value))
  }, [value])

  const year  = viewing.getFullYear()
  const month = viewing.getMonth()

  const firstDay  = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  const dow = startDate.getDay()
  startDate.setDate(startDate.getDate() + (dow === 0 ? -6 : 1 - dow))

  const days   = []
  const cursor = new Date(startDate)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  const todayStr = new Date().toDateString()

  return (
    <div className="p-3 w-[224px]">
      {/* Month/year nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewing(new Date(year, month - 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-[#3A3A3C] text-slate-600 dark:text-[#8E8E93] text-sm leading-none"
        >
          ‹
        </button>
        <span className="text-[13px] font-medium text-slate-800 dark:text-[#F2F2F7]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setViewing(new Date(year, month + 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-[#3A3A3C] text-slate-600 dark:text-[#8E8E93] text-sm leading-none"
        >
          ›
        </button>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] text-slate-400 dark:text-[#6B6B70] pb-1">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month
          const isSelected = value && day.toDateString() === new Date(value).toDateString()
          const isToday    = day.toDateString() === todayStr
          const isDisabled =
            (minDate && day < minDate) ||
            (maxDate && day > maxDate)

          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => onChange(day)}
              className={[
                'text-center text-[12px] py-1 rounded transition-colors',
                isSelected
                  ? 'bg-gray-900 dark:bg-[#F2F2F7] text-white dark:text-[#1C1C1E] font-medium'
                  : isDisabled
                  ? 'text-slate-200 dark:text-[#3A3A3C] cursor-not-allowed'
                  : !isCurrentMonth
                  ? 'text-slate-300 dark:text-[#3A3A3C] cursor-pointer'
                  : 'text-slate-800 dark:text-[#F2F2F7] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] cursor-pointer',
                isToday && !isSelected
                  ? 'ring-1 ring-slate-500 dark:ring-[#6B6B70]'
                  : '',
              ].filter(Boolean).join(' ')}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function parseInputDate(raw) {
  const str = (raw || '').trim()
  if (!str) return null
  // YYYY-MM-DD (from browser autofill)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  // MM/DD/YYYY or MM-DD-YYYY
  const parts = str.split(/[\/\-]/)
  if (parts.length === 3) {
    const nums = parts.map(Number)
    // Distinguish YYYY-first vs MM-first by size of first part
    if (nums[0] > 31) {
      // YYYY-MM-DD variant with dash already handled above, but just in case
      return new Date(nums[0], nums[1] - 1, nums[2])
    }
    const [m, d, y] = nums
    if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(y, m - 1, d)
    }
  }
  return null
}

function toDisplayStr(date) {
  if (!date) return ''
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}/${d}/${date.getFullYear()}`
}

export default function DateRangePicker({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  minDate,
  maxDate,
}) {
  const [inputVal, setInputVal]     = useState(value ? toDisplayStr(value) : '')
  const [showCal, setShowCal]       = useState(false)
  const [openUp, setOpenUp]         = useState(false)
  const [inputError, setInputError] = useState(false)
  const inputRef    = useRef(null)
  const containerRef = useRef(null)

  // Sync display string when value prop changes externally
  useEffect(() => {
    setInputVal(value ? toDisplayStr(value) : '')
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!showCal) return
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowCal(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showCal])

  function handleCalToggle() {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setOpenUp(window.innerHeight - rect.bottom < 280)
    setShowCal(s => !s)
  }

  function handleBlur() {
    if (!inputVal) { setInputError(false); return }
    const parsed = parseInputDate(inputVal)
    if (!parsed || isNaN(parsed.getTime())) {
      setInputError(true)
      setInputVal(value ? toDisplayStr(value) : '')
      return
    }
    if (minDate && parsed < minDate) {
      setInputError(true)
      setInputVal(value ? toDisplayStr(value) : '')
      return
    }
    if (maxDate && parsed > maxDate) {
      setInputError(true)
      setInputVal(value ? toDisplayStr(value) : '')
      return
    }
    setInputError(false)
    onChange(parsed)
  }

  function handleCalSelect(day) {
    setShowCal(false)
    setInputVal(toDisplayStr(day))
    setInputError(false)
    onChange(day)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          placeholder={placeholder}
          onChange={e => { setInputVal(e.target.value); setInputError(false) }}
          onBlur={handleBlur}
          className={[
            'flex-1 min-w-0 text-sm rounded-lg px-3 py-1.5 border transition-all',
            'bg-white dark:bg-[#242426] text-slate-700 dark:text-[#F2F2F7]',
            'placeholder:text-slate-300 dark:placeholder:text-[#6B6B70]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            inputError
              ? 'border-red-400 dark:border-red-500'
              : 'border-slate-200 dark:border-[#3A3A3C]',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={handleCalToggle}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2D2D2F] text-slate-500 dark:text-[#8E8E93] hover:bg-slate-50 dark:hover:bg-[#3A3A3C] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {showCal && (
        <div className={[
          'absolute z-[200] left-0',
          'bg-white dark:bg-[#242426]',
          'border border-slate-100 dark:border-[#2D2D2F]',
          'rounded-xl shadow-lg',
          openUp ? 'bottom-full mb-1' : 'top-full mt-1',
        ].join(' ')}>
          <MiniCalendar
            value={value}
            onChange={handleCalSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  )
}
