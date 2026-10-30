import { CATEGORIES, INITIAL_PRODUCTS } from './pos-data'

export type MasterCategory = {
  id: string
  name: string
}

export type MasterProduct = {
  id: string
  name: string
  categoryId: string
  price: number
  stock: number
}

export type ProductInput = Omit<MasterProduct, 'id'>

export const INITIAL_MASTER_CATEGORIES: MasterCategory[] = CATEGORIES.filter(
  (name) => name !== 'All',
).map((name) => ({ id: `cat-${name.toLowerCase()}`, name }))

export const INITIAL_MASTER_PRODUCTS: MasterProduct[] = INITIAL_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  categoryId: `cat-${p.category.toLowerCase()}`,
  price: p.price,
  stock: p.stock,
}))

export const LOW_STOCK_THRESHOLD = 5
