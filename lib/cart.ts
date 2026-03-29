export interface CartItem {
  product_id: string
  name: string
  variety: string
  origin: string
  price: number
  quantity: number
  mode: 'order_now' | 'pre_order'
  image_url: string | null
}

export interface CartState {
  items: CartItem[]
  mode: 'b2b' | 'b2c'
}
