import { getBucket } from './constants'

export function parseCustomers(rawRows) {
  return rawRows
    .filter(row => {
      // Remove empty rows
      if (!row.customer_id) return false
      // Remove full refund customers — not real customers
      if (parseFloat(row.net_volume) <= 0) return false
      // Must have a valid last_payment date
      if (!row.last_payment) return false
      return true
    })
    .map(row => ({
      customerId: row.customer_id,
      name: row.name || 'Unknown',
      email: row.email || '',
      netVolume: parseFloat(row.net_volume),
      grossVolume: parseFloat(row.gross_volume),
      paymentCount: parseInt(row.payment_count),
      refundVolume: parseFloat(row.refund_volume),
      createdAt: new Date(row.created),
      firstPayment: new Date(row.first_payment),
      lastPayment: new Date(row.last_payment),
      bucket: getBucket(row.payment_count),
    }))
}