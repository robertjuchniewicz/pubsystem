import React from 'react';
import './DashboardHome.css';

const DashboardHome: React.FC = () => {
  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h1>Willkommen im Helvetia PUB Dashboard</h1>
        <p className="welcome-description">
          Hier können Sie alle Aspekte Ihres Bestellsystems verwalten. 
          Nutzen Sie das Menü auf der linken Seite, um zu den verschiedenen Bereichen zu navigieren.
        </p>
      </div>
      
      <div className="quick-overview">
        <h2>Schnellübersicht</h2>
        <div className="overview-grid">
          <div className="overview-item">
            <a href="/waiter" className="overview-link">
                <div className="overview-icon">🍽️</div>
                <h3>Kellner</h3>
                <p>Bestellungen für Gäste aufgeben</p>
            </a>
          </div>
          <div className="overview-item">
            <a href="/staff/pizzeria" className="overview-link">
              <div className="overview-icon">🍕</div>
              <h3>Pizzeria</h3>
              <p>Küchen-Bestellungen verwalten und verfolgen</p>
            </a>
          </div>
          <div className="overview-item">
            <a href="/staff/pub" className="overview-link">
              <div className="overview-icon">🍺</div>
              <h3>Pub</h3>
              <p>Bar-Bestellungen verwalten und verfolgen</p>
            </a>
          </div>
          <div className="overview-item">
            <a href="/speisekarte" className="overview-link">
              <div className="overview-icon">⚙️</div>
              <h3>Speisekarte</h3>
              <p>Produkte hinzufügen, bearbeiten oder ausblenden</p>
            </a>
          </div>
          <div className="overview-item">
            <a href="/qr-labels" className="overview-link">
              <div className="overview-icon">📱</div>
              <h3>QR-Codes</h3>
              <p>Etiketten für die Tische generieren und drucken</p>
            </a>
          </div>
          <div className="overview-item">
            <a href="/history" className="overview-link">
              <div className="overview-icon">📊</div>
              <h3>Historie</h3>
              <p>Bestellungen ansehen und filtern</p>
            </a>
          </div>
          <div className="overview-item">
            <a href="/event-posters" className="overview-link">
              <div className="overview-icon">🎨</div>
              <h3>Plakate</h3>
              <p>Veranstaltungsplakate erstellen</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 