'use client'

export default function SliderControl({ label, min, max, step = 1, value, onChange, color, badge }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-3">
      <span className="text-xs font-medium text-gray-500 w-40 shrink-0">{label}</span>

      <button
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        className="text-sm w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 leading-none"
        aria-label="Decrease"
      >
        −
      </button>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`flex-1 slider-${color}`}
        style={{ '--slider-pct': `${pct}%` }}
      />

      <button
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        className="text-sm w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 leading-none"
        aria-label="Increase"
      >
        +
      </button>

      {badge}
    </div>
  )
}
