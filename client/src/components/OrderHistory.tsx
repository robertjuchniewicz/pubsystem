import React, { useState, useEffect } from 'react';
import { OrderHistory } from '../types';

const OrderHistoryComponent: React.FC = () => {
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/orders/history');
      if (!response.ok) throw new Error('Network response was not ok');
      const data: OrderHistory[] = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Fehler beim Laden der Bestellhistorie:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getStatusBadge = (status: string) => {
    const isCompleted = status === 'completed';
    return (
      <span 
        className={`status-badge ${isCompleted ? 'completed' : 'cancelled'}`}
        style={{ 
          backgroundColor: isCompleted ? '#4CAF50' : '#f44336',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.8em'
        }}
      >
        {isCompleted ? 'Abgeschlossen' : 'Storniert'}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Lade Bestellhistorie...</div>;
  }

  return (
    <div className="order-history">
      <div className="history-header">
        <h1>Bestellhistorie</h1>
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Abgeschlossen
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Storniert
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <p className="no-history">Keine Bestellungen in der Historie.</p>
        ) : (
          filteredHistory.map(order => (
            <div key={order.id} className="history-card">
              <div className="history-header">
                <h3>Bestellung #{order.id.substring(0, 8)} (Tisch {order.tableNumber})</h3>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="history-details">
                <p><strong>Bestellt am:</strong> {formatDate(order.createdAt)}</p>
                {order.deliveredAt && (
                  <p><strong>Ausgeliefert am:</strong> {formatDate(order.deliveredAt)}</p>
                )}
                {order.cancelledAt && (
                  <p><strong>Storniert am:</strong> {formatDate(order.cancelledAt)}</p>
                )}
              </div>

              <div className="history-items">
                <h4>Bestellte Artikel:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${item.menuItemId}-${index}`}>
                      {item.quantity} x {item.name} - €{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                
                <div className="total">
                  <strong>Gesamt: €{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistoryComponent; 