import { INITIAL_PRODUCTS, PAYMENT_METHODS, type PaymentMethod } from './pos-data'

export type TransactionItem = {
  name: string
  quantity: number
  unitPrice: number
}

export type Transaction = {
  id: string
  date: string
  time: string
  customerName: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  total: number
  method: PaymentMethod
}

export const SAMPLE_TODAY = '2026-09-28'

const CUSTOMERS = [
  'Andi Pratama',
  'Budi Santoso',
  '',
  'Rizky Aditya',
  'Dewi Lestari',
  '',
  'Fajar Nugroho',
  'Siti Rahma',
  'Kevin Wijaya',
  '',
  'Yoga Saputra',
  'Putri Ayu',
]

function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function shiftDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function generateItems(random: () => number): TransactionItem[] {
  const count = 1 + Math.floor(random() * 4)
  const picked = new Map<string, TransactionItem>()

  for (let i = 0; i < count; i++) {
    const product = INITIAL_PRODUCTS[Math.floor(random() * INITIAL_PRODUCTS.length)]
    const quantity = product.price > 250000 ? 1 : 1 + Math.floor(random() * 3)
    const existing = picked.get(product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      picked.set(product.id, { name: product.name, quantity, unitPrice: product.price })
    }
  }

  return [...picked.values()]
}

function generateTransactions(): Transaction[] {
  const random = createRandom(2026)
  const transactions: Transaction[] = []

  for (let offset = 0; offset < 45; offset++) {
    const date = shiftDate(SAMPLE_TODAY, -offset)
    const ordersToday = 1 + Math.floor(random() * 4)
    const compactDate = date.replaceAll('-', '').slice(2)

    const times = Array.from({ length: ordersToday }, () => {
      const hour = 10 + Math.floor(random() * 12)
      const minute = Math.floor(random() * 60)
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    }).sort()

    times.forEach((time, index) => {
      const items = generateItems(random)
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      const discount =
        random() < 0.35 ? Math.max(1, Math.floor((subtotal * 0.1 * random()) / 5000)) * 5000 : 0

      transactions.push({
        id: `VB-${compactDate}-${String(index + 1).padStart(3, '0')}`,
        date,
        time,
        customerName: CUSTOMERS[Math.floor(random() * CUSTOMERS.length)],
        items,
        subtotal,
        discount,
        total: subtotal - discount,
        method: PAYMENT_METHODS[Math.floor(random() * PAYMENT_METHODS.length)],
      })
    })
  }

  return transactions.sort((a, b) =>
    `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
  )
}

export const SAMPLE_TRANSACTIONS = generateTransactions()

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDate(isoDate: string) {
  if (!isoDate) return "-"; // Mencegah crash fatal
  return dateFormatter.format(new Date(isoDate))
}
