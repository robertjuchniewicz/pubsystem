import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';

type StatusFilter = 'all' | 'completed' | 'canceled';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/orders/history');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Order[] = await response.json();
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(); // Fetch once on component mount
    const interval = setInterval(fetchHistory, 5000); // And then fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchHistory]);

  // Filter orders based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === statusFilter);
      setFilteredOrders(filtered);
    }
  }, [orders, statusFilter]);

  const getStatusInfo = (order: Order): { text: string; className: string; icon: string } => {
    if (order.status === 'canceled') {
      return { text: 'Storniert', className: 'status-canceled', icon: '❌' };
    }
    if (order.status === 'completed') {
      return { text: 'Abgeschlossen', className: 'status-completed', icon: '✅' };
    }
    return { text: 'Unbekannt', className: 'status-unknown', icon: '❓' };
  };

  const getStatusCounts = () => {
    const completed = orders.filter(order => order.status === 'completed').length;
    const canceled = orders.filter(order => order.status === 'canceled').length;
    const total = orders.length;
    return { completed, canceled, total };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <div className="order-history-page"><h1>Lade Bestellhistorie...</h1></div>;
  }

  return (
    <div className="order-history-page">
      <h1>Bestellhistorie</h1>
      
      {/* Status Statistics */}
      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-number">{statusCounts.total}</span>
          <span className="stat-label">Gesamt</span>
        </div>
        <div className="stat-item completed">
          <span className="stat-number">{statusCounts.completed}</span>
          <span className="stat-label">Abgeschlossen</span>
        </div>
        <div className="stat-item canceled">
          <span className="stat-number">{statusCounts.canceled}</span>
          <span className="stat-label">Storniert</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="history-filters">
        <h3>Filter nach Status:</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Alle ({statusCounts.total})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Abgeschlossen ({statusCounts.completed})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'canceled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('canceled')}
          >
            Storniert ({statusCounts.canceled})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="no-history">
          {statusFilter === 'all' 
            ? 'Keine abgeschlossenen Bestellungen gefunden.' 
            : `Keine ${statusFilter === 'completed' ? 'abgeschlossenen' : 'stornierten'} Bestellungen gefunden.`
          }
        </p>
      ) : (
        <div className="history-list">
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order);
            const deliveryTime = order.deliveredAt || order.canceledAt || order.createdAt;
            const displayOrderNumber = order.orderNumber 
              ? `#${String(order.orderNumber).padStart(4, '0')}` 
              : order.id.substring(0, 8);
            return (
              <div key={order.id} className={`history-card ${statusInfo.className}`}>
                <div className="history-card-header">
                  <div className="header-left">
                    <h3>Tisch {order.tableNumber}</h3>
                    <span className="order-number-display">{displayOrderNumber}</span>
                  </div>
                  <div className="header-right">
                    <span className={`status-badge-history ${statusInfo.className}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                    <span className="history-time">{new Date(deliveryTime).toLocaleString('de-DE')}</span>
                  </div>
                </div>
                <div className="history-card-body">
                  <p><strong>Bestell-Nr.:</strong> <span>{displayOrderNumber}</span></p>
                  <p><strong>ID:</strong> <span className="history-internal-id">{order.id}</span></p>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={`${item.menuItemId}-${index}`}>
                        {item.quantity} x {item.name} - CHF {item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
 