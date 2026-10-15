import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Mostra o erro na tela (em vez de tela branca) e permite limpar o cache local.
class ErrorBoundary extends React.Component {
  state = { erro: null };
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro, info) { console.error('Erro de renderização', erro, info); }
  limparCache = () => {
    localStorage.removeItem('hub-estoque-cache');
    window.location.reload();
  };
  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h2 style={{ color: 'crimson' }}>Algo deu errado ao exibir a tela</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f1f5f9', padding: 12, borderRadius: 8 }}>
          {String(this.state.erro?.stack || this.state.erro)}
        </pre>
        <button onClick={this.limparCache} style={{ padding: '10px 16px', marginTop: 12 }}>
          Limpar cache local e recarregar
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
