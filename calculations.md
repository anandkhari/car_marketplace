### SECTION 1 — WHO COUNTS AS A REAL CUSTOMER

Two groups of customers are included:

**GROUP A — Matched customers**
```
Customer ID exists in BOTH payments sheet AND customers sheet.
Included if: Total Spend > 0 (from customers CSV)
Has full data: name, email, city, dispute losses, lifetime totals.
isUnidentified: false
```

**GROUP B — Unmatched customers**
```
Customer ID exists ONLY in payments sheet.
NOT found in customers sheet.
Included if: gross booking payments > 0
Has partial data only:
  name: "Unidentified Customer"
  email: ""
  city: ""
  disputeLosses: 0 (unknown)
  lifetimeSpend: approximated from payment gross
isUnidentified: true
Count: ~728 customers
Revenue: ~$193,557
```

**What counts as a booking payment**
```
Status == 'Paid' OR 'Refunded'
AND description does NOT contain (case insensitive):
  tip, subscription creation, payment for invoice,
  fee, parking, change of service request
Empty description → treated as booking
```

**Previous inclusion rule (removed)**
```
Net Spend = Total Spend - Refunded - Disputes
Include only if Net Spend > 0
This was too aggressive — excluded customers who represent
real revenue even if later partially refunded.
```

---

### SECTION 2 — ADJUSTED BOOKING COUNT

**Why adjust?**
Payment Count from Stripe counts every charge made. Some were fully refunded or
disputed — the business kept nothing. The adjusted count removes those to reflect
real retained bookings.

**Constants**
```
MIN_PKG_PRICE = $50   — minimum package price (configurable)
AVG_PKG_PRICE = $225  — average package price (configurable)
```

**The client's exact formula**
```
Adjusted Bookings = MAX(
  0,
  ROUND(
    Payment Count - (Refunded Volume + Dispute Losses) / AVG_PKG_PRICE
  )
)
```
Small refunds round away naturally — no hard threshold logic needed.
The $112.50 tipping point (50% of $225) determines whether a refund costs a booking.

**Examples**
```
PC=1, Refund=$25    → 1 - (25/225)  = 0.89 → ROUND=1 → 1 booking  (small tip, ignored)
PC=1, Refund=$225   → 1 - (225/225) = 0    → ROUND=0 → 0 bookings (full reversal)
PC=1, Refund=$125   → 1 - (125/225) = 0.44 → ROUND=0 → 0 bookings (over half refunded)
PC=1, Refund=$100   → 1 - (100/225) = 0.56 → ROUND=1 → 1 booking  (under half refunded)
PC=3, Refund=$450   → 3 - (450/225) = 1    → ROUND=1 → 1 booking
PC=2, R=$100 D=$100 → 2 - (200/225) = 1.11 → ROUND=1 → 1 booking
```

**Data source by customer type**
```
Matched customers (in both sheets):
  paymentCount    → from customers CSV (lifetime total, most accurate)
  refundedVolume  → from customers CSV (lifetime total)
  disputeLosses   → from customers CSV

Unmatched customers (payments sheet only):
  paymentCount    → count of booking payments in payments sheet
  refundedVolume  → sum of Amount Refunded in payments sheet
  disputeLosses   → 0 (data not available)
```

**What happens to adjusted = 0 customers**
```
Included in:  total customer count, gross revenue, refund losses,
              dispute losses, net revenue, refund rate, booking outcomes
Excluded from: frequency buckets, LTV donut, avg/percentile chart,
               scatter plot, repeat rate calculation
```

---

### SECTION 3 — BOOKING FREQUENCY BUCKETS

**How buckets are assigned**
```
Source: adjusted bookingCount per customer

adjusted == 0  → null  (health metrics only, excluded from frequency charts)
adjusted == 1  → "1 booking"
adjusted == 2  → "2 bookings"
adjusted == 3  → "3 bookings"
adjusted == 4  → "4 bookings"
adjusted >= 5  → "5+ bookings"
```

**Null-bucket customers**
Customers whose adjusted count rounds to 0 receive `bucket = null`.
They are kept in the joined array and count toward health KPIs (gross, refunds, net)
but are excluded from all frequency-based charts and the repeat rate calculation.

---

### SECTION 4 — BOOKING METRICS KPIs

**Total Customers**
```
Source: joined dataset after all exclusions (including null-bucket customers)
Formula: count of valid joined records
```

**Total LTV**
```
Source: net field per customer (gross - refunded from booking payments)
Formula: sum of all customer net values
```
Note: does not subtract dispute losses from net (dispute losses tracked separately in health section).

**Avg LTV**
```
Formula: Total LTV / Total Customers
```

**P50 LTV (Median)**
```
Formula:
1. Sort all customer LTV values low to high
2. Find the middle value
3. If even count, interpolate between the two middle values
```
More honest than the average — not pulled up by a few high spenders.
The slider moves this to any percentile (P1–P99).

**Repeat Rate**
```
Formula:
customers with bookingCount >= threshold
divided by total customers x 100
Default threshold = 2
```
Uses adjusted booking count — a customer with rawBookingCount=2 but adjustedBookingCount=1
is counted as a 1-booking customer.

