import React, { useState, useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';

export default function Cadastro() {
  const { addProduto, buscarProduto } = useContext(EstoqueContext);
  const [form, setForm] = useState({ codigo: '', nome: '', quantidade: '', preco: '' });
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const salvar = (e) => {
    e.preventDefault();
    const { codigo, nome, quantidade, preco } = form;
    if (!codigo || !nome || !quantidade || !preco) {
      setMsg({ texto: 'Preencha todos os campos antes de salvar.', tipo: 'danger' });
      return;
    }
    if (buscarProduto(codigo)) {
      setMsg({ texto: `Já existe um produto com o código "${codigo}".`, tipo: 'danger' });
      return;
    }
    addProduto({ codigo, nome, quantidade: Number(quantidade), preco: Number(preco) });
    setMsg({ texto: `Produto "${nome}" cadastrado com sucesso!`, tipo: 'success' });
    setForm({ codigo: '', nome: '', quantidade: '', preco: '' });
  };

  return (
    <div className="slide-in">
      <h1 className="page-title">Novo Produto</h1>
      <p className="page-subtitle">Cadastre salgados, bebidas e insumos no sistema.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        {msg.texto && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}

        <form onSubmit={salvar}>
          <div className="form-group">
            <label className="form-label">Código (interno ou de barras)</label>
            <input className="form-control" type="text" value={form.codigo} onChange={set('codigo')}
              placeholder="Ex: 10 · 21 · 100 · 7894900011517" autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Nome / Descrição do produto</label>
            <input className="form-control" type="text" value={form.nome} onChange={set('nome')}
              placeholder="Ex: Coxinha Tradicional de Frango" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantidade inicial</label>
              <input className="form-control" type="number" value={form.quantidade} onChange={set('quantidade')} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Preço de venda (R$)</label>
              <input className="form-control" type="number" step="0.01" value={form.preco} onChange={set('preco')} placeholder="0,00" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
            Salvar Produto
          </button>
        </form>
      </div>
    </div>
  );
}
