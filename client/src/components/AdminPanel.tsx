import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';

interface AdminPanelProps {
  // Puste na razie, można dodać propsy w przyszłości
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'pub',
    available: true
  });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Fehler beim Laden der Menüpunkte:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setNewItem({
          id: '',
          name: '',
          description: '',
          price: 0,
          category: 'pub',
          available: true
        });
        setEditingItem(null);
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Menüpunkt löschen möchten?')) {
      try {
        const response = await fetch(`/api/menu/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchMenuItems();
        }
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          available: !item.available
        }),
      });
      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Verfügbarkeit:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Menü-Verwaltung</h1>
      
      {/* Formular für neue/zu bearbeitende Menüpunkte */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>
          {editingItem ? 'Menüpunkt bearbeiten' : 'Neuen Menüpunkt hinzufügen'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Preis (€)"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
              required
              step="0.01"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <textarea
            placeholder="Beschreibung"
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            required
            rows={3}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="pub">Pub</option>
              <option value="pizzeria">Pizzeria</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="available"
                checked={newItem.available}
                onChange={(e) => setNewItem({...newItem, available: e.target.checked})}
              />
              <label htmlFor="available">Verfügbar</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {editingItem ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({
                    id: '',
                    name: '',
                    description: '',
                    price: 0,
                    category: 'pub',
                    available: true
                  });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste der Menüpunkte */}
      <div>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Aktuelle Menüpunkte</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: item.available ? 'white' : '#f8f9fa',
                opacity: item.available ? 1 : 0.7
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {item.name}
                    <span style={{ 
                      marginLeft: '10px', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      backgroundColor: item.category === 'pub' ? '#007bff' : '#28a745',
                      color: 'white'
                    }}>
                      {item.category}
                    </span>
                  </h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>{item.description}</p>
                  <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#333' }}>
                    €{item.price.toFixed(2)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: item.available ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {item.available ? 'Nicht verfügbar' : 'Verfügbar'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#ffc107',
                      color: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 