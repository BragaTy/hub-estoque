import React, { createContext, useState, useContext } from 'react';

// Autenticação local simples (sem backend). Para produção, trocar por Firebase Auth.
const USUARIOS = [
  { usuario: 'gerente', senha: 'gerente123', perfil: 'gerente', nome: 'Gerente' },
  { usuario: 'caixa', senha: 'caixa123', perfil: 'caixa', nome: 'Operador de Caixa' },
];

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('hub-user')); } catch { return null; }
  });

  const login = (usuario, senha) => {
    const u = USUARIOS.find(x => x.usuario === usuario.trim().toLowerCase() && x.senha === senha);
    if (!u) return false;
    const sessao = { usuario: u.usuario, perfil: u.perfil, nome: u.nome };
    sessionStorage.setItem('hub-user', JSON.stringify(sessao));
    setUser(sessao);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem('hub-user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
