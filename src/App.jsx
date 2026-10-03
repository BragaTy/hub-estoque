import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PackageSearch, PlusCircle, ShoppingCart, BarChart3, Store } from 'lucide-react';
import { EstoqueProvider } from './context/EstoqueContext';
import Cadastro from './components/Cadastro';
import Consulta from './components/Consulta';
import Caixa from './components/Caixa';
import Relatorios from './components/Relatorios';

function Navigation() {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <div className="navbar">
      <Link to="/" className="btn btn-outline">Início</Link>
      <Link to="/cadastro" className={`btn ${location.pathname === '/cadastro' ? 'btn-primary' : 'btn-outline'}`}>Cadastro</Link>
      <Link to="/consulta" className={`btn ${location.pathname === '/consulta' ? 'btn-primary' : 'btn-outline'}`}>Estoque</Link>
      <Link to="/caixa" className={`btn ${location.pathname === '/caixa' ? 'btn-primary' : 'btn-outline'}`}>Frente de Caixa</Link>
    </div>
  );
}

function Home() {
  return (
    <div className="card text-center slide-in">
      <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#f59e0b', margin: '0 auto 20px' }}>
        <Store size={48} />
      </div>
      <h1 className="header-title">Expresso01</h1>
      <p className="header-subtitle">Gestão de Estoque e Vendas</p>
      
      <div className="grid-cards">
        <Link to="/caixa" className="action-card">
          <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
            <ShoppingCart size={32} />
          </div>
          <h3>Frente de Caixa</h3>
          <p>Adicione vários itens ao carrinho e dê baixa de uma vez.</p>
        </Link>

        <Link to="/consulta" className="action-card">
          <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#a855f7' }}>
            <PackageSearch size={32} />
          </div>
          <h3>Estoque</h3>
          <p>Consulte, edite ou apague produtos do sistema.</p>
        </Link>
        
        <Link to="/cadastro" className="action-card">
          <div className="icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
            <PlusCircle size={32} />
          </div>
          <h3>Novo Produto</h3>
          <p>Cadastre salgados, bebidas e novos insumos.</p>
        </Link>

        <Link to="/relatorios" className="action-card">
          <div className="icon-wrapper" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}>
            <BarChart3 size={32} />
          </div>
          <h3>Relatórios e Previsão</h3>
          <p>Veja o histórico e o cálculo de previsão para o próximo mês.</p>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <EstoqueProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/consulta" element={<Consulta />} />
            <Route path="/caixa" element={<Caixa />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </div>
      </BrowserRouter>
    </EstoqueProvider>
  );
}

export default App;
