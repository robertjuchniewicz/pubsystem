const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// --- Pamięć trwała (zapis do plików) ---

const DATA_DIR = path.join(__dirname, 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const HISTORY_FILE = path.join(DATA_DIR, 'orderHistory.json');

let menu = [];
let orders = [];
let orderHistory = [];

const defaultMenu = [
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

async function readFile(filePath, defaultValue) {
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
}

async function writeFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR);
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
  
  menu = await readFile(MENU_FILE, defaultMenu);
  orders = await readFile(ORDERS_FILE, []);
  orderHistory = await readFile(HISTORY_FILE, []);
  console.log('✅ Dane załadowane pomyślnie.');
}

// Routes
app.get('/api', (req, res) => {
  res.send('API verfügbar');
});

app.get('/api/menu', (req, res) => {
  res.json(menu.filter(item => item.available));
});

app.get('/api/menu/all', (req, res) => {
  res.json(menu);
});

app.post('/api/menu', async (req, res) => {
  const { name, price, category, description } = req.body;
  const newItem = {
    id: menu.length > 0 ? Math.max(...menu.map(item => item.id)) + 1 : 1,
    name,
    price,
    category,
    description,
    available: true
  };
  menu.push(newItem);
  await writeFile(MENU_FILE, menu);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, available } = req.body;
  const itemIndex = menu.findIndex(i => i.id === parseInt(id));

  if (itemIndex > -1) {
    const updatedItem = { ...menu[itemIndex], name, price, category, description, available };
    menu[itemIndex] = updatedItem;
    await writeFile(MENU_FILE, menu);
    res.json(updatedItem);
  } else {
    res.status(404).json({ error: 'Produkt nicht gefunden' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { tableNumber, items } = req.body;
  
  console.log('--- ✅ OTRZYMANO NOWE ZAMÓWIENIE ---');
  console.log('Dane z przeglądarki:', JSON.stringify(req.body, null, 2));

  if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
    console.error('Błąd walidacji: Brak numeru stołu lub produktów.');
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
  
  console.log('Utworzony obiekt zamówienia (przed zapisem):', JSON.stringify(order, null, 2));
  
  orders.push(order);
  await writeFile(ORDERS_FILE, orders);
  console.log(`Zamówienie ${order.id} zapisane. Liczba aktywnych zamówień: ${orders.filter(o => o.status === 'pending').length}`);
  res.status(201).json({ success: true, orderId: order.id });
});

app.get('/api/orders', (req, res) => {
  const { category } = req.query;

  console.log(`\n--- 🔎 POBIERANIE ZAMÓWIEŃ DLA KATEGORII: ${category} ---`);
  console.log(`Liczba wszystkich zamówień w pamięci: ${orders.length}`);

  if (!category) {
    console.error('Błąd walidacji: Kategoria jest wymagana.');
    return res.status(400).json({ error: 'Kategorie ist erforderlich' });
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  console.log(`Znaleziono ${pendingOrders.length} oczekujących zamówień.`);

  const filteredOrders = pendingOrders.filter(order => 
    order.items.some(item => item.category === category)
  );
  
  console.log(`Po filtracji, znaleziono ${filteredOrders.length} zamówień dla tej kategorii.`