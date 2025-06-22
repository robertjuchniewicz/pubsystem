import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerMenu from './components/CustomerMenu';
import StaffPanel from './components/StaffPanel';
import AdminPanel from './components/AdminPanel';
import QRLabelGenerator from './components/QRLabelGenerator';
import Dashboard from './components/Dashboard';
import OrderHistoryComponent from './components/OrderHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/table/:tableNumber" element={<CustomerMenu />} />
          <Route path="/staff/pub" element={<StaffPanel category="pub" />} />
          <Route path="/staff/pizzeria" element={<StaffPanel category="pizzeria" />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/qr-labels" element={<QRLabelGenerator />} />
          <Route path="/history" element={<OrderHistoryComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 