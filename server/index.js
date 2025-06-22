const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// In-memory data storage (should match your original, correct data structure)
let menu = [
  { id: 1, name: 'Pizza Margherita', price: 12.50, category: 'pizzeria', description: 'Tomatensauce, Mozzarella, Basilikum', available: true },
  { id: 2, name: 'Pizza Salami', price: 14.00, category: 'pizzeria', description: 'Tomatensauce, Mozzarella, Salami', available: true },
  { id: 3, name: 'Bier 0.5L', price: 4.50, category: 'pub', description: 'Helles Bier vom Fass', available: true },
  { id: 4, name: 'Wein 0.2L', price: 5.00, category: 'pub', description: 'Rotwein oder Weißwein', available: true },
  { id: 5, name: 'Cola 0.3L', price: 3.50, category: 'pub', description: 'Eisgekühlte Cola', available: true },
  { id: 6, name: 'Pizza Quattro Stagioni', price: 16.00, category: 'pizzeria', description: 'Tomatensauce, Mozzarella, Schinken, Pilze, Artischocken, Oliven', available: true },
  { id: 7, name: 'Pizza Diavola', price: 15.50, category: 'pizzeria', description: 'Tomatensauce, Mozzarella, Salami, Peperoni', available: true },
  { id: 8, name: 'Weißbier 0.5L', price: 5.00, category: 'pub', description: 'Bayerisches Weißbier', available: true },
  { id: 9, name: 'Apfelsaft 0.3L', price: 3.00, category: 'pub', description: 'Frischer Apfelsaft', available: true },
  { id: 10, name: 'Pizza Vegetariana', price: 13.50, category: 'pizzeria', description: 'Tomatensauce, Mozzarella, Paprika, Zucchini, Aubergine', available: true }
];
let orders = [];
let orderHistory = [];

// Routes
app.get('/api', (req, res) => {
  res.send('API verfügbar');
});

app.get('/api/menu', (req, res) => {
  res.json(menu.filter(item => item.available));
});

app.get('/api/menu/admin', (req, res) => {
  res.json(menu);
});

app.post('/api/menu', (req, res) => {
  const { name, price, category, description } = req.body;
  const newItem = {
    id: menu.length > 0 ? Math.max(...menu.map(item => item.id)) + 1 : 1,
    name,
    price,
    category,
    description: description || '',
    available: true
  };
  menu.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, available } = req.body;
  const itemIndex = menu.findIndex(i => i.id === parseInt(id));
  if (itemIndex > -1) {
    const updatedItem = { ...menu[itemIndex], name, price, category, description, available };
    menu[itemIndex] = updatedItem;
    res.status(200).json(updatedItem);
  } else {
    res.status(404).json({ error: 'Produkt nicht gefunden' });
  }
});

app.post('/api/orders', (req, res) => {
  const { tableNumber, items } = req.body;
  
  if (!tableNumber || !items || items.length === 0) {
    return res.status(400).json({ error: 'Tischnummer und Bestellpositionen sind erforderlich' });
  }
  
  const order = {
    id: Date.now().toString(),
    tableNumber,
    items: items.map(item => ({
      ...item,
      category: menu.find(m => m.id === item.menuItemId)?.category || 'pub'
    })),
    status: 'pending',
    createdAt: new Date().toISOString(),
    pubStatus: 'pending',
    pizzeriaStatus: 'pending'
  };
  
  orders.push(order);
  res.json({ success: true, orderId: order.id });
});

app.get('/api/orders', (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: 'Kategorie ist erforderlich' });
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');

  // Return full orders that contain at least one item for the requested category
  const filteredOrders = pendingOrders.filter(order => 
    order.items.some(item => item.category === category)
  );

  res.json(filteredOrders);
});

app.put('/api/orders/:id/section-status', (req, res) => {
  const { id } = req.params;
  const { section, status } = req.body; // section: 'pub' or 'pizzeria', status: 'ready' or 'delivered'
  
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }
  
  if (section === 'pub') {
    order.pubStatus = status;
  } else if (section === 'pizzeria') {
    order.pizzeriaStatus = status;
  }
  
  // Check if both sections are delivered, then mark as completed
  if (order.pubStatus === 'delivered' && order.pizzeriaStatus === 'delivered') {
    order.status = 'completed';
    order.deliveredAt = new Date().toISOString();
    
    // Move to history
    orderHistory.push({
      id: order.id,
      tableNumber: order.tableNumber,
      items: order.items,
      status: 'completed',
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt
    });
    
    // Remove from active orders
    orders = orders.filter(o => o.id !== id);
  }
  
  res.json({ success: true, order });
});

app.put('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }
  
  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  
  // Move to history
  orderHistory.push({
    id: order.id,
    tableNumber: order.tableNumber,
    items: order.items,
    status: 'cancelled',
    createdAt: order.createdAt,
    cancelledAt: order.cancelledAt
  });
  
  // Remove from active orders
  orders = orders.filter(o => o.id !== id);
  
  res.json({ success: true });
});

app.get('/api/orders/history', (req, res) => {
  res.json(orderHistory);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
  console.log(`API verfügbar unter http://localhost:${port}/api`);
}); 