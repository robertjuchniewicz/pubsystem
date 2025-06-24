const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// --- Pamięć trwała (zapis do plików) ---

const DATA_DIR = path.join(__dirname, 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const HISTORY_FILE = path.join(DATA_DIR, 'orderHistory.json');
const LAST_ORDER_NUMBER_FILE = path.join(DATA_DIR, 'lastOrderNumber.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const POSTERS_FILE = path.join(DATA_DIR, 'posters.json');

let menu = [];
let orders = [];
let orderHistory = [];
let lastOrderNumber = 0;
let settings = {};
let posters = [];

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
    const parsed = JSON.parse(data);
    
    // Jeśli to settings, upewnij się że wszystkie wymagane pola są obecne
    if (filePath.includes('settings.json')) {
      return { ...defaultValue, ...parsed };
    }
    
    return parsed;
  } catch (error) {
    await writeFile(filePath, defaultValue);
    return defaultValue;
  }
}

async function writeFile(filePath, data) {
  const dir = path.dirname(filePath);
  // Użyj unikalnej nazwy pliku tymczasowego, aby uniknąć konfliktów
  const tempPath = path.join(dir, `temp_${crypto.randomBytes(6).toString('hex')}.json`);

  try {
    // 1. Upewnij się, że katalog docelowy istnieje
    await fs.mkdir(dir, { recursive: true });
    
    // 2. Zapisz dane do pliku tymczasowego
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    
    // 3. Atomowo zamień stary plik na nowy (gwarancja integralności)
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`[CRITICAL] Błąd podczas zapisu pliku ${filePath}:`, error);
    
    // W razie błędu, spróbuj usunąć plik tymczasowy
    try {
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      // Ignoruj błędy sprzątania, oryginalny błąd jest ważniejszy
    }
    
    throw error; // Rzuć błąd dalej, aby inne części aplikacji mogły zareagować
  }
}

async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
  
  menu = await readFile(MENU_FILE, defaultMenu);
  
  // Migracja danych: zmień 'pub' na 'pub-essen' lub 'pub-trinken'
  let migrationNeeded = false;
  menu.forEach(item => {
    if (item.category === 'pub') {
      item.category = item.mealType === 'drink' ? 'pub-trinken' : 'pub-essen';
      migrationNeeded = true;
    }
  });

  if (migrationNeeded) {
    console.log('[INFO] Przeprowadzam jednorazową migrację danych dla kategorii `pub`.');
    await writeFile(MENU_FILE, menu);
  }

  orders = await readFile(ORDERS_FILE, []);
  orderHistory = await readFile(HISTORY_FILE, []);
  settings = await readFile(SETTINGS_FILE, { 
    maxTables: 20,
    pizzeriaMenuEnabled: true,
    pubEssenEnabled: true,
    pubTrinkenEnabled: true,
    pubClosed: false,
    logo: ""
  }); // Domyślne ustawienia z logo
  posters = await readFile(POSTERS_FILE, []);
  console.log(`[DEBUG] Inicjalizacja: Załadowano ${orderHistory.length} zamówień do historii.`);

  // Initialize order number counter
  lastOrderNumber = await readFile(LAST_ORDER_NUMBER_FILE, 0);
  if (lastOrderNumber === 0) {
      // On first run, determine the highest existing order number
      const maxHistoryNumber = orderHistory.length > 0 ? Math.max(...orderHistory.map(o => o.orderNumber || 0)) : 0;
      const maxActiveNumber = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber || 0)) : 0;
      lastOrderNumber = Math.max(maxHistoryNumber, maxActiveNumber);
      await writeFile(LAST_ORDER_NUMBER_FILE, lastOrderNumber);
  }

  console.log('✅ Dane załadowane pomyślnie.');
}

// Routes
app.get('/api', (req, res) => {
  res.send('API verfügbar');
});

