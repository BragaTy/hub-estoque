import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { EstoqueContext } from '../context/EstoqueContext';
import { Package, TrendingDown, AlertTriangle, DollarSign, ShoppingCart, PlusCircle, BarChart3, Clock, CalendarClock } from 'lucide-react';
import { alertasDeRuptura } from '../utils/previsao';
import { estaVencido, venceEmBreve, diasParaVencer, formatarData, estoqueAcabando } from '../utils/validade';

export default function Dashboard() {
  const { produtos, movimentacoes } = useContext(EstoqueContext);

  const totalProdutos = produtos.length;
  const totalItens = produtos.reduce((acc, p) => acc + p.quantidade, 0);
  const valorEstoque = produtos.reduce((acc, p) => acc + (p.quantidade * p.preco), 0);
  const estoqueBaixo = produtos.filter(estoqueAcabando);
  const vencidos = produtos.filter(estaVencido);
  const vencendo = produtos
    .filter(p => venceEmBreve(p, 3))
    .sort((a, b) => diasParaVencer(a.validade) - diasParaVencer(b.validade));
  const previsoes = alertasDeRuptura(produtos, movimentacoes, 7);

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const vendasMes = movimentacoes.filter(m => m.tipo === 'saida' && new Date(m.data) >= primeiroDiaMes);
  const faturamentoMes = vendasMes.reduce((acc, m) => acc + m.total, 0);

  return (
    <div className="slide-in">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Visão geral do estoque e das vendas da Expresso01.</p>

      {/* Cards de Resumo */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Package size={22} color="#2563eb" />
          </div>
          <div>
            <div className="stat-value">{totalProdutos}</div>
            <div className="stat-label">Produtos Cadastrados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <TrendingDown size={22} color="#059669" />
          </div>
          <div>
            <div className="stat-value">{totalItens}</div>
            <div className="stat-label">Unidades em Estoque</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <DollarSign size={22} color="#d97706" />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>R$ {valorEstoque.toFixed(2)}</div>
            <div className="stat-label">Valor em Estoque</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>
            <DollarSign size={22} color="#db2777" />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>R$ {faturamentoMes.toFixed(2)}</div>
            <div className="stat-label">Vendas deste Mês</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Alerta de Estoque Baixo */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#f97316" />
            <h3 style={{ fontWeight: '700', color: '#1e293b' }}>Estoque Acabando (abaixo do mínimo)</h3>
          </div>
          {estoqueBaixo.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum produto em situação crítica.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {estoqueBaixo.map(p => (
                <div key={p.codigo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.nome}</span>
                  <span className="badge badge-red">{p.quantidade} un. (mín. {p.estoque_minimo ?? 5})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas Movimentações */}
        <div className="card">
          <h3 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Últimas Saídas</h3>
          {movimentacoes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma venda registrada ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {movimentacoes.filter(m => m.tipo === 'saida').slice(0, 4).map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(m.data).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</p>
                    <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{m.itens.length} tipo(s) de produto</p>
                  </div>
                  <span style={{ fontWeight: '700', color: '#059669' }}>R$ {m.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Validade */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <CalendarClock size={20} color="#dc2626" />
          <h3 style={{ fontWeight: '700', color: '#1e293b' }}>Validade (vencidos e próximos 3 dias)</h3>
        </div>
        {vencidos.length === 0 && vencendo.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum produto vencido ou perto de vencer.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {vencidos.map(p => (
              <div key={p.codigo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.nome} — {p.quantidade} un.</span>
                <span className="badge badge-red">VENCIDO em {formatarData(p.validade)}</span>
              </div>
            ))}
            {vencendo.map(p => {
              const d = diasParaVencer(p.validade);
              return (
                <div key={p.codigo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.nome} — {p.quantidade} un.</span>
                  <span className="badge badge-yellow">{d === 0 ? 'Vence hoje' : `Vence em ${d} dia(s)`} · {formatarData(p.validade)}</span>
                </div>
              );
            })}
            {vencidos.length > 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Registre o descarte dos vencidos em <Link to="/consulta">Estoque</Link> para o relatório contabilizar a perda.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Previsão de ruptura */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Clock size={20} color="#dc2626" />
          <h3 style={{ fontWeight: '700', color: '#1e293b' }}>Previsão de Ruptura (próximos 7 dias)</h3>
        </div>
        {previsoes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Nenhum produto deve esgotar na próxima semana (com base nas vendas dos últimos 30 dias).
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {previsoes.map(p => (
              <div key={p.codigo} style={{ padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
                <strong>{p.nome}</strong> vende ~{p.mediaDia.toFixed(1)} un/dia e tem {p.quantidade} un. —{' '}
                {p.diasRestantes < 1 ? 'esgota hoje!' : `esgota em ~${Math.ceil(p.diasRestantes)} dia(s).`}{' '}
                Sugestão: repor estoque.
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atalhos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}>
        <Link to="/caixa" className="btn btn-primary btn-block" style={{ padding: '14px', fontSize: '1rem' }}>
          <ShoppingCart size={20} /> Abrir Caixa
        </Link>
        <Link to="/cadastro" className="btn btn-secondary btn-block" style={{ padding: '14px', fontSize: '1rem' }}>
          <PlusCircle size={20} /> Novo Produto
        </Link>
        <Link to="/relatorios" className="btn btn-outline btn-block" style={{ padding: '14px', fontSize: '1rem' }}>
          <BarChart3 size={20} /> Ver Relatórios
        </Link>
      </div>
    </div>
  );
}
