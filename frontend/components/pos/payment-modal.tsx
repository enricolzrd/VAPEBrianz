'use client'

import { useEffect, useEffectEvent, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRightLeft, Banknote, QrCode, X } from 'lucide-react'
import { PAYMENT_METHODS, formatIDR, type PaymentMethod } from '@/lib/pos-data'
import { cn } from '@/lib/utils'

const METHOD_ICONS: Record<PaymentMethod, typeof Banknote> = {
  Cash: Banknote,
  QRIS: QrCode,
  Transfer: ArrowRightLeft,
}

type PaymentModalProps = {
  total: number
  itemCount: number
  cartItems: { product_id: number; quantity: number }[]
  onClose: () => void
  onConfirm: () => void
}

export function PaymentModal({
  total,
  itemCount,
  cartItems,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [discountInput, setDiscountInput] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  const discount = Math.min(Number(discountInput || 0), total)
  const grandTotal = total - discount

  const handleEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  })

  useEffect(() => {
    nameRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const token = localStorage.getItem('vb_token')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          discount_amount: discount,
          payment_method: method,
          cart_items: cartItems,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Sukses! Invoice: ${result.invoice_number}`)
        onConfirm()
      } else {
        const errorData = await response.json()
        alert(`Gagal: ${errorData.detail ?? 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error jaringan', error)
      alert('Gagal me-proses pembayaran. Periksa koneksi jaringan Anda.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-t-2xl border border-border bg-popover shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:rounded-2xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              Payment
            </h2>
            <p className="text-xs text-muted-foreground">
              {itemCount} item{itemCount > 1 ? 's' : ''} · Subtotal {formatIDR(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="customer-name" className="text-sm font-medium">
              Customer Name <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              ref={nameRef}
              id="customer-name"
              type="text"
              autoComplete="off"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in customer"
              maxLength={60}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="discount" className="text-sm font-medium">
              Discount Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <input
                id="discount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={discountInput ? Number(discountInput).toLocaleString('id-ID') : ''}
                onChange={(e) => setDiscountInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="0"
                aria-describedby="discount-hint"
                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 font-mono text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <p id="discount-hint" className="text-xs text-muted-foreground">
              {Number(discountInput || 0) > total
                ? 'Discount capped at the subtotal.'
                : 'Nominal in Rupiah, not percentage.'}
            </p>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Payment Method</legend>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = METHOD_ICONS[m]
                const active = m === method
                return (
                  <label
                    key={m}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40',
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={m}
                      checked={active}
                      onChange={() => setMethod(m)}
                      className="sr-only"
                    />
                    <Icon className="size-5" aria-hidden="true" />
                    {m}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <dl className="flex flex-col gap-1.5 rounded-xl bg-background p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="font-mono">{formatIDR(total)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Discount</dt>
              <dd className="font-mono">{discount > 0 ? `- ${formatIDR(discount)}` : formatIDR(0)}</dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2.5">
              <dt className="font-medium">Grand Total</dt>
              <dd className="font-mono text-xl font-bold text-primary">{formatIDR(grandTotal)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-xl bg-primary text-sm font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}