app.get('/api/menu', (req, res) => {
  let filteredMenu = menu.filter(item => item.available);
  
  // If PUB is completely closed, show no items
  if (settings.pubClosed === true) {
    filteredMenu = [];
  } else {
    // Normal filtering logic
    if (settings.pizzeriaMenuEnabled === false) {
      filteredMenu = filteredMenu.filter(item => item.category !== 'pizzeria');
    }
    if (settings.pubEssenEnabled === false) {
      filteredMenu = filteredMenu.filter(item => item.category !== 'pub-essen');
    }
    if (settings.pubTrinkenEnabled === false) {
      filteredMenu = filteredMenu.filter(item => item.category !== 'pub-trinken');
    }
  }
  
  res.json(filteredMenu);
});

app.get('/api/menu/all', (req, res) => {
  res.json(menu);
});

app.post('/api/menu', async (req, res) => {
  try {
    console.log('INFO: Received POST /api/menu with body:', JSON.stringify(req.body, null, 2));
    const items = Array.isArray(req.body) ? req.body : [req.body];
    
    if (items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    let lastId = menu.length > 0 ? Math.max(...menu.map(item => item.id)) : 0;
    
    const newItems = items.map(item => {
      if (!item.name || item.price == null || !item.category || !item.mealType) {
        console.error('ERROR: Validation failed for item:', item);
        throw new Error(`Validation failed. Missing required fields for an item. Received: ${JSON.stringify(item)}`);
      }
      lastId++;
      return {
        id: lastId,
        name: String(item.name),
        price: parseFloat(item.price),
        category: String(item.category),
        description: String(item.description || ''),
        mealType: String(item.mealType),
        available: item.available !== undefined ? item.available : true
      };
    });

    menu.push(...newItems);
    await writeFile(MENU_FILE, menu);
    console.log('SUCCESS: Successfully saved new items:', newItems);
    res.status(201).json(newItems);
  } catch (error) {
    console.error('ERROR: Error saving menu items:', error.message);
    res.status(500).json({ error: 'Failed to save menu items', details: error.message });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, available, mealType } = req.body;
  const itemIndex = menu.findIndex(i => i.id === parseInt(id));

  if (itemIndex > -1) {
    const updatedItem = { 
      ...menu[itemIndex], 
      name, 
      price, 
      category, 
      description, 
      available,
      mealType
    };
    menu[itemIndex] = updatedItem;
    await writeFile(MENU_FILE, menu);
    res.json(updatedItem);
  } else {
    res.status(404).json({ error: 'Produkt nicht gefunden' });
  }
});

// --- Settings Endpoints ---
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.get('/api/logo', (req, res) => {
  res.json({ logo: settings.logo || "" });
});

app.post('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    const allowedKeys = ['maxTables', 'pizzeriaMenuEnabled', 'pubEssenEnabled', 'pubTrinkenEnabled', 'pubClosed', 'logo'];
    const validatedSettings = {};

    for (const key of allowedKeys) {
      if (newSettings[key] !== undefined) {
        if (key === 'maxTables' && typeof newSettings[key] !== 'number') {
          return res.status(400).json({ error: 'maxTables must be a number.' });
        }
        if ((key === 'pizzeriaMenuEnabled' || key === 'pubEssenEnabled' || key === 'pubTrinkenEnabled' || key === 'pubClosed') && typeof newSettings[key] !== 'boolean') {
           return res.status(400).json({ error: `${key} must be a boolean.` });
        }
        if (key === 'logo' && typeof newSettings[key] !== 'string') {
          return res.status(400).json({ error: 'logo must be a string (base64 or URL).' });
        }
        validatedSettings[key] = newSettings[key];
      }
    }

    settings = { ...settings, ...validatedSettings };
    await writeFile(SETTINGS_FILE, settings);
    console.log('[INFO] Settings saved successfully:', Object.keys(validatedSettings));
    res.json(settings);
  } catch (error) {
    console.error("Error while saving settings:", error);
    res.status(500).json({ error: 'Failed to save settings.', details: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
    const { tableNumber, items } = req.body;
    
    // Server-side validation
    const num = parseInt(tableNumber || '');
    if (isNaN(num) || num < 1 || num > settings.maxTables) {
        return res.status(400).json({ success: false, message: 'Ungültige Tischnummer.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Ungültige Bestelldaten' });
    }

    lastOrderNumber++;
    if (lastOrderNumber > 9999) {
      lastOrderNumber = 1;
    }

    const newOrder = {
        id: crypto.randomUUID(),
        orderNumber: lastOrderNumber,
        tableNumber,
        items,
        createdAt: new Date().toISOString(),
        completed: false,
        status: 'pending',
        pubStatus: 'pending',
        pizzeriaStatus: 'pending'
    };
    orders.push(newOrder);
    await writeFile(ORDERS_FILE, orders);
    await writeFile(LAST_ORDER_NUMBER_FILE, lastOrderNumber);
    res.status(201).json({ success: true, order: newOrder });
});

app.get('/api/orders', (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Kategorie ist erforderlich' });
  }

  const pendingOrders = orders.filter(order => !order.completed);
  
  const filteredOrders = pendingOrders.filter(order => 
    order.items.some(item => item.category === category)
  );
  
  res.json(filteredOrders);
});

app.put('/api/orders/:id/section-status', async (req, res) => {
  const { id } = req.params;
  const { section, status } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  const order = orders[orderIndex];
  
  if (section === 'pub') {
    order.pubStatus = status;
  } else if (section === 'pizzeria') {
    order.pizzeriaStatus = status;
  }
  
  await writeFile(ORDERS_FILE, orders);
  
  res.json({ success: true, order });
});

app.put('/api/orders/:id/archive', async (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    console.log(`[DEBUG] Archiwizacja: Nie znaleziono zamówienia ${id}.`);
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  const order = orders[orderIndex];

  // Check if order is fully delivered by checking section statuses
  const hasPubItems = order.items.some(item => item.category === 'pub-essen' || item.category === 'pub-trinken');
  const hasPizzeriaItems = order.items.some(item => item.category === 'pizzeria');
  
  const isPubDelivered = !hasPubItems || order.pubStatus === 'delivered';
  const isPizzeriaDelivered = !hasPizzeriaItems || order.pizzeriaStatus === 'delivered';
  
  if (!isPubDelivered || !isPizzeriaDelivered) {
    return res.status(400).json({ error: 'Es können nur vollständig ausgelieferte Bestellungen archiviert werden.' });
  }

  order.status = 'archived';
  orderHistory.push(order);
  orders.splice(orderIndex, 1);

  await writeFile(ORDERS_FILE, orders);
  await writeFile(HISTORY_FILE, orderHistory);
  
  console.log(`[DEBUG] Archiwizacja: Pomyślnie zarchiwizowano zamówienie ${id}. Nowa długość historii: ${orderHistory.length}`);
  res.json({ success: true, message: 'Bestellung archiviert.' });
});

app.put('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    console.log(`[DEBUG] Anulowanie: Nie znaleziono zamówienia ${id}.`);
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  const orderToMove = { ...orders[orderIndex] }; // Create a safe copy
  orderToMove.status = 'canceled';
  orderToMove.completed = true;
  orderToMove.canceledAt = new Date().toISOString();

  console.log(`[DEBUG] Anulowanie: Historia PRZED: ${orderHistory.length}`);
  orderHistory.unshift(orderToMove);
  console.log(`[DEBUG] Anulowanie: Historia PO: ${orderHistory.length}. Dodano:`, orderToMove);
  orders.splice(orderIndex, 1);

  await writeFile(ORDERS_FILE, orders);
  await writeFile(HISTORY_FILE, orderHistory);
  console.log(`[DEBUG] Anulowanie: Zapisano ${orderHistory.length} zamówień w pliku historii.`);

  res.json({ success: true, message: 'Bestellung storniert.' });
});

