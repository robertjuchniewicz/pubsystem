import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Order } from '../types';

interface StaffPanelProps {
  category: 'pub' | 'pizzeria';
}

const StaffPanel: React.FC<StaffPanelProps> = ({ category }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders?category=${category}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Fehler beim Laden der Bestellungen:', error);
    }
  }, [category]);

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [category, fetchOrders]);

  useEffect(() => {
    // Check for new orders and play sound if enabled
    if (soundEnabled && orders.length > lastOrderCount && lastOrderCount > 0) {
      audioRef.current?.play().catch(console.error);
    }
    setLastOrderCount(orders.length);
  }, [orders, soundEnabled, lastOrderCount]);

  const updateOrderStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      // Remove completed/cancelled orders from the list
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Bestellung:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Fehler beim Löschen der Bestellung:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryTitle = () => {
    return category === 'pub' ? 'PUB Bestellungen' : 'Pizzeria Bestellungen';
  };

  const getCategoryColor = () => {
    return category === 'pub' ? 'pub' : 'pizzeria';
  };

  return (
    <div className="staff-panel">
      <div className={`staff-header ${getCategoryColor()}`}>
        <h1>{getCategoryTitle()}</h1>
        <div 
          className="sound-toggle"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          <span>🔊</span>
          <span>{soundEnabled ? 'Ton an' : 'Ton aus'}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <h2>Keine Bestellungen</h2>
          <p>Warten auf neue Bestellungen...</p>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order.id} className={`order-card ${getCategoryColor()}`}>
              <div className="order-header">
                <div className="table-number">Tisch {order.tableNumber}</div>
                <div className="order-time">{formatTime(order.timestamp)}</div>
              </div>
              
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-actions">
                <button 
                  className="action-btn complete-btn"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                >
                  Fertig
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => deleteOrder(order.id)}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPanel; 