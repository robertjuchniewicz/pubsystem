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
  tableNumber: string;
  items: CartItem[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  pubStatus: 'pending' | 'ready' | 'delivered';
  pizzeriaStatus: 'pending' | 'ready' | 'delivered';
  deliveredAt?: string;
}

export interface OrderHistory {
  id: string;
  tableNumber: string;
  items: CartItem[];
  status: 'completed' | 'cancelled';
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
} 