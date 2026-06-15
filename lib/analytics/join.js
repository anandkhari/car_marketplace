import { NON_BOOKING_KEYWORDS, getBucket, MIN_PKG_PRICE, AVG_PKG_PRICE } from './constants'
import { computeAdjustedBookingCount } from './metrics'

function isBookingPayment(payment) {
  if (payment.status !== 'Paid' && payment.status !== 'Refunded') return false
  const desc = (payment.description || '').toLowerCase()
  return !NON_BOOKING_KEYWORDS.some(kw => desc.includes(kw))
}

export function joinPaymentsAndCustomers(payments, customers) {
  // STEP 1 — find subscriber customer IDs
  const subscriberIds = new Set(
    payments
      .filter(p =>
        p.status === 'Paid' &&
        p.description.trim().toLowerCase() === 'subscription creation'
      )
      .map(p => p.customerId)
  )

  // STEP 2 — build customer lookup
  const customerMap = {}
  for (const c of customers) {
    customerMap[c.id] = c
  }

  // STEP 3 — group booking payments by customerId
  const groups = {}
  for (const payment of payments) {
    if (!isBookingPayment(payment)) continue
    const cid = payment.customerId
    if (!cid) continue

    if (!groups[cid]) {
      groups[cid] = {
        bookingCount: 0,
        gross: 0,
        refunded: 0,
        // outcome counts
        fullProfit: 0,
        partialRefund: 0,
        fullRefund: 0,
        // outcome amounts (for bookingOutcomes.js)
        fullProfitGross: 0,
        partialRefundGross: 0,
        partialRefundRefunded: 0,
        fullRefundGross: 0,
        firstPayment: payment.createdAt,
        lastPayment: payment.createdAt,
      }
    }

    const g = groups[cid]
    g.bookingCount++
    g.gross += payment.amount
    g.refunded += payment.amountRefunded
    if (payment.createdAt < g.firstPayment) g.firstPayment = payment.createdAt
    if (payment.createdAt > g.lastPayment) g.lastPayment = payment.createdAt

    if (payment.amountRefunded === 0) {
      g.fullProfit++
      g.fullProfitGross += payment.amount
    } else if (payment.amount - payment.amountRefunded > 0) {
      g.partialRefund++
      g.partialRefundGross += payment.amount
      g.partialRefundRefunded += payment.amountRefunded
    } else {
      g.fullRefund++
      g.fullRefundGross += payment.amount
    }
  }

  // STEP 4 — main join: matched customers (exist in both sheets)
  const joined = []
  let matchedCount = 0

  for (const [customerId, g] of Object.entries(groups)) {
    const customer = customerMap[customerId]
    if (!customer) continue

    const net = g.gross - g.refunded
    if (g.gross <= 0) continue

    // Use customers-sheet lifetime totals — more accurate than summing payments
    const adjustedBookingCount = computeAdjustedBookingCount(
      customer.paymentCount,
      customer.refundedVolume,
      customer.disputeLosses || 0,
      MIN_PKG_PRICE,
      AVG_PKG_PRICE,
    )

    joined.push({
      id: customerId,
      name: customer.name,
      email: customer.email,
      city: customer.city,
      country: customer.country,
      isSubscriber: subscriberIds.has(customerId),
      isUnidentified: false,
      firebaseUid: customer.firebaseUid,
      // period booking metrics
      bookingCount: adjustedBookingCount,
      rawBookingCount: customer.paymentCount,
      gross: g.gross,
      refunded: g.refunded,
      net,
      fullProfit: g.fullProfit,
      fullProfitGross: g.fullProfitGross,
      partialRefund: g.partialRefund,
      partialRefundGross: g.partialRefundGross,
      partialRefundRefunded: g.partialRefundRefunded,
      fullRefund: g.fullRefund,
      fullRefundGross: g.fullRefundGross,
      firstPayment: g.firstPayment,
      lastPayment: g.lastPayment,
      // lifetime metrics from customers CSV
      lifetimeSpend: customer.totalSpend,
      lifetimePayments: customer.paymentCount,
      lifetimeRefunds: customer.refundedVolume,
      disputeLosses: customer.disputeLosses,
      // derived
      bucket: getBucket(adjustedBookingCount),
      netVolume: net,
      paymentCount: adjustedBookingCount,
    })
    matchedCount++
  }

  // STEP 5 — unmatched customers (payments sheet only, no customers sheet row)
  let unmatchedCount = 0
  let unmatchedRevenue = 0

  for (const [customerId, g] of Object.entries(groups)) {
    if (customerMap[customerId]) continue  // already handled in STEP 4
    if (g.gross <= 0) continue             // no gross, nothing to show

    const net = g.gross - g.refunded

    // No dispute data available for unmatched — use 0
    const adjustedUnmatched = computeAdjustedBookingCount(
      g.bookingCount,
      g.refunded,
      0,
      MIN_PKG_PRICE,
      AVG_PKG_PRICE,
    )

    joined.push({
      id: customerId,
      name: 'Unidentified Customer',
      email: '',
      city: '',
      country: '',
      isSubscriber: subscriberIds.has(customerId),
      isUnidentified: true,
      firebaseUid: '',
      // period booking metrics
      bookingCount: adjustedUnmatched,
      rawBookingCount: g.bookingCount,
      gross: g.gross,
      refunded: g.refunded,
      net,
      fullProfit: g.fullProfit,
      fullProfitGross: g.fullProfitGross,
      partialRefund: g.partialRefund,
      partialRefundGross: g.partialRefundGross,
      partialRefundRefunded: g.partialRefundRefunded,
      fullRefund: g.fullRefund,
      fullRefundGross: g.fullRefundGross,
      firstPayment: g.firstPayment,
      lastPayment: g.lastPayment,
      // lifetime metrics: not available, approximate from payment data
      lifetimeSpend: g.gross,
      lifetimePayments: g.bookingCount,
      lifetimeRefunds: g.refunded,
      disputeLosses: 0,
      bucket: getBucket(adjustedUnmatched),
      netVolume: net,
      paymentCount: adjustedUnmatched,
    })
    unmatchedCount++
    unmatchedRevenue += g.gross
  }

  console.log('Matched customers:', matchedCount)
  console.log('Unmatched customers:', unmatchedCount)
  console.log('Total customers:', joined.length)
  console.log('Unmatched revenue:', '$' + Math.round(unmatchedRevenue).toLocaleString())

  return joined
}

export function prepareSavePayload(joinedCustomers, subscriberIds, payments, customers) {
  const latestPayment = payments.reduce((latest, p) => {
    const d = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)
    return d > latest ? d : latest
  }, new Date(0))

  return {
    joined_customers: joinedCustomers,
    subscriber_ids: Array.from(subscriberIds),
    payments_count: payments.length,
    customers_count: customers.length,
    latest_payment_date: latestPayment.toISOString(),
  }
}
