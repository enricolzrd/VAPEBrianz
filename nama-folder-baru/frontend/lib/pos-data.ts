export const CATEGORIES = ['All', 'Liquid', 'Device', 'Cotton', 'Automizer'] as const
export type Category = (typeof CATEGORIES)[number]
export type ProductCategory = Exclude<Category, 'All'>

export type Product = {
  id: string
  name: string
  category: ProductCategory
  price: number
  stock: number
}

export type CartItem = {
  product: Product
  quantity: number
}

export const PAYMENT_METHODS = ['Cash', 'QRIS', 'Transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'l1', name: 'Foom Icy Mango 30ml Salt', category: 'Liquid', price: 95000, stock: 24 },
  { id: 'l2', name: 'Oat Drips v5 60ml Freebase', category: 'Liquid', price: 150000, stock: 12 },
  { id: 'l3', name: 'Emkay Strawberry Milk 60ml', category: 'Liquid', price: 135000, stock: 8 },
  { id: 'l4', name: 'Salt Nic Grape Ice 30ml', category: 'Liquid', price: 85000, stock: 31 },
  { id: 'l5', name: 'Java Juice Cappuccino 100ml', category: 'Liquid', price: 175000, stock: 5 },
  { id: 'l6', name: 'Hexohm Lychee Tea 30ml', category: 'Liquid', price: 90000, stock: 0 },
  { id: 'd1', name: 'Oxva Xlim Pro 2', category: 'Device', price: 285000, stock: 7 },
  { id: 'd2', name: 'Voopoo Argus P1s', category: 'Device', price: 325000, stock: 4 },
  { id: 'd3', name: 'Geekvape Aegis Legend 3', category: 'Device', price: 890000, stock: 2 },
  { id: 'd4', name: 'Caliburn G3 Pro', category: 'Device', price: 365000, stock: 9 },
  { id: 'd5', name: 'Smok Nord 5 Kit', category: 'Device', price: 450000, stock: 3 },
  { id: 'c1', name: 'Cotton Bacon Prime', category: 'Cotton', price: 45000, stock: 40 },
  { id: 'c2', name: 'Muji Organic Cotton Pad', category: 'Cotton', price: 35000, stock: 18 },
  { id: 'c3', name: 'Kendo Vape Cotton Gold', category: 'Cotton', price: 55000, stock: 11 },
  { id: 'a1', name: 'Dead Rabbit V3 RDA', category: 'Automizer', price: 420000, stock: 3 },
  { id: 'a2', name: 'Zeus X Mesh RTA', category: 'Automizer', price: 480000, stock: 5 },
  { id: 'a3', name: 'Drop Dead RDA 24mm', category: 'Automizer', price: 275000, stock: 6 },
  { id: 'a4', name: 'Oxva Unipro Coil 0.3Ω', category: 'Automizer', price: 38000, stock: 50 },
]

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatIDR(value: number) {
  return idrFormatter.format(value)
}
