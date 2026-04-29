export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverUrl: string;
  description: string;
  category: string;
  rating: number;
  pages?: number;
  year?: string;
  isArchived?: boolean;
}

export interface CartItem extends Book {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentType: string;
  totalAmount: number;
  items: CartItem[];
  status: 'new' | 'accepted' | 'completed' | 'cancelled';
  date: string;
}
