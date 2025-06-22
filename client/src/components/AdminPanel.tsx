import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  const fetchMenu = useCallback(async () => {
    try {
      const response = await fetch('/api/menu/all');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Fehler beim Laden des Menüs:', error);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsNewItem(false);
  };

  const handleAddNew = () => {
    setEditingItem({
      id: 0,
      name: '',
      price: 0,
      category: 'pizzeria',
      description: '',
      available: true,
    });
    setIsNewItem(true);
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingItem) return;
    const { name, value, type } = e.target;
  
    let finalValue: string | number | boolean = value;
  
    if (type === 'number') {
      finalValue = parseFloat(value);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
  
    setEditingItem({
      ...editingItem,
      [name]: finalValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const url = isNewItem ? '/api/menu' : `/api/menu/${editingItem.id}`;
    const method = isNewItem ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        setEditingItem(null);
        fetchMenu();
      } else {
        const errorData = await response.json();
        alert(`Fehler: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Produkts:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
      try {
        const response = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchMenu();
        } else {
          alert('Fehler beim Löschen des Produkts.');
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error);
        alert('Ein Fehler ist aufgetreten.');
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button onClick={handleAddNew} className="add-new-btn">
          Neues Produkt hinzufügen
        </button>
      </div>

      {editingItem && (
        <div className="edit-modal-backdrop">
          <div className="edit-modal">
            <h2>{isNewItem ? 'Neues Produkt' : 'Produkt bearbeiten'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={editingItem.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Preis</label>
                <input type="number" name="price" value={editingItem.price} onChange={handleChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label>Kategorie</label>
                <select name="category" value={editingItem.category} onChange={handleChange}>
                  <option value="pizzeria">Pizzeria</option>
                  <option value="pub">Pub</option>
                </select>
              </div>
              <div className="form-group">
                <label>Beschreibung</label>
                <textarea name="description" value={editingItem.description} onChange={handleChange}></textarea>
              </div>
              <div className="form-group-checkbox">
                <label>Verfügbar</label>
                <input type="checkbox" name="available" checked={editingItem.available} onChange={handleChange} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">{isNewItem ? 'Erstellen' : 'Speichern'}</button>
                <button type="button" onClick={handleCancel} className="cancel-btn">Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="menu-table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Preis</th>
              <th>Kategorie</th>
              <th>Verfügbar</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.id} className={!item.available ? 'unavailable' : ''}>
                <td>{item.name}</td>
                <td>€{item.price.toFixed(2)}</td>
                <td>{item.category}</td>
                <td>{item.available ? 'Ja' : 'Nein'}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="action-btn edit">Bearbeiten</button>
                  <button onClick={() => handleDelete(item.id)} className="action-btn delete">Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel; 