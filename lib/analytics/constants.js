export const BUCKETS = [
  '1 booking',
  '2 bookings', 
  '3 bookings',
  '4 bookings',
  '5+ bookings',
]

export const BUCKET_COLORS = [
  '#185FA5',
  '#378ADD',
  '#639922',
  '#97C459',
  '#D85A30',
]

export function getBucket(paymentCount) {
  const pc = parseInt(paymentCount)
  if (pc === 1) return '1 booking'
  if (pc === 2) return '2 bookings'
  if (pc === 3) return '3 bookings'
  if (pc === 4) return '4 bookings'
  return '5+ bookings'
}