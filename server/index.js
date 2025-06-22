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
  // Pizzeria
  { id: 1, name: 'Margherita', category: 'pizzeria', price: 8.50, available: true, description: 'Tomatensauce, Mozzarella, Basilikum' },
  { id: 2, name: 'Salami', category: 'pizzeria', price: 9.50, available: true, description: 'Tomatensauce, Mozzarella, Salami' },
  { id: 3, name: 'Prosciutto', category: 'pizzeria', price: 10.00, available: true, description: 'Tomatensauce, Mozzarella, Schinken' },
  { id: 4, name: 'Funghi', category: 'pizzeria', price: 9.00, available: true, description: 'Tomatensauce, Mozzarella, Pilze' },
  { id: 5, name: 'Hawaii', category: 'pizzeria', price: 10.50, available: false, description: 'Tomatensauce, Mozzarella, Schinken, Ananas' },

  // PUB
  { id: 11, name: 'Helles Bier', category: 'pub', price: 4.50, available: true, description: '0,5L frisch gezapft' },
  { id: 12, name: 'Dunkles Bier', category: 'pub', price: 4.50, available: true, description: '0,5L frisch gezapft' },
  { id: 13, name: 'Weizenbier', category: 'pub', price: 5.00, available: true, description: '0,5L Flasche' },
  { id: 14, name: 'Cola', category: 'pub', price: 3.00, available: true, description: '0,3L Glas' },
  { id: 15, name: 'Wasser', category: 'pub', price: 2.50, available: true, description: '0,5L Flasche' },
  { id: 16, name: 'Pommes Frites', category: 'pub', price: 4.00, available: true, description: 'mit Ketchup oder Mayo' },
  { id: 17, name: 'Nüsse', category: 'pub', price: 2.00, available: true, description: 'gesalzen' },
  { id: 18, name: 'Brezel', category: 'pub', price: 1.50, available: true, description: 'frisch gebacken' },
  { id: 19, name: 'Wein (rot/weiß)', category: 'pub', price: 5.50, available: true, description: '0,2L Glas' },
  { id: 20, name: 'Aperol Spritz', category: 'pub', price: 6.50, available: true, description: 'Der Klassiker' },
];
let orders = [];

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
  const { name, price, category, description, available } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, Preis und Kategorie sind erforderlich' });
  }
  const newItem = {
    id: menu.length > 0 ? Math.max(...menu.map(item => item.id)) + 1 : 1,
    name,
    price: parseFloat(price),
    category,
    description: description || '',
    available: available !== undefined ? available : true
  };
  menu.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, available } = req.body;
  const itemIndex = menu.findIndex(item => item.id === parseInt(id));

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Menüpunkt nicht gefunden' });
  }

  const updatedItem = {
    ...menu[itemIndex],
    name: name || menu[itemIndex].name,
    price: price ? parseFloat(price) : menu[itemIndex].price,
    category: category || menu[itemIndex].category,
    description: description !== undefined ? description : menu[itemIndex].description,
    available: available !== undefined ? available : menu[itemIndex].available
  };

  menu[itemIndex] = updatedItem;
  res.status(200).json(updatedItem);
});

app.post('/api/orders', (req, res) => {
  const { tableNumber, items } = req.body;
  if (!tableNumber || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Tischnummer und Artikel sind erforderlich' });
  }
  const newOrder = {
    id: uuidv4(),
    tableNumber,
    items,
    status: 'pending',
    createdAt: new Date()
  };
  orders.push(newOrder);
  
  // Send back a success response in the format the frontend expects
  res.status(201).json({ 
    success: true, 
    message: `Ihre Bestellung für Tisch ${tableNumber} wurde erfolgreich aufgenommen!`,
    order: newOrder 
  });
});

app.get('/api/orders', (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: 'Kategorie ist erforderlich' });
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');

  const filteredOrders = pendingOrders.map(order => {
    const itemsForCategory = order.items.filter(item => {
      const menuItem = menu.find(mi => mi.id === item.id);
      return menuItem && menuItem.category === category;
    });
    
    return {
      ...order,
      items: itemsForCategory
    };
  }).filter(order => order.items.length > 0);

  res.json(filteredOrders);
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  if (!['completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Ungültiger Status' });
  }

  orders[orderIndex].status = status;
  res.json(orders[orderIndex]);
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