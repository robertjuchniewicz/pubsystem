import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';

interface NewMenuItem {
  name: string;
  description: string;
  price: string;
  category: 'pizzeria' | 'pub-essen' | 'pub-trinken';
  mealType: string;
  available: boolean;
}

// --- Komponent formularza dodawania ---
interface MultiAddFormProps {
  newItems: NewMenuItem[];
  onNewItemChange: (index: number, field: keyof NewMenuItem, value: any) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const MultiAddForm: React.FC<MultiAddFormProps> = ({ newItems, onNewItemChange, onAddRow, onRemoveRow, onSubmit }) => (
  <div className="menu-form">
    <h3>Neue Gerichte hinzufügen</h3>
    <form onSubmit={onSubmit}>
      {newItems.map((item, index) => (
        <div key={index} className="form-row multi-item-row">
          <input type="text" placeholder="Name" value={item.name} onChange={(e) => onNewItemChange(index, 'name', e.target.value)} className="form-control" />
          <input type="text" placeholder="Beschreibung" value={item.description} onChange={(e) => onNewItemChange(index, 'description', e.target.value)} className="form-control" />
          <input type="text" placeholder="Art des Gerichts (z.B. Pizza)" value={item.mealType} onChange={(e) => onNewItemChange(index, 'mealType', e.target.value)} className="form-control" />
          <input type="number" placeholder="Preis (CHF)" value={item.price} onChange={(e) => onNewItemChange(index, 'price', e.target.value)} step="0.01" className="form-control" />
          <select 
            value={item.category} 
            onChange={(e) => onNewItemChange(index, 'category', e.target.value as 'pizzeria' | 'pub-essen' | 'pub-trinken')} 
            className="form-control"
          >
            <option value="pizzeria">Pizzeria</option>
            <option value="pub-trinken">Pub Trinken</option>
            <option value="pub-essen">Pub Essen</option>
          </select>
          <button type="button" onClick={() => onRemoveRow(index)} className="btn btn-danger remove-row-btn">-</button>
        </div>
      ))}
      <div className="form-actions">
        <button type="button" onClick={onAddRow} className="btn btn-secondary">Weitere Position hinzufügen</button>
        <button type="submit" className="btn btn-primary">Alle neuen Positionen speichern</button>
      </div>
    </form>
  </div>
);

// --- Komponent formularza edycji ---
interface EditFormProps {
  editingItem: MenuItem;
  onUpdate: (e: React.FormEvent) => void;
  onCancel: () => void;
  setEditingItemState: React.Dispatch<React.SetStateAction<MenuItem | null>>;
}

const EditForm: React.FC<EditFormProps> = ({ editingItem, onUpdate, onCancel, setEditingItemState }) => {
  const handleChange = (field: keyof MenuItem, value: any) => {
    setEditingItemState(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (!editingItem) return null;

  return (
    <div className="menu-form edit-form">
      <h3>"{editingItem.name}" bearbeiten</h3>
      <form onSubmit={onUpdate}>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={editingItem.name} onChange={(e) => handleChange('name', e.target.value)} required className="form-control"/>
          </div>
          <div className="form-group">
            <label>Art des Gerichts</label>
            <input type="text" value={editingItem.mealType} onChange={(e) => handleChange('mealType', e.target.value)} required className="form-control" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Preis (CHF)</label>
            <input type="number" value={editingItem.price} onChange={(e) => handleChange('price', parseFloat(e.target.value))} required step="0.01" className="form-control" />
          </div>
          <div className="form-group">
            <label>Kategorie</label>
            <select 
              value={editingItem.category} 
              onChange={(e) => handleChange('category', e.target.value as 'pizzeria' | 'pub-essen' | 'pub-trinken')}
              className="form-control"
            >
              <option value="pizzeria">Pizzeria</option>
              <option value="pub-trinken">Pub Trinken</option>
              <option value="pub-essen">Pub Essen</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Beschreibung</label>
          <textarea value={editingItem.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} className="form-control" />
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="edit-available" checked={editingItem.available} onChange={(e) => handleChange('available', e.target.checked)} />
          <label htmlFor="edit-available">Verfügbar</label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Änderungen speichern</button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">Abbrechen</button>
        </div>
      </form>
    </div>
  );
};


// --- Główny komponent SpeisekartePanel ---
const SpeisekartePanel: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItems, setNewItems] = useState<NewMenuItem[]>([
    { name: '', description: '', price: '', category: 'pizzeria', mealType: '', available: true }
  ]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/all');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Fehler beim Laden der Speisekarte:', error);
    }
  };
  
  const handleNewItemChange = (index: number, field: keyof NewMenuItem, value: any) => {
    const updatedNewItems = [...newItems];
    updatedNewItems[index] = { ...updatedNewItems[index], [field]: value };
    setNewItems(updatedNewItems);
  };
  
  const addRow = () => {
    setNewItems([...newItems, { name: '', description: '', price: '', category: 'pizzeria', mealType: '', available: true }]);
  };

  const removeRow = (index: number) => {
    const updatedNewItems = newItems.filter((_, i) => i !== index);
    setNewItems(updatedNewItems);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToSubmit = newItems.filter(item => item.name && item.price && item.mealType).map(item => ({ ...item, price: parseFloat(item.price) }));
    if (itemsToSubmit.length === 0) {
      alert("Bitte füllen Sie mindestens ein Gericht vollständig aus (Name, Preis, Art).");
      return;
    }
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToSubmit),
      });
      if (response.ok) {
        setNewItems([{ name: '', description: '', price: '', category: 'pizzeria', mealType: '', available: true }]);
        fetchMenuItems();
        alert(`${itemsToSubmit.length} Gericht(e) erfolgreich hinzugefügt!`);
      } else {
        const errorData = await response.json();
        console.error('Server responded with an error:', errorData);
        const errorMessage = errorData.details || 'Fehler beim Speichern der Gerichte';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      const message = error instanceof Error ? error.message : 'Fehler beim Speichern. Bitte versuchen Sie es erneut.';
      alert(message);
    }
  };
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      if (response.ok) {
        setEditingItem(null);
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Gericht löschen möchten?')) {
      try {
        const response = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
        if (response.ok) fetchMenuItems();
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, available: !item.available }),
      });
      if (response.ok) fetchMenuItems();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Verfügbarkeit:', error);
    }
  };

  return (
    <div className="speisekarte-panel">
      <header className="speisekarte-header">
        <h2 className="speisekarte-title">Speisekarte-Verwaltung</h2>
        <p className="speisekarte-subtitle">
          Hier können Sie die Speisekarte bearbeiten, neue Gerichte hinzufügen oder bestehende ausblenden.
        </p>
      </header>

      {editingItem ? (
        <EditForm 
          editingItem={editingItem}
          onUpdate={handleUpdate}
          onCancel={() => setEditingItem(null)}
          setEditingItemState={setEditingItem}
        />
      ) : (
        <MultiAddForm 
          newItems={newItems}
          onNewItemChange={handleNewItemChange}
          onAddRow={addRow}
          onRemoveRow={removeRow}
          onSubmit={handleBulkSubmit}
        />
      )}

      <div className="menu-items-list">
        <div className="menu-item-row header">
          <span>Name</span>
          <span>Beschreibung</span>
          <span>Herkunft</span>
          <span>Art</span>
          <span>Preis</span>
          <span>Verfügbar</span>
          <span>Aktionen</span>
        </div>
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item-row">
            <span className="item-name">{item.name}</span>
            <span className="item-description">{item.description}</span>
            <span className="item-category">
              {item.category === 'pizzeria' && 'Pizzeria'}
              {item.category === 'pub-trinken' && 'Pub Trinken'}
              {item.category === 'pub-essen' && 'Pub Essen'}
            </span>
            <span className="item-category">{item.mealType}</span>
            <span className="item-price">{item.price.toFixed(2)} CHF</span>
            <span className="item-available">
              <button className={`btn-toggle ${item.available ? 'available' : 'unavailable'}`} onClick={() => handleToggleAvailability(item)}>
                {item.available ? 'Ja' : 'Nein'}
              </button>
            </span>
            <div className="item-actions">
              <button onClick={() => setEditingItem(item)} className="action-btn edit-btn">✏️</button>
              <button onClick={() => handleDelete(item.id)} className="action-btn delete-btn">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeisekartePanel; 