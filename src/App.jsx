import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, PackageSearch, PlusCircle, BarChart3, LayoutDashboard } from 'lucide-react';
import { EstoqueProvider } from './context/EstoqueContext';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import Consulta from './components/Consulta';
import Caixa from './components/Caixa';
import Relatorios from './components/Relatorios';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/caixa', label: 'Frente de Caixa', icon: ShoppingCart },
  { to: '/consulta', label: 'Estoque', icon: PackageSearch },
  { to: '/cadastro', label: 'Novo Produto', icon: PlusCircle },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Expresso01</h2>
        <span>Gestão de Estoque</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`nav-item ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function App() {
  return (
    <EstoqueProvider>
      <BrowserRouter>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/consulta" element={<Consulta />} />
              <Route path="/caixa" element={<Caixa />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </EstoqueProvider>
  );
}

export default App;
