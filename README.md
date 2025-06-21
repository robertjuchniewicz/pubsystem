# Helvetia Pub & Pizzeria - Online Bestellsystem

Ein vollständig funktionales Online-Bestellsystem für ein kombiniertes Gastronomiebetrieb bestehend aus einem PUB und einer Pizzeria.

## Features

### Kundeninterface
- **QR-Code basierte Bestellung**: Kunden scannen einen QR-Code an ihrem Tisch (z.B. `/table/7`)
- **Einheitliche Speisekarte**: Alle Produkte werden in einer einzigen, benutzerfreundlichen Oberfläche angezeigt
- **Echtzeit-Bestellung**: Kunden können beliebige Kombinationen von PUB- und Pizzeria-Produkten bestellen
- **Automatische Tischzuordnung**: Bestellungen werden automatisch der richtigen Tischnummer zugeordnet
- **Bestätigung**: Kunden erhalten eine Bestätigung mit Tischnummer und Abholhinweis

### Personalinterface
- **Getrennte Ansichten**: 
  - PUB-Panel für Bar-Artikel (Bier, Toasts, Pommes) - **Blaue Farbkodierung**
  - Pizzeria-Panel für Küchenartikel (Pizza, Pasta, Salate, Suppen) - **Grüne Farbkodierung**
- **Echtzeit-Updates**: Automatische Überprüfung neuer Bestellungen alle 5 Sekunden
- **Optionale Tonbenachrichtigungen**: Akustische Warnung bei neuen Bestellungen
- **Bestellungsverwaltung**: Markieren als fertig oder löschen von Bestellungen

### Technische Features
- **Responsive Design**: Optimiert für Tablets und mobile Geräte
- **Deutsche Benutzeroberfläche**: Vollständig auf Deutsch
- **Keine Online-Zahlungen**: Bestellungen werden persönlich abgeholt
- **Moderne UI**: Sauberes, modernes und benutzerfreundliches Design

## Installation

### Voraussetzungen
- Node.js (Version 14 oder höher)
- npm oder yarn

### Setup

1. **Repository klonen und Abhängigkeiten installieren:**
```bash
git clone <repository-url>
cd helvetiapuborder
npm run install-all
```

2. **Entwicklungsserver starten:**
```bash
npm run dev
```

Dies startet sowohl den Backend-Server (Port 3001) als auch den Frontend-Entwicklungsserver (Port 3000).

### Produktions-Build

```bash
npm run build
```

## Verwendung

### Kundenbestellung
1. Kunden scannen den QR-Code an ihrem Tisch
2. Die URL führt zu `/table/{tischnummer}` (z.B. `/table/7`)
3. Kunden wählen Produkte aus der einheitlichen Speisekarte
4. Bestellung wird aufgegeben und automatisch aufgeteilt

### Personalzugang
- **PUB-Panel**: `http://localhost:3000/staff/pub`
- **Pizzeria-Panel**: `http://localhost:3000/staff/pizzeria`

### API-Endpunkte

- `GET /api/menu` - Speisekarte abrufen
- `POST /api/orders` - Neue Bestellung aufgeben
- `GET /api/orders?category=pub` - PUB-Bestellungen abrufen
- `GET /api/orders?category=pizzeria` - Pizzeria-Bestellungen abrufen
- `PUT /api/orders/:id/status` - Bestellungsstatus aktualisieren
- `DELETE /api/orders/:id` - Bestellung löschen

## Speisekarte

### PUB-Artikel (Blaue Farbkodierung)
- Helles Bier (€6.50)
- Dunkles Bier (€6.50)
- Weißbier (€7.00)
- Pommes Frites (€8.50)
- Toast Hawaii (€12.00)
- Bratwurst (€11.00)
- Cola (€4.50)
- Apfelsaft (€4.00)

### Pizzeria-Artikel (Grüne Farbkodierung)
- Margherita (€16.00)
- Salami (€18.00)
- Hawaii (€19.00)
- Quattro Stagioni (€21.00)
- Spaghetti Bolognese (€15.00)
- Spaghetti Carbonara (€16.00)
- Caesar Salat (€13.00)
- Minestrone Suppe (€8.00)

## Projektstruktur

```
helvetiapuborder/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React Komponenten
│   │   ├── types.ts        # TypeScript Interfaces
│   │   ├── App.tsx         # Hauptkomponente
│   │   └── index.tsx       # Einstiegspunkt
│   └── package.json
├── server/                 # Node.js Backend
│   ├── index.js           # Express Server
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Technologie-Stack

- **Frontend**: React 18, TypeScript, React Router
- **Backend**: Node.js, Express.js
- **Styling**: CSS3 mit modernen Flexbox/Grid Layouts
- **Datenübertragung**: RESTful API
- **Echtzeit-Updates**: Polling (5-Sekunden-Intervall)

## Anpassungen

### Speisekarte erweitern
Bearbeiten Sie die `menuItems` Array in `server/index.js`:

```javascript
let menuItems = [
  { id: 17, name: 'Neues Gericht', price: 15.00, category: 'pub', description: 'Beschreibung' },
  // ... weitere Artikel
];
```

### Polling-Intervall ändern
In `client/src/components/StaffPanel.tsx`:

```javascript
const interval = setInterval(fetchOrders, 5000); // 5 Sekunden
```

### Styling anpassen
Bearbeiten Sie `client/src/App.css` für Design-Änderungen.

## Lizenz

MIT License - Siehe LICENSE Datei für Details.

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository oder kontaktieren Sie das Entwicklungsteam. 