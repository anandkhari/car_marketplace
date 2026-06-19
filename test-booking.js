// 1. Recreate your exact logic
const NON_BOOKING_KEYWORDS = [
  'tip',
  'subscription creation',
  'payment for invoice',
  'fee',
  'parking',
  'change of service request',
]

function isBookingPayment(payment) {
  if (payment.status !== 'Paid' && payment.status !== 'Refunded') return false
  
  // Notice we use .trim() just in case Stripe added weird spaces
  const desc = (payment.description || '').trim().toLowerCase()
  return !NON_BOOKING_KEYWORDS.some(kw => desc.includes(kw))
}

// 2. Recreate Kristel Warner's exact payments from your Stripe screenshot
const kristelPayments = [
  { amount: 296.15, description: '', status: 'Paid' },
  { amount: 9.99,   description: 'Subscription creation', status: 'Paid' },
  { amount: 401.92, description: 'Panda Black', status: 'Paid' },
  { amount: 258.95, description: 'Panda Revive', status: 'Paid' }
]

// 3. Test them
console.log('--- TESTING KRISTEL WARNER PAYMENTS ---')
let bookingCount = 0

kristelPayments.forEach(p => {
  const isBooking = isBookingPayment(p)
  console.log(`Amount: $${p.amount} | Desc: "${p.description}" | Counts as booking? ${isBooking}`)
  if (isBooking) bookingCount++
})

console.log(`\nFinal Booking Count: ${bookingCount} (Expected: 3)`)