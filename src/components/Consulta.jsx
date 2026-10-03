import React, { useState, useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { Trash2, Pencil, Check, X } from 'lucide-react';

export default function Consulta() {
  const { produtos, removeProduto, editProduto } = useContext(EstoqueContext);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});

  const iniciarEdicao = (p) => {
    setEditando(p.codigo);
    setEditForm({ nome: p.nome, quantidade: p.quantidade, preco: p.preco });
  };

  const salvarEdicao = (codigo) => {
    editProduto(codigo, {
      nome: editForm.nome,
      quantidade: Number(editForm.quantidade),
      preco: Number(editForm.preco),
    });
    setEditando(null);
  };

  const excluir = (codigo, nome) => {
    if (window.confirm(`Apagar "${nome}" permanentemente?`)) removeProduto(codigo);
  };

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    String(p.codigo).includes(busca)
  );

  return (
    <div className="slide-in">
      <h1 className="page-title">Consulta de Estoque</h1>
      <p className="page-subtitle">{produtos.length} produto(s) cadastrado(s). Edite ou remova conforme necessário.</p>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Pesquisar por nome ou código..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Qtd. em estoque</th>
                <th>Preço (R$)</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.codigo}>
                  <td><span className="badge badge-blue">{p.codigo}</span></td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" style={{ padding: '6px 10px', fontSize: '0.9rem' }} value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
                      : <strong>{p.nome}</strong>
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="number" style={{ width: 80, padding: '6px 10px', fontSize: '0.9rem' }} value={editForm.quantidade} onChange={e => setEditForm(f => ({ ...f, quantidade: e.target.value }))} />
                      : <span className={`badge ${p.quantidade <= 5 ? 'badge-red' : p.quantidade <= 15 ? 'badge-yellow' : 'badge-green'}`}>{p.quantidade} un.</span>
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="number" step="0.01" style={{ width: 90, padding: '6px 10px', fontSize: '0.9rem' }} value={editForm.preco} onChange={e => setEditForm(f => ({ ...f, preco: e.target.value }))} />
                      : `R$ ${Number(p.preco).toFixed(2)}`
                    }
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {editando === p.codigo ? (
                        <>
                          <button className="btn btn-success btn-sm btn-icon" onClick={() => salvarEdicao(p.codigo)} title="Salvar"><Check size={16} /></button>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => setEditando(null)} title="Cancelar"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => iniciarEdicao(p)} title="Editar"><Pencil size={15} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => excluir(p.codigo, p.nome)} title="Apagar"><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
