export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'pizzeria' | 'pub-essen' | 'pub-trinken';
  mealType: string; // np. 'Suppen', 'Salate', 'Pizza'
  available: boolean;
  isDrink?: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  category: 'pizzeria' | 'pub-essen' | 'pub-trinken';
  status: 'pending' | 'delivered';
}

export interface Order {
  id: string;
  orderNumber?: number;
  tableNumber: number;
  items: OrderItem[];
  createdAt: string;
  completed: boolean;
  pubStatus: 'pending' | 'ready' | 'delivered';
  pizzeriaStatus: 'pending' | 'ready' | 'delivered';
  status: 'pending' | 'completed' | 'canceled';
  deliveredAt?: string;
  canceledAt?: string;
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

export interface Settings {
  maxTables: number;
  pizzeriaMenuEnabled: boolean;
  pubEssenEnabled: boolean;
  pubTrinkenEnabled: boolean;
  pubClosed: boolean;
  logo?: string;
  background?: string;
}