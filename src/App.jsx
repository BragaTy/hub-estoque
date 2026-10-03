import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ShoppingCart, PackageSearch, PlusCircle, BarChart3, LayoutDashboard, LogOut } from 'lucide-react';
import { EstoqueProvider } from './context/EstoqueContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import Consulta from './components/Consulta';
import Caixa from './components/Caixa';
import Relatorios from './components/Relatorios';
import Login from './components/Login';

// perfis: quem pode ver cada item
const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, perfis: ['gerente'] },
  { to: '/caixa', label: 'Frente de Caixa', icon: ShoppingCart, perfis: ['gerente', 'caixa'] },
  { to: '/consulta', label: 'Estoque', icon: PackageSearch, perfis: ['gerente'] },
  { to: '/cadastro', label: 'Novo Produto', icon: PlusCircle, perfis: ['gerente'] },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, perfis: ['gerente'] },
];

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Expresso01</h2>
        <span>Gestão de Estoque</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.filter(i => i.perfis.includes(user.perfil)).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`nav-item ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <button type="button" className="nav-item" onClick={logout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <LogOut size={18} />
          Sair ({user.nome})
        </button>
      </nav>
    </aside>
  );
}

// Redireciona o perfil sem permissão para a tela de caixa
function Protegida({ perfis, children }) {
  const { user } = useAuth();
  return perfis.includes(user.perfil) ? children : <Navigate to="/caixa" replace />;
}

function Conteudo() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <EstoqueProvider>
      <HashRouter>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Protegida perfis={['gerente']}><Dashboard /></Protegida>} />
              <Route path="/cadastro" element={<Protegida perfis={['gerente']}><Cadastro /></Protegida>} />
              <Route path="/consulta" element={<Protegida perfis={['gerente']}><Consulta /></Protegida>} />
              <Route path="/caixa" element={<Caixa />} />
              <Route path="/relatorios" element={<Protegida perfis={['gerente']}><Relatorios /></Protegida>} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </EstoqueProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  );
}

export default App;
