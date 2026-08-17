export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  phone: string
}

export interface OrderItem {
  product: any
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  _id: string
  user: any
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod?: "razorpay" | "demo" | "cod"
  orderStatus?: "placed" | "processing" | "shipped" | "delivered" | "cancelled"
  isDelivered: boolean
  totalAmount: number
  totalPrice?: number
  discountAmount?: number
  couponCode?: string
  paidAt?: string
  deliveredAt?: string
  cancelledAt?: string
  trackingNumber?: string
  carrier?: string
  trackingEvents?: any[]
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  createdAt?: string
  updatedAt?: string
}