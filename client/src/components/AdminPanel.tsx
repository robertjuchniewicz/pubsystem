import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';

const AdminPanel: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'pub',
    description: '',
  });

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch('/api/menu/admin');
      if (!response.ok) throw new Error('Network response was not ok');
      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Fehler beim Laden des Menüs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editingItem) return;
    const { name, value } = e.target;
    setEditingItem({ ...editingItem, [name]: value });
  };

  const handleNewItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      await fetchMenuItems();
      setEditingItem(null);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Änderungen.');
    }
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert('Name and price are required.');
      return;
    }
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, id: Date.now() }), // Use a temporary ID
      });
      await fetchMenuItems();
      setNewItem({ name: '', price: '', category: 'pub', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      alert('Fehler beim Hinzufügen des neuen Artikels.');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const updatedItem = { ...item, available: !item.available };
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      await fetchMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Menüpunkt löschen möchten?')) return;
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };


  if (loading) {
    return <div>Lade Menü...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-controls">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newItem.name}
          onChange={handleNewItemChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Preis"
          value={newItem.price}
          onChange={handleNewItemChange}
        />
        <select name="category" value={newItem.category} onChange={handleNewItemChange}>
          <option value="pub">PUB</option>
          <option value="pizzeria">Pizzeria</option>
        </select>
        <textarea
          name="description"
          placeholder="Beschreibung"
          value={newItem.description}
          onChange={handleNewItemChange}
        />
        <button onClick={handleAddNewItem}>Hinzufügen</button>
      </div>

      <div className="menu-list">
        {menuItems.map(item => (
          <div key={item.id} className="menu-item-admin">
            {editingItem && editingItem.id === item.id ? (
              <form onSubmit={handleSaveChanges} className="edit-form">
                <input
                  type="text"
                  name="name"
                  value={editingItem.name}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="price"
                  value={editingItem.price}
                  onChange={handleInputChange}
                />
                <select name="category" value={editingItem.category} onChange={handleInputChange}>
                    <option value="pub">PUB</option>
                    <option value="pizzeria">Pizzeria</option>
                </select>
                <textarea
                  name="description"
                  value={editingItem.description}
                  onChange={handleInputChange}
                />
                <div className="edit-actions">
                  <button type="submit">Speichern</button>
                  <button type="button" onClick={handleCancelEdit}>Abbrechen</button>
                </div>
              </form>
            ) : (
              <>
                <div className="item-info">
                  <strong>{item.name}</strong> - €{Number(item.price).toFixed(2)} ({item.category})
                  <span className={item.available ? 'status-available' : 'status-hidden'}>
                    {item.available ? 'Sichtbar' : 'Versteckt'}
                  </span>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEdit(item)}>Bearbeiten</button>
                  <button onClick={() => handleToggleAvailability(item)}>
                    {item.available ? 'Verstecken' : 'Anzeigen'}
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="delete-btn">
                    Löschen
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel; 