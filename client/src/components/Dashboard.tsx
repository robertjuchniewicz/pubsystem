import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order, MenuItem } from '../types';

const Dashboard: React.FC = () => {
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [tableCount] = useState<number>(20);

    useEffect(() => {
        const fetchAllData = () => {
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => setActiveOrders(data.filter((o: Order) => !o.completed)))
                .catch(err => console.error("Failed to fetch orders:", err));

            fetch('/api/menu')
                .then(res => res.json())
                .then(data => setMenuItems(data))
                .catch(err => console.error("Failed to fetch menu:", err));
        }
        
        fetchAllData();
    }, []);

    const availableItemsCount = menuItems.filter(item => item.available).length;
    const categoryCount = new Set(menuItems.map(item => item.category)).size;

    const cardStyle: React.CSSProperties = {
        background: '#1e1e1e',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        textAlign: 'center',
        margin: '10px'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '1rem',
        color: '#b0b0b0'
    };

    const navLinkStyle: React.CSSProperties = {
        padding: '12px 15px',
        textDecoration: 'none',
        color: '#e0e0e0',
        borderRadius: '5px',
        marginBottom: '8px',
        background: '#2c2c2c',
        display: 'block',
        fontWeight: 'bold',
        transition: 'background 0.2s ease-in-out',
    };

    const contentStyle: React.CSSProperties = {
        padding: '20px',
        background: '#1e1e1e',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        textAlign: 'center',
        margin: '10px'
    };

    return (
        <div style={{ padding: '20px', background: '#121212', minHeight: '100vh', color: '#e0e0e0' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <img src="/logo.png" alt="Helvetia Pub & Pizzeria Logo" style={{ maxWidth: '350px', height: 'auto', marginBottom: '10px' }} />
                <h1 style={{ color: '#ffffff', fontSize: '2.5rem', margin: 0 }}>Dashboard</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ ...cardStyle, borderLeft: '5px solid #3498db' }}>
                    <div style={{ ...valueStyle, color: '#3498db' }}>{activeOrders.length}</div>
                    <div style={labelStyle}>Aktive Bestellungen</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '5px solid #2ecc71' }}>
                    <div style={{ ...valueStyle, color: '#2ecc71' }}>{availableItemsCount}</div>
                    <div style={labelStyle}>Verfügbare Artikel</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '5px solid #e74c3c' }}>
                    <div style={{ ...valueStyle, color: '#e74c3c' }}>{tableCount}</div>
                    <div style={labelStyle}>Tische</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '5px solid #9b59b6' }}>
                    <div style={{ ...valueStyle, color: '#9b59b6' }}>{categoryCount}</div>
                    <div style={labelStyle}>Kategorien</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
                <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                    <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', color: '#ffffff' }}>Navigation</h2>
                    <nav style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                        <h3 style={{ color: '#cccccc', marginTop: '0', marginBottom: '10px' }}>Bestellungen</h3>
                        <Link to="/staff/pub" style={navLinkStyle}>Pub Panel</Link>
                        <Link to="/staff/pizzeria" style={navLinkStyle}>Pizzeria Panel</Link>
                        
                        <h3 style={{ borderTop: '1px solid #333', paddingTop: '15px', marginTop: '15px', color: '#cccccc' }}>Verwaltung</h3>
                        <Link to="/speisekarte" style={navLinkStyle}>Speisekarte verwalten</Link>
                        <Link to="/qr-labels" style={navLinkStyle}>QR-Code-Tischschilder</Link>
                        <Link to="/history" style={navLinkStyle}>Bestellhistorie</Link>

                        <h3 style={{ borderTop: '1px solid #333', paddingTop: '15px', marginTop: '15px', color: '#cccccc' }}>Kunde</h3>
                        <Link to="/table/1" style={navLinkStyle}>Kunden-Bestellung (Beispiel)</Link>
                    </nav>
                </div>
                <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                    <h2 style={{color: '#ffffff'}}>Willkommen zurück!</h2>
                    <p style={{color: '#b0b0b0', lineHeight: 1.6}}>Wählen Sie eine der Optionen aus dem Menü, um fortzufahren. Hier könnten in Zukunft weitere Statistiken oder schnelle Aktionen angezeigt werden.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 