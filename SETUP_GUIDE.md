# Helvetia Pub & Pizzeria - Schnellstart Anleitung

## 🚀 Anwendung ist bereit!

Die Online-Bestellungsanwendung läuft erfolgreich auf Ihrem System.

### Zugangslinks

**Kunden-Bestellung:**
- Beispiel für Tisch 7: http://localhost:3000/table/7
- QR-Code Generator: Öffnen Sie `qr-generator.html` in Ihrem Browser

**Personal-Panels:**
- PUB Panel: http://localhost:3000/staff/pub
- Pizzeria Panel: http://localhost:3000/staff/pizzeria

**Administration:**
- Speisekarte verwalten: http://localhost:3000/speisekarte
- QR Etykietki Generator: http://localhost:3000/qr-labels

### So testen Sie die Anwendung:

1. **Kundenbestellung simulieren:**
   - Öffnen Sie http://localhost:3000/table/7 in einem Browser-Tab
   - Wählen Sie Produkte aus der Speisekarte
   - Geben Sie eine Bestellung auf

2. **Personal-Panels überwachen:**
   - Öffnen Sie http://localhost:3000/staff/pub in einem Tab
   - Öffnen Sie http://localhost:3000/staff/pizzeria in einem anderen Tab
   - Beobachten Sie, wie Bestellungen automatisch erscheinen
   - Aktivieren Sie die Tonbenachrichtigungen

3. **Speisekarte verwalten:**
   - Öffnen Sie http://localhost:3000/speisekarte
   - Bearbeiten Sie Preise und Beschreibungen
   - Verstecken Sie nicht verfügbare Artikel
   - Fügen Sie neue Menüpunkte hinzu

4. **QR Etykietki generieren:**
   - Öffnen Sie http://localhost:3000/qr-labels
   - Wählen Sie den Bereich der Tische
   - Generieren Sie QR-Codes für Ihre Tische
   - Drucken Sie die Etykietki aus

### Features im Überblick:

✅ **Kundeninterface:**
- Einheitliche Speisekarte für PUB und Pizzeria
- Automatische Tischzuordnung
- Bestellbestätigung

✅ **Personalinterface:**
- Getrennte PUB- und Pizzeria-Panels
- Blaue Farbkodierung für PUB-Artikel
- Grüne Farbkodierung für Pizzeria-Artikel
- Echtzeit-Updates alle 5 Sekunden
- Optionale Tonbenachrichtigungen

✅ **Administration:**
- Speisekarte verwalten: http://localhost:3000/speisekarte
- Preis- und Beschreibungsediting
- Artikel verfügbar/verstecken
- Neue Menüpunkte hinzufügen
- Artikel löschen

✅ **QR Etykietki Generator:**
- A6-Format Etykietki für Tische
- Echte QR-Codes mit Bibliothek
- Druckoptimiertes Layout
- Anpassbare Tischbereiche

✅ **Technische Features:**
- Responsive Design für Tablets/Mobile
- Vollständig auf Deutsch
- Keine Online-Zahlungen erforderlich
- Moderne, benutzerfreundliche Oberfläche

### Server-Status:
- Backend (API): http://localhost:3001 ✅ Läuft
- Frontend (React): http://localhost:3000 ✅ Läuft

### Neue API-Endpunkte:

**Speisekartenverwaltung:**
- `GET /api/menu/speisekarte` - Alle Menüpunkte (inkl. versteckte)
- `POST /api/menu` - Neuen Menüpunkt hinzufügen
- `PUT /api/menu/:id` - Menüpunkt bearbeiten
- `DELETE /api/menu/:id` - Menüpunkt löschen

### Nächste Schritte:

1. **Abhängigkeiten installieren:**
   ```bash
   cd client && npm install
   ```

2. **Produktionsumgebung einrichten:**
   ```bash
   npm run build
   ```

3. **Domain konfigurieren:**
   - Ersetzen Sie `localhost:3000` durch Ihre Domain
   - Aktualisieren Sie die QR-Codes entsprechend

4. **Speisekarte anpassen:**
   - Verwenden Sie das Speisekarte-Panel unter `/speisekarte`
   - Oder bearbeiten Sie `server/index.js` für neue Artikel

5. **QR Etykietki drucken:**
   - Gehen Sie zu `/qr-labels`
   - Wählen Sie Ihre Tischbereiche
   - Drucken Sie die Etykietki aus

### Support:
Bei Fragen oder Problemen konsultieren Sie die vollständige Dokumentation in `README.md`.

**Viel Erfolg mit Ihrem neuen Online-Bestellsystem! 🍺🍕** 