import { Banknote, Landmark, QrCode, ReceiptText, type LucideIcon } from 'lucide-react'
import { formatIDR, type PaymentMethod } from '@/lib/pos-data'
import { formatDate, type Transaction } from '@/lib/transactions-data'
import { cn } from '@/lib/utils'

const METHOD_STYLES: Record<PaymentMethod, { icon: LucideIcon; className: string }> = {
  Cash: { icon: Banknote, className: 'border-primary/30 bg-primary/10 text-primary' },
  QRIS: { icon: QrCode, className: 'border-sky-400/30 bg-sky-400/10 text-sky-300' },
  Transfer: { icon: Landmark, className: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const { icon: Icon, className } = METHOD_STYLES[method]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {method}
    </span>
  )
}

type TransactionsTableProps = {
  transactions: Transaction[]
  totalFiltered: number
  onSelect: (transaction: Transaction) => void
}

export function TransactionsTable({ transactions, totalFiltered, onSelect }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <ReceiptText className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">No transactions found</p>
        <p className="text-sm text-muted-foreground">Try a different date range.</p>
      </div>
    )
  }

  // Grand total hanya untuk halaman ini (per page)
  const grandTotal = transactions.reduce((sum, t) => sum + t.total, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Transaction history</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Order ID
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Customer Name
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Total Amount
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr
                key={t.id}
                tabIndex={0}
                aria-label={`View receipt for order ${t.id}`}
                onClick={() => onSelect(t)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(t)
                  }
                }}
                className="group cursor-pointer transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <td className="relative whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                  <span className="transition-colors group-hover:text-primary">{t.id}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span>{formatDate(t.date)}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{t.time}</span>
                </td>
                <td className="px-4 py-3">
                  {t.customerName || <span className="text-muted-foreground">Walk-in</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-medium">
                  {formatIDR(t.total)}
                </td>
                <td className="px-4 py-3">
                  <MethodBadge method={t.method} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-secondary/40">
              <th scope="row" colSpan={3} className="px-4 py-3 text-left font-medium text-muted-foreground">
                {transactions.length} of {totalFiltered} transaction{totalFiltered > 1 ? 's' : ''}
              </th>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-semibold text-primary">
                {formatIDR(grandTotal)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
