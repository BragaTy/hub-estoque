import React, { useState, useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { Trash2, Pencil, Check, X, PackageMinus } from 'lucide-react';
import { diasParaVencer, estaVencido, venceEmBreve, estoqueAcabando, formatarData } from '../utils/validade';

const inputPeq = { padding: '6px 10px', fontSize: '0.9rem' };

export default function Consulta() {
  const { produtos, removeProduto, editProduto, registrarPerda } = useContext(EstoqueContext);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});

  const iniciarEdicao = (p) => {
    setEditando(p.codigo);
    setEditForm({
      nome: p.nome,
      quantidade: p.quantidade,
      preco: p.preco,
      preco_custo: p.preco_custo ?? 0,
      estoque_minimo: p.estoque_minimo ?? 5,
      validade: p.validade ? String(p.validade).slice(0, 10) : '',
    });
  };

  const salvarEdicao = (codigo) => {
    editProduto(codigo, {
      nome: editForm.nome,
      quantidade: Number(editForm.quantidade),
      preco: Number(editForm.preco),
      preco_custo: Number(editForm.preco_custo || 0),
      estoque_minimo: Number(editForm.estoque_minimo || 0),
      validade: editForm.validade || null,
    });
    setEditando(null);
  };

  const excluir = (codigo, nome) => {
    if (window.confirm(`Apagar "${nome}" permanentemente?`)) removeProduto(codigo);
  };

  const descartar = (p) => {
    if (p.quantidade <= 0) { alert('Este produto não tem estoque para descartar.'); return; }
    const resposta = window.prompt(
      `Descartar quantas unidades de "${p.nome}"? (em estoque: ${p.quantidade})`,
      String(p.quantidade)
    );
    if (resposta === null) return;
    const qtd = Number(resposta);
    if (!Number.isInteger(qtd) || qtd <= 0 || qtd > p.quantidade) {
      alert('Quantidade inválida.');
      return;
    }
    const motivo = estaVencido(p) ? 'Vencimento' : (window.prompt('Motivo do descarte:', 'Vencimento') || 'Descarte');
    registrarPerda(p.codigo, qtd, motivo);
  };

  const set = (campo) => (e) => setEditForm(f => ({ ...f, [campo]: e.target.value }));

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    String(p.codigo).includes(busca)
  );

  const badgeValidade = (p) => {
    const d = diasParaVencer(p.validade);
    if (d === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    if (d < 0) return <span className="badge badge-red">Vencido ({formatarData(p.validade)})</span>;
    if (venceEmBreve(p)) return <span className="badge badge-yellow">{d === 0 ? 'Vence hoje' : `${d} dia(s)`} · {formatarData(p.validade)}</span>;
    return <span className="badge badge-green">{formatarData(p.validade)}</span>;
  };

  return (
    <div className="slide-in">
      <h1 className="page-title">Consulta de Estoque</h1>
      <p className="page-subtitle">{produtos.length} produto(s) cadastrado(s). Edite, descarte ou remova conforme necessário.</p>

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
                <th>Mínimo</th>
                <th>Venda (R$)</th>
                <th>Custo (R$)</th>
                <th>Validade</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.codigo}>
                  <td><span className="badge badge-blue">{p.codigo}</span></td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" style={inputPeq} value={editForm.nome} onChange={set('nome')} />
                      : <strong>{p.nome}</strong>
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="number" style={{ width: 80, ...inputPeq }} value={editForm.quantidade} onChange={set('quantidade')} />
                      : <span className={`badge ${estoqueAcabando(p) ? 'badge-red' : 'badge-green'}`}>
                          {p.quantidade} un.{estoqueAcabando(p) ? ' · acabando' : ''}
                        </span>
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="number" min="0" style={{ width: 70, ...inputPeq }} value={editForm.estoque_minimo} onChange={set('estoque_minimo')} />
                      : p.estoque_minimo ?? 5
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="number" step="0.01" style={{ width: 90, ...inputPeq }} value={editForm.preco} onChange={set('preco')} />
                      : `R$ ${Number(p.preco).toFixed(2)}`
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="number" step="0.01" style={{ width: 90, ...inputPeq }} value={editForm.preco_custo} onChange={set('preco_custo')} />
                      : `R$ ${Number(p.preco_custo || 0).toFixed(2)}`
                    }
                  </td>

                  <td>
                    {editando === p.codigo
                      ? <input className="form-control" type="date" style={{ width: 150, ...inputPeq }} value={editForm.validade} onChange={set('validade')} />
                      : badgeValidade(p)
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
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => descartar(p)} title="Registrar perda/descarte"><PackageMinus size={15} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => excluir(p.codigo, p.nome)} title="Apagar"><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
