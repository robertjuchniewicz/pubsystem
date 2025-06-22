import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import './DashboardLayout.css';

interface Stat {
  label: string;
  value: number;
}

const DashboardLayout: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);

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
    <div className="layout-container">
      <nav className="sidebar">
        <h1 className="sidebar-title">Helvetia</h1>
        <div className="sidebar-section">
          <h2 className="section-title">Bestellungen</h2>
          <Link to="/staff/pizzeria" className="sidebar-link external">Pizzeria-Ansicht</Link>
          <Link to="/staff/pub" className="sidebar-link external">Pub-Ansicht</Link>
        </div>
        <div className="sidebar-section">
          <h2 className="section-title">Verwaltung</h2>
          <NavLink to="/admin" className="sidebar-link">
            Menü verwalten
          </NavLink>
          <NavLink to="/qr-labels" className="sidebar-link">
            QR-Code-Tischschilder
          </NavLink>
          <NavLink to="/history" className="sidebar-link">
            Bestellhistorie
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <header className="main-header">
          <h2>Dashboard</h2>
          <p>Zentrales Kontrollzentrum für alle Funktionen</p>
        </header>
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
      </main>
    </div>
  );
};

export default DashboardLayout; 