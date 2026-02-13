import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Barcode } from './pages/Barcode';
import { QRCodePage } from './pages/QRCode';
import { CashDraw } from './pages/CashDraw';
import { Sales } from './pages/Sales';
import { AddProduct } from './pages/AddProduct';
import { EditProduct } from './pages/EditProduct';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });
  const location = useLocation();

  return (
    <div className={`relative isolate min-h-screen h-auto flex flex-col lg:flex-row bg-background transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-primary" />
        <div className="ambient-orb ambient-orb-secondary" />
        <div className="ambient-orb ambient-orb-accent" />
      </div>

      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:inset-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="relative z-10 flex-1 flex flex-col overflow-visible">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Navbar />

        <div key={location.pathname} className="animate-route-in motion-reduce:animate-none">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-product/:id" element={<EditProduct />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/barcode" element={<Barcode />} />
            <Route path="/qrcode" element={<QRCodePage />} />
            <Route path="/cashdraw" element={<CashDraw />} />
            <Route path="/sales" element={<Sales />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
