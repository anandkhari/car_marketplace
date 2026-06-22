export function formatMoney(value) {
  const n = Number(value) || 0
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatMoneyCompact(value) {
  const n = Number(value) || 0
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'm'
  if (n >= 1000) return '$' + (n / 1000).toFixed(2) + 'k'
  return formatMoney(n)
}
