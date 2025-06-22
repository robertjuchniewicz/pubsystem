import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const dashboardItems = [
    {
      id: 'orders',
      title: 'Bestellungen',
      description: 'Bestellungen überwachen und verwalten',
      icon: '📋',
      color: 'blue',
      links: [
        { name: 'PUB Bestellungen', url: '/staff/pub', color: '#4facfe' },
        { name: 'Pizzeria Bestellungen', url: '/staff/pizzeria', color: '#43e97b' }
      ]
    },
    {
      id: 'menu',
      title: 'Speisekarte verwalten',
      description: 'Preise ändern, Artikel hinzufügen/verstecken',
      icon: '🍽️',
      color: 'purple',
      links: [
        { name: 'Admin Panel öffnen', url: '/admin', color: '#fa709a' }
      ]
    },
    {
      id: 'qr',
      title: 'QR-Code-Tischaufsteller',
      description: 'QR-Code-Tischaufsteller für Tische generieren',
      icon: '📱',
      color: 'green',
      links: [
        { name: 'QR Generator öffnen', url: '/qr-labels', color: '#667eea' }
      ]
    },
    {
      id: 'customers',
      title: 'Kunden-Bestellung',
      description: 'Kundenbestellung simulieren',
      icon: '👥',
      color: 'orange',
      links: [
        { name: 'Tisch 1', url: '/table/1', color: '#ff9a56' },
        { name: 'Tisch 2', url: '/table/2', color: '#ff9a56' },
        { name: 'Tisch 3', url: '/table/3', color: '#ff9a56' },
        { name: 'Tisch 4', url: '/table/4', color: '#ff9a56' },
        { name: 'Tisch 5', url: '/table/5', color: '#ff9a56' }
      ]
    }
  ];

  const quickStats = [
    { title: 'Aktive Bestellungen', value: '3', color: '#4facfe' },
    { title: 'Verfügbare Artikel', value: '16', color: '#43e97b' },
    { title: 'Tische', value: '20', color: '#fa709a' },
    { title: 'Kategorien', value: '2', color: '#667eea' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Helvetia Pub & Pizzeria Dashboard</h1>
        <p>Zentrales Kontrollzentrum für alle Funktionen</p>
      </div>

      <div className="dashboard-stats">
        {quickStats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-title">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-nav">
          {dashboardItems.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ borderLeftColor: item.color === 'blue' ? '#4facfe' : 
                       item.color === 'purple' ? '#fa709a' : 
                       item.color === 'green' ? '#43e97b' : '#ff9a56' }}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-title">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="dashboard-main">
          {dashboardItems.map((item) => (
            <div key={item.id} className={`tab-content ${activeTab === item.id ? 'active' : ''}`}>
              <div className="tab-header">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              
              <div className="tab-links">
                {item.links.map((link, index) => (
                  <Link
                    key={index}
                    to={link.url}
                    className="dashboard-link"
                    style={{ 
                      background: `linear-gradient(135deg, ${link.color} 0%, ${link.color}dd 100%)`,
                      color: 'white'
                    }}
                    target="_blank"
                  >
                    <span className="link-icon">🔗</span>
                    <span className="link-text">{link.name}</span>
                    <span className="link-arrow">→</span>
                  </Link>
                ))}
              </div>

              {item.id === 'orders' && (
                <div className="orders-preview">
                  <h3>Live Bestellungen</h3>
                  <div className="orders-grid">
                    <div className="order-preview pub">
                      <h4>PUB</h4>
                      <div className="order-count">2 Bestellungen</div>
                      <Link to="/staff/pub" className="preview-link">Anzeigen →</Link>
                    </div>
                    <div className="order-preview pizzeria">
                      <h4>Pizzeria</h4>
                      <div className="order-count">1 Bestellung</div>
                      <Link to="/staff/pizzeria" className="preview-link">Anzeigen →</Link>
                    </div>
                  </div>
                </div>
              )}

              {item.id === 'menu' && (
                <div className="menu-preview">
                  <h3>Speisekarte Übersicht</h3>
                  <div className="menu-stats">
                    <div className="menu-stat">
                      <span className="stat-number">8</span>
                      <span className="stat-label">PUB Artikel</span>
                    </div>
                    <div className="menu-stat">
                      <span className="stat-number">8</span>
                      <span className="stat-label">Pizzeria Artikel</span>
                    </div>
                    <div className="menu-stat">
                      <span className="stat-number">16</span>
                      <span className="stat-label">Verfügbar</span>
                    </div>
                    <div className="menu-stat">
                      <span className="stat-number">0</span>
                      <span className="stat-label">Versteckt</span>
                    </div>
                  </div>
                </div>
              )}

              {item.id === 'qr' && (
                <div className="qr-preview">
                  <h3>QR-Code-Tischaufsteller Generator</h3>
                  <div className="qr-info">
                    <p>Generieren Sie QR-Code-Tischaufsteller für Ihre Tische im A6-Format.</p>
                    <ul>
                      <li>✓ Druckoptimiertes Layout</li>
                      <li>✓ Echte QR-Codes</li>
                      <li>✓ Anpassbare Tischbereiche</li>
                      <li>✓ Deutsche Beschriftungen</li>
                    </ul>
                  </div>
                </div>
              )}

              {item.id === 'customers' && (
                <div className="customers-preview">
                  <h3>Kunden-Bestellung simulieren</h3>
                  <div className="table-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((table) => (
                      <Link
                        key={table}
                        to={`/table/${table}`}
                        className="table-link"
                        target="_blank"
                      >
                        Tisch {table}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="dashboard-section">
          <h2>Verwaltung</h2>
          <div className="dashboard-links">
            <a href="/admin" className="dashboard-link admin">
              <h3>Menü verwalten</h3>
              <p>Produkte hinzufügen, bearbeiten und Preise ändern</p>
            </a>
            <a href="/qr-labels" className="dashboard-link qr">
              <h3>QR-Code-Tischschilder</h3>
              <p>QR-Codes für Tische generieren und drucken</p>
            </a>
            <a href="/history" className="dashboard-link history">
              <h3>Bestellhistorie</h3>
              <p>Abgeschlossene und stornierte Bestellungen einsehen</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 