import type { Metadata } from 'next'
import { Sidebar } from '@/components/pos/sidebar'
import { TransactionHistory } from '@/components/transactions/transaction-history'
import { SAMPLE_TRANSACTIONS } from '@/lib/transactions-data'

export const metadata: Metadata = {
  title: 'Transaction History · VapeBrianz POS',
  description: 'Review past VapeBrianz sales by date, customer, and payment method.',
}

export default function TransactionsPage() {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar activeHref="/transactions" />
      <TransactionHistory transactions={SAMPLE_TRANSACTIONS} />
    </div>
  )
}