app.get('/api/orders/history', (req, res) => {
  try {
    const sortedHistory = [...orderHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedHistory);
  } catch (error) {
    console.error("Fehler beim Abrufen der Bestellhistorie:", error);
    res.status(500).json({ error: 'Fehler beim Laden der Historie.' });
  }
});

app.post('/api/orders/archive-delivered', async (req, res) => {
    const ordersToKeep = [];
    const ordersToArchive = [];

    for (const order of orders) {
        const hasPubItems = order.items.some(item => item.category === 'pub-essen' || item.category === 'pub-trinken');
        const hasPizzeriaItems = order.items.some(item => item.category === 'pizzeria');
        
        const isPubDelivered = !hasPubItems || order.pubStatus === 'delivered';
        const isPizzeriaDelivered = !hasPizzeriaItems || order.pizzeriaStatus === 'delivered';
        
        if (isPubDelivered && isPizzeriaDelivered) {
            const orderToMove = { ...order }; // Create a safe copy
            orderToMove.status = 'completed';
            orderToMove.completed = true;
            orderToMove.deliveredAt = new Date().toISOString();
            ordersToArchive.push(orderToMove);
        } else {
            ordersToKeep.push(order);
        }
    }

    if (ordersToArchive.length > 0) {
        orderHistory.unshift(...ordersToArchive.reverse());
        
        // Correctly modify the global 'orders' array
        orders.length = 0;
        orders.push(...ordersToKeep);

        await writeFile(ORDERS_FILE, orders);
        await writeFile(HISTORY_FILE, orderHistory);

        res.json({ success: true, message: `${ordersToArchive.length} Bestellungen archiviert.` });
    } else {
        res.json({ success: false, message: 'Keine vollständig ausgelieferten Bestellungen zum Archivieren gefunden.' });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const itemIndex = menu.findIndex(i => i.id === parseInt(id));

  if (itemIndex > -1) {
    menu.splice(itemIndex, 1);
    await writeFile(MENU_FILE, menu);
    res.status(204).send(); // No Content
  } else {
    res.status(404).json({ error: 'Produkt nicht gefunden' });
  }
});

app.put('/api/orders/:id/complete', (req, res) => {
    const { id } = req.params;
    // ... existing code ...
});

// --- Poster Endpoints ---
app.get('/api/posters', (req, res) => {
    res.json(posters);
});

app.post('/api/posters', async (req, res) => {
    const newPoster = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
    posters.unshift(newPoster); // Add to the beginning of the array
    await writeFile(POSTERS_FILE, posters);
    res.status(201).json({ success: true, poster: newPoster });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  // Try multiple possible paths for the React build
  const possiblePaths = [
    path.join(__dirname, '../client/build/index.html'),
    path.join(__dirname, 'client/build/index.html'),
    path.join(__dirname, 'build/index.html')
  ];
  
  let fileSent = false;
  
  for (const clientBuildPath of possiblePaths) {
    try {
      if (require('fs').existsSync(clientBuildPath)) {
        res.sendFile(clientBuildPath, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            if (!fileSent) {
              res.status(500).send('Fehler beim Laden der Anwendung.');
            }
          }
        });
        fileSent = true;
        break;
      }
    } catch (error) {
      console.error('Error checking file path:', error);
    }
  }
  
  if (!fileSent) {
    console.error('Could not find React build files. Available paths checked:', possiblePaths);
    res.status(500).send('Anwendung nicht gefunden. Bitte stellen Sie sicher, dass die Anwendung korrekt gebaut wurde.');
  }
});

initializeData().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server läuft auf Port ${port}`);
    console.log(`   Frontend verfügbar unter der Haupt-URL`);
    console.log(`   API verfügbar unter /api`);
  });
}).catch(err => {
  console.error("❌ Błąd inicjalizacji serwera:", err);
  process.exit(1);
});