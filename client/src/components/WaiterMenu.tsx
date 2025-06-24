import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem } from '../types';
import { useSettings } from '../contexts/SettingsContext';

const WaiterMenu: React.FC = () => {
  const [tableNumber, setTableNumber] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { settings, loading: settingsLoading } = useSettings();
  
  // Refs for scrolling
  const pizzeriaRef = useRef<HTMLDivElement>(null);
  const pubRef = useRef<HTMLDivElement>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/menu', { cache: 'no-store' });
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Fehler beim Laden der Speisekarte:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!settingsLoading) {
      fetchMenu();
    }
  }, [fetchMenu, settings.pizzeriaMenuEnabled, settings.pubEssenEnabled, settings.pubTrinkenEnabled, settings.pubClosed, settingsLoading]);

  const addToCart = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(menuItem => menuItem.id === parseInt(itemId));
      if (!item) return null;
      return {
        ...item,
        quantity
      };
    }).filter((item): item is MenuItem & { quantity: number } => item !== null);
  };

  const getTotalPrice = () => {
    return getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const groupItemsByMealType = (items: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem[] } = {};
    
    items.forEach(item => {
      if (!grouped[item.mealType]) {
        grouped[item.mealType] = [];
      }
      grouped[item.mealType].push(item);
    });
    
    return grouped;
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'Salate': return '🥗';
      case 'Suppen': return '🍲';
      case 'Pasta': return '🍝';
      case 'Hauptgerichte': return '🍖';
      case 'Beilagen': return '🍟';
      case 'Pizza': return '🍕';
      case 'Bier': return '🍺';
      default: return '🍽️';
    }
  };

  const getMealTypeTitle = (mealType: string) => {
    switch (mealType) {
      case 'Salate': return 'Salate';
      case 'Suppen': return 'Suppen';
      case 'Pasta': return 'Pasta';
      case 'Hauptgerichte': return 'Hauptgerichte';
      case 'Beilagen': return 'Beilagen';
      case 'Pizza': return 'Pizza';
      case 'Bier': return 'Getränke';
      default: return mealType;
    }
  };

  const scrollToSection = (section: 'pizzeria' | 'pub') => {
    const targetRef = section === 'pizzeria' ? pizzeriaRef : pubRef;
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const placeOrder = async () => {
    if (!tableNumber.trim()) {
      alert('Bitte geben Sie eine Tischnummer ein.');
      return;
    }

    if (Object.keys(cart).length === 0) {
      alert('Bitte fügen Sie mindestens ein Produkt zum Warenkorb hinzu.');
      return;
    }

    try {
      const orderData = {
        tableNumber: parseInt(tableNumber),
        items: getCartItems().map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderPlaced(true);
        setCart({});
        setTableNumber('');
      } else {
        alert('Fehler beim Aufgeben der Bestellung. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Fehler beim Aufgeben der Bestellung:', error);
      alert('Fehler beim Aufgeben der Bestellung. Bitte versuchen Sie es erneut.');
    }
  };

  const startNewOrder = () => {
    setOrderPlaced(false);
    setCart({});
    setTableNumber('');
  };

  if (loading) {
    return (
      <div className="waiter-menu">
        <div className="loading">Lade Speisekarte...</div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="waiter-menu">
        <div className="order-success">
          <h2>✅ Bestellung erfolgreich aufgegeben!</h2>
          <p>Die Bestellung wurde an die Küche und Bar weitergeleitet.</p>
          <button className="btn-primary" onClick={startNewOrder}>
            Neue Bestellung
          </button>
        </div>
      </div>
    );
  }

  if (settings && settings.pubClosed === true) {
    return (
      <div className="waiter-menu">
        <header className="waiter-header">
          <h1>🍽️ Kellner Speisekarte</h1>
          <p>Bestellung für einen Tisch aufgeben</p>
        </header>
        <div className="pub-closed-message" style={{textAlign: 'center', marginTop: '2rem', fontSize: '1.3rem', color: '#b22222'}}>
          <strong>Entschuldigung, heute können wir leider nichts mehr bestellen. Wir schließen den PUB. Vielen Dank und bis zum nächsten Mal!</strong>
        </div>
      </div>
    );
  }

  const pubItems = menuItems.filter(item => item.category.startsWith('pub-') && item.available);
  const pizzeriaItems = menuItems.filter(item => item.category === 'pizzeria' && item.available);

  const groupedPizzeriaItems = groupItemsByMealType(pizzeriaItems);
  const groupedPubItems = groupItemsByMealType(pubItems);

  return (
    <div className="waiter-menu">
      <header className="waiter-header">
        <h1>🍽️ Kellner Speisekarte</h1>
        <p>Bestellung für einen Tisch aufgeben</p>
      </header>

      <div className="table-selection">
        <label htmlFor="table-number">Tisch Nummer auswählen:</label>
        <input
          type="text"
          id="table-number"
          className="table-input"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="z.B. 1, 2a, 15"
        />
      </div>

      {/* Floating Navigation Buttons */}
      <div className="floating-section-toggle">
        <button 
          className="section-toggle-btn"
          onClick={() => scrollToSection('pizzeria')}
        >
          🍕 Pizzeria
        </button>
        <button 
          className="section-toggle-btn"
          onClick={() => scrollToSection('pub')}
        >
          🍺 PUB
        </button>
      </div>

      <div className="menu-container">
        {/* Pizzeria Section */}
        {Object.keys(groupedPizzeriaItems).length > 0 && (
          <div className="menu-section" ref={pizzeriaRef}>
            <h2>🍕 Pizzeria</h2>
            {Object.entries(groupedPizzeriaItems).map(([mealType, items]) => (
              <div key={mealType} className="meal-type-section">
                <h3>{getMealTypeIcon(mealType)} {getMealTypeTitle(mealType)}</h3>
                <div className="menu-grid">
                  {items.map((item) => (
                    <div key={item.id} className="menu-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <span className="price">€{item.price.toFixed(2)}</span>
                      </div>
                      <button
                        className="btn-add"
                        onClick={() => addToCart(item.id)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PUB Section */}
        {Object.keys(groupedPubItems).length > 0 && (
          <div className="menu-section" ref={pubRef}>
            <h2>🍺 PUB</h2>
            {Object.entries(groupedPubItems).map(([mealType, items]) => (
              <div key={mealType} className="meal-type-section">
                <h3>{getMealTypeIcon(mealType)} {getMealTypeTitle(mealType)}</h3>
                <div className="menu-grid">
                  {items.map((item) => (
                    <div key={item.id} className="menu-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <span className="price">€{item.price.toFixed(2)}</span>
                      </div>
                      <button
                        className="btn-add"
                        onClick={() => addToCart(item.id)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cart-section">
        <h2>🛒 Warenkorb</h2>
        {Object.keys(cart).length === 0 ? (
          <div className="empty-cart">
            Warenkorb ist leer. Fügen Sie Produkte hinzu.
          </div>
        ) : (
          <>
            <div className="cart-items">
              {getCartItems().map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>€{item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="btn-add"
                      onClick={() => addToCart(item.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <h3>Gesamt: €{getTotalPrice().toFixed(2)}</h3>
            </div>
            <button
              className="btn-order"
              onClick={placeOrder}
              disabled={!tableNumber.trim()}
            >
              Bestellung abschicken
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WaiterMenu; 