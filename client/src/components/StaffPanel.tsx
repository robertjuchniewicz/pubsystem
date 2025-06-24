import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { useSettings } from '../contexts/SettingsContext';

const StaffPanel: React.FC<{ category: 'pub' | 'pizzeria' }> = ({ category }) => {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [showPizzeriaMenu, setShowPizzeriaMenu] = useState<boolean>(true);
  const [showPubEssen, setShowPubEssen] = useState<boolean>(true);
  const [pubClosed, setPubClosed] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?category=pub');
      const pubOrders = await response.json();
      const pizzeriaResponse = await fetch('/api/orders?category=pizzeria');
      const pizzeriaOrders = await pizzeriaResponse.json();
      setOrders([...pubOrders, ...pizzeriaOrders]);
    } catch (error) {
      console.error('Fehler beim Laden der Bestellungen:', error);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/orders/history');
      const historyData = await response.json();
      setHistoryOrders(historyData);
    } catch (error) {
      console.error('Fehler beim Laden der Bestellhistorie:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchHistory();
    const interval = setInterval(() => {
      fetchOrders();
      fetchHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchHistory]);

  useEffect(() => {
    if (settings) {
      setShowPizzeriaMenu(settings.pizzeriaMenuEnabled ?? true);
      setShowPubEssen(settings.pubEssenEnabled ?? true);
      setPubClosed(settings.pubClosed ?? false);
    }
  }, [settings]);

  // Aktualizuj czas co sekundę
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Funkcja do formatowania daty i czasu
  const formatDateTime = (date: Date) => {
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const formattedDate = date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
    return {
      dayName: dayNames[date.getDay()],
      formattedDate,
      formattedTime: date.toLocaleTimeString('de-DE', {
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
      })
    };
  };

  // Funkcja do sprawdzania czy zamówienie jest z dzisiejszego dnia
  const isToday = (dateString: string) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  };

  const formatTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const updateSectionStatus = async (orderId: string, status: 'ready' | 'delivered') => {
    try {
      await fetch(`/api/orders/${orderId}/section-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: category, status }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Bestellung:', error);
    }
  };

  const archiveOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchOrders();
    } catch (error) {
      console.error('Fehler beim Archivieren der Bestellung:', error);
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

  const archiveAllDelivered = async () => {
    if (window.confirm('Möchten Sie wirklich alle vollständig ausgelieferten Bestellungen archivieren?')) {
      try {
        const response = await fetch('/api/orders/archive-delivered', {
          method: 'POST',
        });
        const result = await response.json();
        alert(result.message);
        fetchOrders();
      } catch (error) {
        console.error('Fehler beim Archivieren aller Bestellungen:', error);
        alert('Ein Fehler ist aufgetreten.');
      }
    }
  };

  const handlePubClosedToggle = async () => {
    const newStatus = !pubClosed;
    setPubClosed(newStatus);
    
    if (newStatus) {
      // When PUB is closed, automatically close everything
      setShowPizzeriaMenu(false);
      setShowPubEssen(false);
      await updateSettings({ 
        pubClosed: true, 
        pizzeriaMenuEnabled: false, 
        pubEssenEnabled: false 
      });
    } else {
      // When PUB is opened, keep current settings
      await updateSettings({ pubClosed: false });
    }
  };

  const handlePizzeriaMenuToggle = async () => {
    const newStatus = !showPizzeriaMenu;
    setShowPizzeriaMenu(newStatus);
    await updateSettings({ pizzeriaMenuEnabled: newStatus });
  };

  const handlePubEssenToggle = async () => {
    const newStatus = !showPubEssen;
    setShowPubEssen(newStatus);
    await updateSettings({ pubEssenEnabled: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#ffa500';
      case 'delivered': return '#4CAF50';
      default: return '#777';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Bereit';
      case 'delivered': return 'Ausgeliefert';
      default: return 'In Bearbeitung';
    }
  };

  const hasFullyDeliveredOrders = orders.some(order => {
    const hasPubItems = order.items.some(item => item.category === 'pub-essen' || item.category === 'pub-trinken');
    const hasPizzeriaItems = order.items.some(item => item.category === 'pizzeria');
    const isPubDelivered = !hasPubItems || order.pubStatus === 'delivered';
    const isPizzeriaDelivered = !hasPizzeriaItems || order.pizzeriaStatus === 'delivered';
    return isPubDelivered && isPizzeriaDelivered;
  });

  // Funkcje do obliczania statystyk
  const getOrderStats = () => {
    // Łączymy aktywne zamówienia z historią i filtrujemy tylko dzisiejsze
    const allOrders = [...orders, ...historyOrders].filter(order => isToday(order.createdAt));
    
    let relevantOrders = allOrders;
    
    // Dla Pizzeria pokazuj tylko zamówienia z pozycjami pizzerii
    if (category === 'pizzeria') {
      relevantOrders = allOrders.filter(order => 
        order.items.some(item => item.category === 'pizzeria')
      );
    }
    
    const openOrders = relevantOrders.filter(order => {
      const hasPubItems = order.items.some(item => item.category === 'pub-essen' || item.category === 'pub-trinken');
      const hasPizzeriaItems = order.items.some(item => item.category === 'pizzeria');
      const isPubDelivered = !hasPubItems || order.pubStatus === 'delivered';
      const isPizzeriaDelivered = !hasPizzeriaItems || order.pizzeriaStatus === 'delivered';
      return !(isPubDelivered && isPizzeriaDelivered);
    });
    
    const completedOrders = relevantOrders.filter(order => {
      const hasPubItems = order.items.some(item => item.category === 'pub-essen' || item.category === 'pub-trinken');
      const hasPizzeriaItems = order.items.some(item => item.category === 'pizzeria');
      const isPubDelivered = !hasPubItems || order.pubStatus === 'delivered';
      const isPizzeriaDelivered = !hasPizzeriaItems || order.pizzeriaStatus === 'delivered';
      return isPubDelivered && isPizzeriaDelivered;
    });
    
    return {
      total: relevantOrders.length,
      open: openOrders.length,
      completed: completedOrders.length
    };
  };

  const stats = getOrderStats();

  if (settingsLoading) {
    return <div>Ładowanie ustawień...</div>;
  }

  return (
    <div className={`staff-panel ${category}`}>
      <div className="staff-header">
        <h1>Bestellungen - {category === 'pub' ? 'PUB' : 'Pizzeria'}</h1>
        {/* Zegar w prawym górnym rogu */}
        <div className="live-clock">
          <span className="clock-day">{formatDateTime(currentTime).dayName}</span>,{' '}
          <span className="clock-date">{formatDateTime(currentTime).formattedDate}</span>{' '}
          <span className="clock-time">{formatDateTime(currentTime).formattedTime}</span>
        </div>
        {/* Statystyki zamówień */}
        <div className="order-stats">
          <div className="stat-item">
            <span className="stat-label">Offene Bestellungen:</span>
            <span className="stat-value open">{stats.open}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ausgelieferte Bestellungen:</span>
            <span className="stat-value completed">{stats.completed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Alle Bestellungen:</span>
            <span className="stat-value total">{stats.total}</span>
          </div>
        </div>
        
        <div className="header-controls">
          {category === 'pub' && (
            <>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showPizzeriaMenu}
                    onChange={handlePizzeriaMenuToggle}
                    disabled={loading}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">
                  {showPizzeriaMenu ? 'Pizzeria Geöffnet' : 'Pizzeria Geschlossen'}
                </span>
              </div>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showPubEssen}
                    onChange={handlePubEssenToggle}
                    disabled={loading}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">
                  {showPubEssen ? 'PUB Küche Geöffnet' : 'PUB Küche Geschlossen'}
                </span>
              </div>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!pubClosed}
                    onChange={handlePubClosedToggle}
                    disabled={loading}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">
                  {!pubClosed ? 'PUB Geöffnet' : 'PUB Geschlossen'}
                </span>
              </div>
              {hasFullyDeliveredOrders && (
                <button onClick={archiveAllDelivered} className="btn archive-all-btn">
                  Alle Ausgelieferten ausblenden
                </button>
              )}
            </>
          )}
          {category === 'pizzeria' && (
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showPizzeriaMenu}
                  onChange={handlePizzeriaMenuToggle}
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">
                {showPizzeriaMenu ? 'Pizzeria Geöffnet' : 'Pizzeria Geschlossen'}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="order-grid">
        {loading ? (
          <p className="no-orders">Lade Daten...</p>
        ) : orders.length === 0 ? (
          <p className="no-orders">Keine offenen Bestellungen.</p>
        ) : (
          orders.map(order => {
            const pizzeriaItems = order.items.filter(item => item.category === 'pizzeria');
            const pubEssenItems = order.items.filter(item => item.category === 'pub-essen');
            const pubTrinkenItems = order.items.filter(item => item.category === 'pub-trinken');
            const allPubItems = [...pubEssenItems, ...pubTrinkenItems];
            const currentSectionStatus = category === 'pub' ? order.pubStatus : order.pizzeriaStatus;

            const hasPubItems = allPubItems.length > 0;
            const hasPizzeriaItems = order.items.some(item => item.category === 'pizzeria');
            const isPubDelivered = !hasPubItems || order.pubStatus === 'delivered';
            const isPizzeriaDelivered = !hasPizzeriaItems || order.pizzeriaStatus === 'delivered';
            const isFullyDelivered = isPubDelivered && isPizzeriaDelivered;

            const displayOrderNumber = order.orderNumber 
              ? `#${String(order.orderNumber).padStart(4, '0')}` 
              : order.id.substring(0, 8);

            // Format date with day of week
            const orderDate = new Date(order.createdAt);
            const { dayName, formattedDate, formattedTime } = formatDateTime(orderDate);

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-number">
                    <h3>{displayOrderNumber}</h3>
                    <span className="table-number">Tisch {order.tableNumber}</span>
                  </div>
                  <div className="order-time-info">
                    <div className="order-date">
                      {formattedDate}
                    </div>
                    <div className="time-elapsed">
                      <span className="elapsed-label">Bestellung aufgegeben:</span> {formatTimeElapsed(order.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="order-content">
                  {pizzeriaItems.length > 0 && (
                    <div className={`order-section ${category === 'pub' ? 'secondary' : 'primary'}`}>
                      <div className="section-header">
                        <span className="section-title">🍕 Pizzeria</span>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.pizzeriaStatus) }}
                        >
                          {getStatusText(order.pizzeriaStatus)}
                        </span>
                      </div>
                      <div className="items-list">
                        {pizzeriaItems.map((item, index) => (
                          <div key={`${item.menuItemId}-${index}`} className="item">
                            <span className="quantity">{item.quantity}x</span>
                            <span className="item-name">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pubEssenItems.length > 0 && (
                    <div className={`order-section ${category === 'pizzeria' ? 'secondary' : 'primary'}`}>
                      <div className="section-header">
                        <span className="section-title">🍽️ PUB Essen</span>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.pubStatus) }}
                        >
                          {getStatusText(order.pubStatus)}
                        </span>
                      </div>
                      <div className="items-list">
                        {pubEssenItems.map((item, index) => (
                          <div key={`${item.menuItemId}-${index}`} className="item">
                            <span className="quantity">{item.quantity}x</span>
                            <span className="item-name">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pubTrinkenItems.length > 0 && (
                    <div className={`order-section ${category === 'pizzeria' ? 'secondary' : 'primary'}`}>
                      <div className="section-header">
                        <span className="section-title">🍺 PUB Trinken</span>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.pubStatus) }}
                        >
                          {getStatusText(order.pubStatus)}
                        </span>
                      </div>
                      <div className="items-list">
                        {pubTrinkenItems.map((item, index) => (
                          <div key={`${item.menuItemId}-${index}`} className="item">
                            <span className="quantity">{item.quantity}x</span>
                            <span className="item-name">{item.name}</span>
                          </div>
                        ))}
                      </div>
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
                  {isFullyDelivered && category === 'pub' && (
                     <button 
                      onClick={() => archiveOrder(order.id)} 
                      className="action-btn archive-btn"
                    >
                      ✓
                    </button>
                  )}
                  {!isFullyDelivered && (
                    <button 
                      onClick={() => cancelOrder(order.id)} 
                      className="action-btn cancel-btn"
                    >
                      ✕
                    </button>
                  )}
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