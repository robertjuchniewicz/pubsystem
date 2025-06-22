import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CustomerMenu from './components/CustomerMenu';
import StaffPanel from './components/StaffPanel';
import AdminPanel from './components/AdminPanel';
import QRLabelGenerator from './components/QRLabelGenerator';
import OrderHistoryComponent from './components/OrderHistoryComponent';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="qr-labels" element={<QRLabelGenerator />} />
            <Route path="history" element={<OrderHistoryComponent />} />
          </Route>
          
          <Route path="/table/:tableNumber" element={<CustomerMenu />} />
          <Route path="/staff/pub" element={<StaffPanel category="pub" />} />
          <Route path="/staff/pizzeria" element={<StaffPanel category="pizzeria" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 