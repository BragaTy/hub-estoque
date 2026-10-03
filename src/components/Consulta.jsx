import React, { useState, useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { Trash2, Edit } from 'lucide-react';

export default function Consulta() {
  const { produtos, removeProduto, editProduto } = useContext(EstoqueContext);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [qtdEdit, setQtdEdit] = useState('');

  const handleDelete = (codigo, nome) => {
    if(window.confirm(`Tem certeza que deseja APAGAR o produto "${nome}" definitivamente?`)) {
      removeProduto(codigo);
    }
  };

  const handleEditClick = (p) => {
    setEditando(p.codigo);
    setQtdEdit(p.quantidade);
  };

  const saveEdit = (codigo) => {
    editProduto(codigo, { quantidade: Number(qtdEdit) });
    setEditando(null);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="card slide-in">
      <h2 className="header-title">Consulta de Estoque</h2>
      <p className="header-subtitle">Gerencie as quantidades ou remova produtos do sistema.</p>
      
      <div className="form-group" style={{ marginTop: '20px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Pesquisar por nome ou código..." 
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Estoque</th>
              <th>Preço (R$)</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map(p => (
              <tr key={p.codigo}>
                <td><span className="badge badge-blue">{p.codigo}</span></td>
                <td style={{ fontWeight: '600' }}>{p.nome}</td>
                <td>
                  {editando === p.codigo ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input type="number" className="form-control" style={{ width: '80px', padding: '6px' }} value={qtdEdit} onChange={e => setQtdEdit(e.target.value)} />
                      <button onClick={() => saveEdit(p.codigo)} className="btn btn-success" style={{ padding: '6px 12px' }}>Salvar</button>
                    </div>
                  ) : (
                    <span className={`badge ${p.quantidade > 0 ? 'badge-green' : 'badge-red'}`}>
                      {p.quantidade} un.
                    </span>
                  )}
                </td>
                <td>{Number(p.preco).toFixed(2)}</td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEditClick(p)} className="btn btn-outline btn-icon" title="Editar Quantidade">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(p.codigo, p.nome)} className="btn btn-danger btn-icon" title="Apagar Produto">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {produtosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhum produto encontrado. Cadastre itens primeiro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
