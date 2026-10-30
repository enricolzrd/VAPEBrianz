import type { Metadata } from 'next'
import { Sidebar } from '@/components/pos/sidebar'
import { MasterData } from '@/components/master-data/master-data'

export const metadata: Metadata = {
  title: 'Master Data · VapeBrianz POS',
  description: 'Manage VapeBrianz products, pricing, stock, and categories.',
}

export default function MasterDataPage() {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar activeHref="/master-data" />
      <MasterData />
    </div>
  )
}
