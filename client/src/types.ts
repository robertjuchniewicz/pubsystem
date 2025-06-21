export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: 'pub' | 'pizzeria';
  description: string;
  available: boolean;
}

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  category: 'pub' | 'pizzeria';
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface OrderResponse {
  success: boolean;
  orderId: string;
  message: string;
} 