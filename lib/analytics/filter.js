export function getLatestDate(customers) {
  return customers.reduce((latest, c) => {
    return c.lastPayment > latest ? c.lastPayment : latest
  }, new Date(0))
}

export function filterCustomers(customers, dateRange) {
  // 0 means all time — no filter
  if (dateRange === 0) return customers

  const latest = getLatestDate(customers)
  const cutoff = new Date(latest)
  cutoff.setDate(cutoff.getDate() - dateRange)

  return customers.filter(c => c.lastPayment >= cutoff)
}