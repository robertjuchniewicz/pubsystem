import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MenuItem, CartItem, OrderResponse } from '../types';

const CustomerMenu: React.FC = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Fehler beim Laden der Speisekarte:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          category: item.category
        }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.menuItemId !== itemId);
      }
    });
  };

  const getCartItemQuantity = (itemId: number) => {
    const cartItem = cart.find(item => item.menuItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber!),
          items: cart
        }),
      });

      const data: OrderResponse = await response.json();
      
      if (data.success) {
        setOrderSubmitted(true);
        setOrderMessage(data.message || `Ihre Bestellung für Tisch ${tableNumber} wurde erfolgreich aufgenommen!`);
        setCart([]);
      } else {
        alert('Fehler beim Aufgeben der Bestellung. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Fehler beim Aufgeben der Bestellung:', error);
      alert('Fehler beim Aufgeben der Bestellung. Bitte versuchen Sie es erneut.');
    }
  };

  if (loading) {
    return (
      <div className="customer-menu">
        <div className="menu-header">
          <h1>Lade Speisekarte...</h1>
        </div>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="customer-menu">
        <div className="menu-header">
          <h1>Bestellung erfolgreich!</h1>
          <p>{orderMessage}</p>
          <p>Ihre Bestellung wird zu Ihnen an den Tisch gebracht.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="order-btn"
            style={{ marginTop: '20px' }}
          >
            Neue Bestellung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-menu">
      <div className="menu-header">
        <h1>Helvetia Pub & Pizzeria</h1>
        <p>Tisch {tableNumber} - Wählen Sie Ihre Bestellung</p>
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className={`menu-item ${getCartItemQuantity(item.id) > 0 ? 'selected' : ''}`}
            onClick={() => addToCart(item)}
          >
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="price">€{item.price.toFixed(2)}</div>
            
            {getCartItemQuantity(item.id) > 0 && (
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                >
                  -
                </button>
                <span className="quantity-display">{getCartItemQuantity(item.id)}</span>
                <button 
                  className="quantity-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cart-section">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.menuItemId} className="cart-item">
              <span>{item.name}</span>
              <span>x{item.quantity} - €{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        {cart.length > 0 && (
          <>
            <div className="cart-total">
              Gesamt: €{getTotalPrice().toFixed(2)}
            </div>
            <button 
              className="order-btn"
              onClick={submitOrder}
            >
              Bestellung aufgeben
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerMenu; 