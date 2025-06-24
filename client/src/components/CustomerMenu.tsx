import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MenuItem, CartItem } from '../types';
import { useSettings } from '../contexts/SettingsContext';

const CustomerMenu: React.FC = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groupedMenu, setGroupedMenu] = useState<Record<string, MenuItem[]>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isValidTable, setIsValidTable] = useState<boolean | null>(null);
  const { settings, loading: settingsLoading } = useSettings();

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

  useEffect(() => {
    const validateTable = async () => {
      try {
        const settingsResponse = await fetch('/api/settings');
        const settings = await settingsResponse.json();
        const num = parseInt(tableNumber || '');
        if (isNaN(num) || num < 1 || num > settings.maxTables) {
          setIsValidTable(false);
        } else {
          setIsValidTable(true);
        }
      } catch (error) {
        console.error("Fehler bei der Tisch-Validierung:", error);
        setIsValidTable(false);
      } finally {
        setLoading(false);
      }
    };

    validateTable();
  }, [tableNumber]);

  useEffect(() => {
    if (menuItems.length > 0) {
      const grouped = menuItems.reduce((acc, item) => {
        const key = item.mealType || 'Sonstiges';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as Record<string, MenuItem[]>);
      
      const mealTypeOrder = ['Salate', 'Suppen', 'Hauptgerichte', 'Pasta', 'Pizza', 'Beilagen', 'Sonstiges'];
      
      const sortedGroupedMenu: Record<string, MenuItem[]> = {};
      mealTypeOrder.forEach(mealType => {
        if (grouped[mealType]) {
          sortedGroupedMenu[mealType] = grouped[mealType];
        }
      });
      
      Object.keys(grouped).forEach(mealType => {
        if (!sortedGroupedMenu[mealType]) {
          sortedGroupedMenu[mealType] = grouped[mealType];
        }
      });
      
      setGroupedMenu(sortedGroupedMenu);
    }
  }, [menuItems]);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === String(item.id));
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === String(item.id)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { menuItemId: String(item.id), name: item.name, price: item.price, quantity: 1, category: item.category }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem.menuItemId !== itemId);
    });
  };
  
  const getQuantity = (itemId: string) => {
    return cart.find(item => item.menuItemId === itemId)?.quantity || 0;
  };
  
  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableNumber,
          items: cart
        }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Bestellung erfolgreich aufgegeben!' });
        setCart([]);
        setOrderPlaced(true);
      } else {
        setMessage({ type: 'error', text: 'Fehler bei der Bestellung.' });
      }
    } catch (error) {
      console.error('Bestellfehler:', error);
      setMessage({ type: 'error', text: 'Ein Netzwerkfehler ist aufgetreten.' });
    }
  };

  if (loading || isValidTable === null) {
    return <div className="loading">Prüfe Tisch-Nummer...</div>;
  }

  if (!isValidTable) {
    return <div className="error">Dieser Tisch existiert nicht.</div>;
  }

  if (orderPlaced) {
    return (
      <div className="customer-menu-page">
        <header className="menu-header">
          <h1>Unsere Speisekarte</h1>
          {tableNumber ? (
            <p>Tisch {tableNumber}</p>
          ) : (
            <p>Tisch Nr: {tableNumber}</p>
          )}
        </header>

        <div className="menu-content">
          {Object.entries(groupedMenu).map(([mealType, items]) => (
            <div key={mealType} className="meal-type-section">
              <h2 className="meal-type-title">{mealType}</h2>
              <div className="menu-items-grid">
                {items.map(item => (
                  <div key={item.id} className="menu-item-card">
                    <h3>{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="price">CHF {item.price.toFixed(2)}</div>
                    <div className="item-controls">
                      <button onClick={() => removeFromCart(String(item.id))} className="quantity-btn">-</button>
                      <span className="quantity-display">{getQuantity(String(item.id))}</span>
                      <button onClick={() => addToCart(item)} className="quantity-btn">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-section">
            <h2>Warenkorb</h2>
            {cart.map((item) => (
              <div key={item.menuItemId} className="cart-item">
                <span>{item.name} (x{item.quantity})</span>
                <span>CHF {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <h3 className="cart-total">Gesamt: CHF {getTotal()}</h3>
            <button className="btn btn-primary place-order-btn" onClick={placeOrder}>Bestellung abschicken</button>
          </div>
        )}

        {message && (
          <div className="message-overlay">
            <div className={`message ${message.type}`}>
              <p>{message.text}</p>
              {message.type === 'success' && (
                <button 
                  onClick={() => setMessage(null)} 
                  className="btn new-order-btn"
                >
                  Neue Bestellung aufgeben
                </button>
              )}
              {message.type === 'error' && (
                <button 
                  onClick={() => setMessage(null)} 
                  className="btn error-close-btn"
                >
                  Schließen
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (settings && settings.pubClosed === true) {
    return (
      <div className="customer-menu-page">
        <header className="menu-header">
          <h1>Unsere Speisekarte</h1>
          {tableNumber ? (
            <p>Tisch {tableNumber}</p>
          ) : (
            <p>Tisch Nr: {tableNumber}</p>
          )}
        </header>
        <div className="pub-closed-message" style={{textAlign: 'center', marginTop: '2rem', fontSize: '1.3rem', color: '#b22222'}}>
          <strong>Entschuldigung, heute können wir leider nichts mehr bestellen. Wir schließen den PUB. Vielen Dank und bis zum nächsten Mal!</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-menu-page">
      <header className="menu-header">
        <h1>Unsere Speisekarte</h1>
        {tableNumber ? (
          <p>Tisch {tableNumber}</p>
        ) : (
          <p>Tisch Nr: {tableNumber}</p>
        )}
      </header>

      <div className="menu-content">
        {Object.entries(groupedMenu).map(([mealType, items]) => (
          <div key={mealType} className="meal-type-section">
            <h2 className="meal-type-title">{mealType}</h2>
            <div className="menu-items-grid">
              {items.map(item => (
                <div key={item.id} className="menu-item-card">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="price">CHF {item.price.toFixed(2)}</div>
                  <div className="item-controls">
                    <button onClick={() => removeFromCart(String(item.id))} className="quantity-btn">-</button>
                    <span className="quantity-display">{getQuantity(String(item.id))}</span>
                    <button onClick={() => addToCart(item)} className="quantity-btn">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-section">
          <h2>Warenkorb</h2>
          {cart.map((item) => (
            <div key={item.menuItemId} className="cart-item">
              <span>{item.name} (x{item.quantity})</span>
              <span>CHF {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <h3 className="cart-total">Gesamt: CHF {getTotal()}</h3>
          <button className="btn btn-primary place-order-btn" onClick={placeOrder}>Bestellung abschicken</button>
        </div>
      )}

      {message && (
        <div className="message-overlay">
          <div className={`message ${message.type}`}>
            <p>{message.text}</p>
            {message.type === 'success' && (
              <button 
                onClick={() => setMessage(null)} 
                className="btn new-order-btn"
              >
                Neue Bestellung aufgeben
              </button>
            )}
            {message.type === 'error' && (
              <button 
                onClick={() => setMessage(null)} 
                className="btn error-close-btn"
              >
                Schließen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu; 