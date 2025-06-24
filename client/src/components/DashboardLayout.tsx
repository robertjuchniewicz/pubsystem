import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

interface Stat {
  label: string;
  value: number;
}

const DashboardLayout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const { settings } = useSettings();

  const handleLinkClick = () => {
    setSidebarVisible(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats([
          { label: 'Aktive Bestellungen', value: data.activeOrders },
          { label: 'Verfügbare Artikel', value: data.availableItems },
          { label: 'Besetzte Tische', value: data.activeTables },
          { label: 'Kategorien', value: data.categories },
        ]);
      } catch (error) {
        console.error("Fehler beim Laden der Statistiken:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh stats every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`layout-container ${sidebarVisible ? 'sidebar-visible' : ''}`}>
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        {sidebarVisible ? '✖' : '☰'}
      </button>
      
      {/* Mobile Overlay */}
      {sidebarVisible && (
        <div 
          className="sidebar-overlay active" 
          onClick={() => setSidebarVisible(false)}
        />
      )}
      
      <nav className="sidebar">
        <div className="sidebar-header">
          {settings.logo ? (
            <img src={settings.logo} alt="Helvetia Logo" className="sidebar-logo" />
          ) : (
            <img src="/logos_combined_with_white_x.png" alt="Helvetia Logo" className="sidebar-logo" />
          )}
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-section">
            <h3 className="menu-section-title">Bestellungen</h3>
            <div className="menu-tiles">
              <NavLink to="/waiter" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">🍽️</div>
                <div className="tile-content">
                  <h4>Kellner</h4>
                  <p>Bestellung aufgeben</p>
                </div>
              </NavLink>
              <NavLink to="/staff/pizzeria" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">🍕</div>
                <div className="tile-content">
                  <h4>Pizzeria</h4>
                  <p>Küchen-Bestellungen</p>
                </div>
              </NavLink>
              <NavLink to="/staff/pub" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">🍺</div>
                <div className="tile-content">
                  <h4>Pub</h4>
                  <p>Bar-Bestellungen</p>
                </div>
              </NavLink>
            </div>
          </div>

          <div className="menu-section">
            <h3 className="menu-section-title">Verwaltung</h3>
            <div className="menu-tiles">
              <NavLink to="/speisekarte" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">📝</div>
                <div className="tile-content">
                  <h4>Speisekarte</h4>
                  <p>Verwalten</p>
                </div>
              </NavLink>
              <NavLink to="/history" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">📊</div>
                <div className="tile-content">
                  <h4>Historie</h4>
                  <p>Bestellungen</p>
                </div>
              </NavLink>
              <NavLink to="/settings" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">⚙️</div>
                <div className="tile-content">
                  <h4>Einstellungen</h4>
                  <p>System verwalten</p>
                </div>
              </NavLink>
            </div>
          </div>

          <div className="menu-section">
            <h3 className="menu-section-title">Generatoren</h3>
            <div className="menu-tiles">
              <NavLink to="/qr-labels" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">📱</div>
                <div className="tile-content">
                  <h4>QR-Codes</h4>
                  <p>Generieren</p>
                </div>
              </NavLink>
              <NavLink to="/event-posters" className="menu-tile" onClick={handleLinkClick}>
                <div className="tile-icon">🎨</div>
                <div className="tile-content">
                  <h4>Plakate</h4>
                  <p>Veranstaltungen</p>
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="content-wrapper">
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="content-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 