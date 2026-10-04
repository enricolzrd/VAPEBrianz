'use client'

import { useMemo, useState } from 'react'
import { formatIDR } from '@/lib/pos-data'
import { SAMPLE_TODAY, shiftDate, type Transaction } from '@/lib/transactions-data'
import { DateFilter, type DatePreset } from './date-filter'
import { ReceiptModal } from './receipt-modal'
import { TransactionsTable } from './transactions-table'

function rangeForPreset(preset: Exclude<DatePreset, 'custom'>) {
  switch (preset) {
    case 'today':
      return { from: SAMPLE_TODAY, to: SAMPLE_TODAY }
    case '7d':
      return { from: shiftDate(SAMPLE_TODAY, -6), to: SAMPLE_TODAY }
    case '30d':
      return { from: shiftDate(SAMPLE_TODAY, -29), to: SAMPLE_TODAY }
    case 'all':
      return { from: '', to: '' }
  }
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  const [preset, setPreset] = useState<DatePreset>('7d')
  const [range, setRange] = useState(() => rangeForPreset('7d'))
  const [selected, setSelected] = useState<Transaction | null>(null)

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => (!range.from || t.date >= range.from) && (!range.to || t.date <= range.to),
      ),
    [transactions, range],
  )

  const revenue = filtered.reduce((sum, t) => sum + t.total, 0)
  const average = filtered.length ? Math.round(revenue / filtered.length) : 0

  function handlePresetChange(next: Exclude<DatePreset, 'custom'>) {
    setPreset(next)
    setRange(rangeForPreset(next))
  }

  function handleRangeChange(next: { from: string; to: string }) {
    setPreset('custom')
    setRange(next)
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
              <dd
                className={
                  stat.highlight
                    ? 'mt-1 font-mono text-xl font-semibold text-primary'
                    : 'mt-1 font-mono text-xl font-semibold'
                }
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <TransactionsTable transactions={filtered} onSelect={setSelected} />
      </div>

      {selected && (
        <ReceiptModal transaction={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}
