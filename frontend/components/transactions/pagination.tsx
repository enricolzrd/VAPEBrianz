'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalItems)

  // Buat array nomor halaman dengan ellipsis
  function getPageNumbers(): (number | 'ellipsis')[] {
    const delta = 1 // jumlah halaman di kiri/kanan halaman aktif
    const pages: (number | 'ellipsis')[] = []

    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

    pages.push(1)

    if (rangeStart > 2) pages.push('ellipsis')

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (rangeEnd < totalPages - 1) pages.push('ellipsis')

    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Info */}
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{' '}
        of{' '}
        <span className="font-medium text-foreground">{totalItems}</span>{' '}
        transactions
      </p>

      {/* Navigasi */}
      <nav aria-label="Pagination" className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={cn(
            'flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-sm font-medium transition-colors',
            currentPage === 1
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-secondary hover:text-foreground',
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Nomor halaman */}
        {pageNumbers.map((page, idx) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors',
                page === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-secondary hover:text-foreground',
              )}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={cn(
            'flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-sm font-medium transition-colors',
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-secondary hover:text-foreground',
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
