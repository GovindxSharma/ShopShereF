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
    product: string
    name: string
    price: number
    image: string
    quantity: number
  }
  
  export interface Order {
    _id: string
    user: string
    items: OrderItem[]
    shippingAddress: ShippingAddress
    paymentStatus: "pending" | "paid" | "failed"
    isDelivered: boolean
    totalAmount: number
    paidAt?: string
    deliveredAt?: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
    createdAt?: string
    updatedAt?: string
  }
  