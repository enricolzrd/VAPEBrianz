'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatIDR } from '@/lib/pos-data'
import { type Transaction } from '@/lib/transactions-data'
import { DateFilter, type DatePreset } from './date-filter'
import { Pagination } from './pagination'
import { ReceiptModal } from './receipt-modal'
import { TransactionsTable } from './transactions-table'

const PAGE_SIZE = 10

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function shiftDay(isoDate: string, days: number) {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function rangeForPreset(preset: Exclude<DatePreset, 'custom'>) {
  const today = todayISO()
  switch (preset) {
    case 'today': return { from: today, to: today }
    case '7d':    return { from: shiftDay(today, -6), to: today }
    case '30d':   return { from: shiftDay(today, -29), to: today }
    case 'all':   return { from: '', to: '' }
  }
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [preset, setPreset] = useState<DatePreset>('7d')
  const [range, setRange] = useState(() => rangeForPreset('7d'))
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchTransactions() {
      const token = localStorage.getItem('vb_token')
      try {
        const response = await fetch('http://127.0.0.1:8000/api/transactions', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const result = await response.json()

        const mappedData = (result.data ?? []).map((trx: any) => ({
          ...trx,
          id:           trx.invoice_number ?? String(trx.id),
          date:         trx.created_at ? trx.created_at.slice(0, 10) : '',
          time:         trx.created_at ? trx.created_at.slice(11, 16) : '',
          total:        Number(trx.total_amount),
          subtotal:     Number(trx.subtotal),
          discount:     Number(trx.discount_amount),
          method:       trx.payment_method,
          customerName: trx.customer_name ?? '',
          items:        [],
        }))

        setTransactions(mappedData)
      } catch (error) {
        console.error('Gagal menarik data transaksi:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  // Filter berdasarkan tanggal
  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => (!range.from || t.date >= range.from) && (!range.to || t.date <= range.to),
      ),
    [transactions, range],
  )

  // Hitung total halaman
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Data untuk halaman saat ini
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  // Stats dihitung dari seluruh filtered (bukan hanya halaman saat ini)
  const revenue = filtered.reduce((sum, t) => sum + t.total, 0)
  const average = filtered.length ? Math.round(revenue / filtered.length) : 0

  function handlePresetChange(next: Exclude<DatePreset, 'custom'>) {
    setPreset(next)
    setRange(rangeForPreset(next))
    setCurrentPage(1) // reset ke halaman 1 saat filter berubah
  }

  function handleRangeChange(next: { from: string; to: string }) {
    setPreset('custom')
    setRange(next)
    setCurrentPage(1) // reset ke halaman 1 saat filter berubah
  }

  const stats = [
    { label: 'Transactions', value: filtered.length.toLocaleString('id-ID') },
    { label: 'Revenue', value: formatIDR(revenue), highlight: true },
    { label: 'Avg. order', value: formatIDR(average) },
  ]

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex min-h-[73px] flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-4 md:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Transaction History</h1>
          <p className="text-sm text-muted-foreground">Review completed sales at VapeBrianz</p>
        </div>
      </header>

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <DateFilter
          preset={preset}
          from={range.from}
          to={range.to}
          onPresetChange={handlePresetChange}
          onRangeChange={handleRangeChange}
        />

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-3">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
              <dd className={stat.highlight
                ? 'mt-1 font-mono text-xl font-semibold text-primary'
                : 'mt-1 font-mono text-xl font-semibold'
              }>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Memuat data transaksi...
          </div>
        ) : (
          <>
            <TransactionsTable
              transactions={paginatedData}
              totalFiltered={filtered.length}
              onSelect={setSelected}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {selected && (
        <ReceiptModal transaction={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}
