'use client'

import { useEffect, useId, useRef } from 'react'
import { Printer, X } from 'lucide-react'
import { formatIDR } from '@/lib/pos-data'
import { formatDate, type Transaction } from '@/lib/transactions-data'

type ReceiptModalProps = {
  transaction: Transaction
  onClose: () => void
}

function Divider() {
  return <div aria-hidden="true" className="my-4 border-t border-dashed border-border print:border-black/40" />
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground print:text-black/60">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

export function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const itemCount = transaction.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div className="receipt-print-root fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in print:hidden"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <article className="receipt-paper flex min-h-0 flex-col overflow-hidden rounded-t-2xl bg-popover shadow-2xl ring-1 ring-border sm:rounded-t-xl print:rounded-none print:bg-white print:text-black print:shadow-none print:ring-0">
          <div className="min-h-0 overflow-y-auto px-6 pb-6 pt-6">
            <header className="flex flex-col items-center text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground print:text-black/60">
                Receipt
              </p>
              <h2 id={titleId} className="mt-1 text-xl font-semibold tracking-tight">
                Vape<span className="text-primary print:text-black">Brianz</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground print:text-black/60">
                Thank you for shopping with us
              </p>
            </header>

            <Divider />

            <dl className="flex flex-col gap-2 font-mono text-xs">
              <MetaRow label="Order ID" value={transaction.id} />
              <MetaRow
                label="Date & Time"
                value={`${formatDate(transaction.date)}, ${transaction.time}`}
              />
              <MetaRow label="Customer" value={transaction.customerName || 'Walk-in'} />
              <MetaRow label="Payment" value={transaction.method} />
            </dl>

            <Divider />

            {(!transaction.items || transaction.items.length === 0) ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Detail item tidak tersedia.
              </p>
            ) : (
              <table className="w-full font-mono text-xs">
                <caption className="sr-only">Purchased items</caption>
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground print:text-black/60">
                    <th scope="col" className="pb-2 text-left font-medium">Item</th>
                    <th scope="col" className="pb-2 text-center font-medium">Qty</th>
                    <th scope="col" className="pb-2 text-right font-medium">Price</th>
                    <th scope="col" className="pb-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {transaction.items.map((item, idx) => (
                    <tr key={`${item.name}-${idx}`}>
                      <th scope="row" className="py-1.5 pr-2 text-left font-sans text-[13px] font-medium leading-snug">
                        {item.name}
                      </th>
                      <td className="py-1.5 text-center text-muted-foreground print:text-black">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap py-1.5 pl-2 text-right text-muted-foreground print:text-black">
                        {formatIDR(item.unitPrice)}
                      </td>
                      <td className="whitespace-nowrap py-1.5 pl-2 text-right">
                        {formatIDR(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <Divider />

            <dl className="flex flex-col gap-2 font-mono text-xs">
              <MetaRow
                label={`Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
                value={formatIDR(transaction.subtotal)}
              />
              <MetaRow
                label="Discount"
                value={
                  transaction.discount > 0 ? (
                    <span className="text-amber-300 print:text-black">
                      {`- ${formatIDR(transaction.discount)}`}
                    </span>
                  ) : (
                    formatIDR(0)
                  )
                }
              />
            </dl>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3 ring-1 ring-primary/30 print:bg-transparent print:px-0 print:ring-0">
              <span className="text-sm font-semibold">Total Paid</span>
              <span className="font-mono text-lg font-bold text-primary print:text-black">
                {formatIDR(transaction.total)}
              </span>
            </div>

            <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground print:text-black/60">
              {'*** Paid · '}
              {transaction.method}
              {' ***'}
            </p>
          </div>

          <footer className="flex gap-3 border-t border-dashed border-border px-6 pb-7 pt-4 print:hidden">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
            >
              <Printer className="size-4" aria-hidden="true" />
              Print Receipt
            </button>
          </footer>
        </article>
        <div aria-hidden="true" className="receipt-edge h-3 w-full text-popover print:hidden" />
      </div>
    </div>
  )
}
