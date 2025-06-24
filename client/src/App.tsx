import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CustomerMenu from './components/CustomerMenu';
import StaffPanel from './components/StaffPanel';
import SpeisekartePanel from './components/SpeisekartePanel';
import OrderHistory from './components/OrderHistory';
import QRLabelGenerator from './components/QRLabelGenerator';
import EventPosterGenerator from './components/EventPosterGenerator';
import Settings from './components/Settings';
import DashboardHome from './components/DashboardHome';
import DashboardLayout from './components/DashboardLayout';
import WaiterMenu from './components/WaiterMenu';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="staff/pizzeria" element={<StaffPanel category="pizzeria" />} />
              <Route path="staff/pub" element={<StaffPanel category="pub" />} />
              <Route path="waiter" element={<WaiterMenu />} />
              <Route path="speisekarte" element={<SpeisekartePanel />} />
              <Route path="history" element={<OrderHistory />} />
              <Route path="qr-labels" element={<QRLabelGenerator />} />
              <Route path="event-posters" element={<EventPosterGenerator />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/table/:tableNumber" element={<CustomerMenu />} />
          </Routes>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App; 