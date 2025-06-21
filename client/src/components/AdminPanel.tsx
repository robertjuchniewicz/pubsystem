import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';

const AdminPanel: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'pub' as 'pub' | 'pizzeria',
    description: ''
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/admin');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Fehler beim Laden der Speisekarte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleSave = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        await fetchMenuItems();
        setEditingItem(null);
      } else {
        alert('Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Menüpunkt löschen möchten?')) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMenuItems();
      } else {
        alert('Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const updatedItem = { ...item, available: !item.available };
    await handleSave(updatedItem);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.description) {
      alert('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        await fetchMenuItems();
        setNewItem({ name: '', price: '', category: 'pub', description: '' });
        setShowAddForm(false);
      } else {
        alert('Fehler beim Hinzufügen');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      alert('Fehler beim Hinzufügen');
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1>Lade Speisekarte...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Speisekarte verwalten</h1>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Abbrechen' : 'Neuen Menüpunkt hinzufügen'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Neuen Menüpunkt hinzufügen</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Preis"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </div>
          <div className="form-row">
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as 'pub' | 'pizzeria' })}
            >
              <option value="pub">PUB</option>
              <option value="pizzeria">Pizzeria</option>
            </select>
            <input
              type="text"
              placeholder="Beschreibung"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
          <button className="save-btn" onClick={handleAddItem}>
            Hinzufügen
          </button>
        </div>
      )}

      <div className="menu-sections">
        <div className="menu-section">
          <h2>PUB Artikel</h2>
          <div className="menu-items">
            {menuItems
              .filter(item => item.category === 'pub')
              .map((item) => (
                <div key={item.id} className={`menu-item ${!item.available ? 'unavailable' : ''}`}>
                  {editingItem?.id === item.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      />
                      <input
                        type="text"
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleSave(editingItem)}>Speichern</button>
                        <button onClick={() => setEditingItem(null)}>Abbrechen</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-content">
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <span className="price">€{item.price.toFixed(2)}</span>
                        <span className={`status ${item.available ? 'available' : 'unavailable'}`}>
                          {item.available ? 'Verfügbar' : 'Nicht verfügbar'}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(item)}>Bearbeiten</button>
                        <button 
                          onClick={() => handleToggleAvailability(item)}
                          className={item.available ? 'hide-btn' : 'show-btn'}
                        >
                          {item.available ? 'Verstecken' : 'Anzeigen'}
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="delete-btn">
                          Löschen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="menu-section">
          <h2>Pizzeria Artikel</h2>
          <div className="menu-items">
            {menuItems
              .filter(item => item.category === 'pizzeria')
              .map((item) => (
                <div key={item.id} className={`menu-item ${!item.available ? 'unavailable' : ''}`}>
                  {editingItem?.id === item.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      />
                      <input
                        type="text"
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleSave(editingItem)}>Speichern</button>
                        <button onClick={() => setEditingItem(null)}>Abbrechen</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-content">
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <span className="price">€{item.price.toFixed(2)}</span>
                        <span className={`status ${item.available ? 'available' : 'unavailable'}`}>
                          {item.available ? 'Verfügbar' : 'Nicht verfügbar'}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(item)}>Bearbeiten</button>
                        <button 
                          onClick={() => handleToggleAvailability(item)}
                          className={item.available ? 'hide-btn' : 'show-btn'}
                        >
                          {item.available ? 'Verstecken' : 'Anzeigen'}
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="delete-btn">
                          Löschen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 