---

### SECTION 5 — BUSINESS HEALTH KPIs

**Gross Revenue**
```
Source: gross field per customer (sum of all booking payment amounts)
Formula: sum of customer.gross across all valid customers
```

**Refund Losses**
```
Source: refunded field per customer
Formula: sum of customer.refunded
```

**Dispute Losses**
```
Source: Dispute Losses column from customers CSV
Formula: sum of customer.disputeLosses
```

**Net Revenue**
```
Formula: Gross Revenue - Refund Losses - Dispute Losses
```

**Refund Rate**
```
Formula: (Refund Losses + Dispute Losses) / Gross Revenue x 100
```

---

### SECTION 6 — BOOKING OUTCOMES

**How a booking is identified**
```
Source: payments CSV
A payment is a booking if:
  Status == Paid OR Refunded
  AND description does NOT contain:
    tip, subscription creation,
    payment for invoice, fee,
    parking, change of service request
```

**Full Profit Booking**
```
Formula: Amount Refunded == 0
```

**Partial Refund Booking**
```
Formula: Amount Refunded > 0
         AND (Amount - Amount Refunded) > 0
```

**Full Refund Booking**
```
Formula: (Amount - Amount Refunded) == 0
```

**Dispute Loss**
```
Source: Dispute Losses column in customers CSV
Formula: customers where disputeLosses > 0
```

---

### SECTION 7 — BUCKET CHARTS

**Bar Chart — Customer count per bucket**
```
Source: bucketStats computed from viewCustomers (null-bucket customers excluded)
X axis: bucket name
Y axis: count of customers in that bucket
```

**Donut Chart — LTV share per bucket**
```
Formula per slice:
  bucket.totalLTV / grandTotalLTV x 100
```

**Avg vs Percentile Chart**
```
For each bucket:
  Dark bar  = avg LTV = sum(ltvs) / count
  Light bar = P{slider} LTV = percentile value
```

---

### SECTION 8 — DATE RANGE FILTER

**How the filter works**
```
Step 1: Find the latest payment date in the payments CSV

Step 2: Apply selected range
        Relative (e.g. Last 90 days): cutoff = latest - N days
        Year-based: start = Jan 1 of year, end = Dec 31
        Custom: explicit start and end dates

Step 3: Include only customers whose lastPayment >= start (and <= end)

Why anchored to dataset not today:
  The CSV could be from any point in time.
  Anchoring to today would show wrong results for historical data.
```

**Available filter modes**
```
Relative:  Last 30 / 90 / 180 days, Last 12 months, All time
By Year:   Current year, Last year, any year in the dataset
Custom:    Explicit date range via date picker
```

---

### SECTION 9 — SUBSCRIBER DETECTION

**How subscribers are identified**
```
Source: payments CSV
Rule: Customer ID appears in at least one payment where:
        Description == 'Subscription creation'
        AND Status == 'Paid'
```
These are customers on the monthly membership plan.
The subscriber toggle filters all charts and KPIs to show only this group,
only non-subscribers, or all customers combined.

---

### SECTION 10 — DATA FLOW SUMMARY

```
1. Admin uploads 4 CSV files (Canada payments + customers, US payments + customers)

2. Browser reads payments CSV
   -> removes non-bookings (tips, fees, subscriptions, etc.)
   -> identifies subscribers
   -> classifies each payment as full profit / partial refund / full refund
   -> groups booking payments by customer ID

3. Browser reads customers CSV
   -> gets identity (name, email, city)
   -> gets lifetime totals (totalSpend, paymentCount, disputeLosses)
   -> filters: must have customer_id and last_payment

4. Two files are joined on Customer ID
   -> one record per customer combining period booking data + lifetime identity
   -> excludes customers with no gross booking revenue (g.gross <= 0)
   -> computes adjusted booking count (removes refunded/disputed bookings)
   -> assigns bucket based on adjusted count (null if 0)

5. Result saved to Supabase
   -> team can open dashboard without uploading

6. Admin previews at /admin/preview, clicks Publish & Get Link
   -> snapshot stored in published_snapshots table with unique slug

7. Team opens /view/[slug]
   -> reads snapshot from Supabase, no admin UI

8. Dashboard applies date range filter
   -> keeps only customers active in selected period

9. Subscriber toggle applies
   -> further filters to sub / non-sub / all

10. All KPIs, charts, tables computed from the filtered customer list

11. Sliders update percentile and repeat rate threshold dynamically
    without re-fetching any data
```

---

### Pending — Client Decision Required

**Issue:** 728 customers exist in the payments sheet but are missing from the customers sheet.
Their combined revenue of **$193,557** is currently not showing on the dashboard.

**Options:**

**Option A — Include them with partial data**
```
Show these customers in the dashboard
They will have booking data and revenue
But no name, email, city, or dispute info
```

**Option B — Exclude them (current behavior)**
```
Only show customers matched on both sheets
Acknowledge the $193,557 gap
```

**Option C — Investigate why they are missing**
```
Re-export customers CSV from Stripe with a wider date range
Most complete solution — likely a CSV date range mismatch
```
