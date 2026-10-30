'use client'

import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DatePreset = 'today' | '7d' | '30d' | 'all' | 'custom'

const PRESETS: { value: Exclude<DatePreset, 'custom'>; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

type DateFilterProps = {
  preset: DatePreset
  from: string
  to: string
  onPresetChange: (preset: Exclude<DatePreset, 'custom'>) => void
  onRangeChange: (range: { from: string; to: string }) => void
}

export function DateFilter({ preset, from, to, onPresetChange, onRangeChange }: DateFilterProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label="Quick date ranges" className="flex flex-wrap gap-2">
        {PRESETS.map((item) => {
          const isActive = preset === item.value
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onPresetChange(item.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
        <label className="sr-only" htmlFor="date-from">
          From date
        </label>
        <input
          id="date-from"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onRangeChange({ from: e.target.value, to })}
          className="h-9 rounded-lg border border-border bg-secondary px-3 font-mono text-sm text-foreground [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <label className="sr-only" htmlFor="date-to">
          To date
        </label>
        <input
          id="date-to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onRangeChange({ from, to: e.target.value })}
          className="h-9 rounded-lg border border-border bg-secondary px-3 font-mono text-sm text-foreground [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  )
}
