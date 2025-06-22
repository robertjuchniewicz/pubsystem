import React, { useState, useEffect, useCallback } from 'react';
import { Order, CartItem } from '../types';

const StaffPanel: React.FC<{ category: 'pub' | 'pizzeria' }> = ({ category }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders?category=${category}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data: Order[] = await response.json();
      
      if (data.length > orders.length && soundEnabled) {
        playSound();
      }
      setOrders(data);
    } catch (error) {
      console.error('Fehler beim Laden der Bestellungen:', error);
    }
  }, [category, orders, soundEnabled]);

  useEffect(() => {
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const playSound = () => {
    new Audio('/notification.mp3').play().catch(e => console.error("Konnte Audio nicht abspielen:", e));
  };

  const updateSectionStatus = async (orderId: string, status: 'ready' | 'delivered') => {
    try {
      await fetch(`/api/orders/${orderId}/section-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: category, status }),
      });
      fetchOrders(); // Immediately refetch to update the UI
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Bestellung:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (window.confirm('Möchten Sie diese Bestellung wirklich stornieren?')) {
      try {
        await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
        fetchOrders();
      } catch (error) {
        console.error('Fehler beim Stornieren der Bestellung:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#ffa500';
      case 'delivered': return '#4CAF50';
      default: return '#ff9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Bereit';
      case 'delivered': return 'Ausgeliefert';
      default: return 'In Bearbeitung';
    }
  };

  return (
    <div className={`staff-panel ${category}`}>
      <div className="staff-header">
        <h1>Bestellungen - {category === 'pub' ? 'PUB' : 'Pizzeria'}</h1>
        <label className="sound-toggle">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => setSoundEnabled(!soundEnabled)}
          />
          Ton bei neuen Bestellungen
        </label>
      </div>
      <div className="order-list">
        {orders.length === 0 ? (
          <p className="no-orders">Keine offenen Bestellungen.</p>
        ) : (
          orders.map(order => {
            const pizzeriaItems = order.items.filter(item => item.category === 'pizzeria');
            const pubItems = order.items.filter(item => item.category === 'pub');
            const currentSectionStatus = category === 'pub' ? order.pubStatus : order.pizzeriaStatus;
            const otherSectionStatus = category === 'pub' ? order.pizzeriaStatus : order.pubStatus;

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Bestellung #{order.id.substring(0, 8)} (Tisch {order.tableNumber})</h3>
                  <p className="order-time">
                    {new Date(order.createdAt).toLocaleTimeString('de-DE')}
                  </p>
                </div>
                
                <div className="order-details">
                  {pizzeriaItems.length > 0 && (
                    <div className={`order-category-section ${category === 'pub' ? 'secondary' : ''}`}>
                      <div className="section-header">
                        <h4>Von der Pizzeria:</h4>
                        {category === 'pizzeria' && (
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.pizzeriaStatus) }}
                          >
                            {getStatusText(order.pizzeriaStatus)}
                          </span>
                        )}
                      </div>
                      <ul>
                        {pizzeriaItems.map((item, index) => (
                          <li key={`${item.menuItemId}-${index}`}>{item.quantity} x {item.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pubItems.length > 0 && (
                    <div className={`order-category-section ${category === 'pizzeria' ? 'secondary' : ''}`}>
                      <div className="section-header">
                        <h4>Vom Pub:</h4>
                        {category === 'pub' && (
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.pubStatus) }}
                          >
                            {getStatusText(order.pubStatus)}
                          </span>
                        )}
                      </div>
                      <ul>
                        {pubItems.map((item, index) => (
                          <li key={`${item.menuItemId}-${index}`}>{item.quantity} x {item.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  {currentSectionStatus === 'pending' && (
                    <button 
                      onClick={() => updateSectionStatus(order.id, 'ready')} 
                      className="action-btn ready-btn"
                    >
                      Bereit
                    </button>
                  )}
                  
                  {currentSectionStatus === 'ready' && (
                    <button 
                      onClick={() => updateSectionStatus(order.id, 'delivered')} 
                      className="action-btn delivered-btn"
                    >
                      Ausgeliefert
                    </button>
                  )}
                  
                  {currentSectionStatus === 'delivered' && otherSectionStatus === 'delivered' && (
                    <button 
                      onClick={() => updateSectionStatus(order.id, 'delivered')} 
                      className="action-btn complete-btn"
                      disabled
                    >
                      Vollständig ausgeliefert
                    </button>
                  )}
                  
                  <button 
                    onClick={() => cancelOrder(order.id)} 
                    className="action-btn cancel-btn"
                  >
                    Stornieren
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaffPanel; 