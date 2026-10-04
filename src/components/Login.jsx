import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const entrar = (e) => {
    e.preventDefault();
    if (!login(usuario, senha)) setErro('Usuário ou senha inválidos.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form className="card slide-in" onSubmit={entrar} style={{ width: 360 }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Expresso01</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>Entre para acessar o sistema</p>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <input
          className="form-control" placeholder="Usuário" value={usuario} autoFocus
          onChange={e => { setUsuario(e.target.value); setErro(''); }}
        />
        <input
          className="form-control" type="password" placeholder="Senha" value={senha}
          style={{ marginTop: 12 }}
          onChange={e => { setSenha(e.target.value); setErro(''); }}
        />
        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
          <LogIn size={18} /> Entrar
        </button>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
          Demo: gerente / gerente123 · caixa / caixa123
        </p>
      </form>
    </div>
  );
}
