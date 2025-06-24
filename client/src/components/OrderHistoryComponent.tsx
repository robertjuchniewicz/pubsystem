import React, { useState, useEffect } from 'react';
import { Order } from '../types';

type FilterType = 'all' | 'today' | 'completed' | 'canceled';

const OrderHistoryComponent: React.FC = () => {
  const [history, setHistory] = useState<Order[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/history');
      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok.');
      }
      const data: Order[] = await response.json();
      setHistory(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
      console.error("Fehler beim Laden der Bestellhistorie:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = history;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeFilter === 'today') {
      filtered = history.filter(order => new Date(order.createdAt) >= today);
    } else if (activeFilter === 'completed') {
      filtered = history.filter(order => order.status === 'completed');
    } else if (activeFilter === 'canceled') {
      filtered = history.filter(order => order.status === 'canceled');
    }

    setFilteredHistory(filtered);
  }, [activeFilter, history]);

  if (loading) {
    return (
      <div className="order-history">
        <div className="history-header">
          <h2>Bestellverlauf</h2>
          <div className="filter-controls">
            <button className="filter-btn active">Alle</button>
            <button className="filter-btn">Heute</button>
            <button className="filter-btn">Diese Woche</button>
          </div>
        </div>
        <div className="history-content">
          <p>Bestellverlauf wird hier angezeigt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error">Fehler beim Laden der Historie: {error}</div>;
  }

  return (
    <div className="order-history-page">
      <h1>Bestellhistorie</h1>
      
      <div className="filter-controls">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Alle
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
          onClick={() => setActiveFilter('today')}
        >
          Heute
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Abgeschlossen
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'canceled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('canceled')}
        >
          Storniert
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="no-history">Keine Bestellungen für den ausgewählten Filter gefunden.</p>
      ) : (
        <div className="history-list">
          {filteredHistory.map(order => (
            <div key={order.id} className={`history-card status-${order.status}`}>
              <div className="history-card-header">
                <h3>Bestellung #{order.orderNumber} (Tisch {order.tableNumber})</h3>
                <span className="history-time">
                  {new Date(order.createdAt).toLocaleString('de-DE')}
                </span>
                <span className={`status-badge-history status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="history-card-body">
                <p><strong>ID:</strong> <span>{order.id}</span></p>
                <ul>
                  {order.items.map(item => (
                    <li key={item.menuItemId}>
                      {item.name} - {item.quantity} Stk. (CHF {item.price.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryComponent; 