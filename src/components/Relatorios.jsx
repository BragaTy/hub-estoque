import React, { useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, CalendarDays, ShoppingCart, FileSpreadsheet, FileText } from 'lucide-react';
import { baixarCSV, imprimirPDF } from '../utils/exportar';

export default function Relatorios() {
  const { movimentacoes } = useContext(EstoqueContext);

  const cabecalhoExport = ['Data e Hora', 'Tipo', 'Itens', 'Total (R$)'];
  const linhasExport = () => movimentacoes.map(m => [
    new Date(m.data).toLocaleString('pt-BR'),
    m.tipo.toUpperCase(),
    m.itens.map(i => `${i.quantidadeVendida}x ${i.nome}`).join(', '),
    Number(m.total).toFixed(2).replace('.', ','),
  ]);
  const exportarCSV = () => baixarCSV('historico-operacoes.csv', cabecalhoExport, linhasExport());
  const exportarPDF = () => imprimirPDF('Expresso01 - Histórico de Operações', cabecalhoExport, linhasExport());

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const diasPassados = hoje.getDate();

  const vendasDoMes = movimentacoes.filter(m => m.tipo === 'saida' && new Date(m.data) >= primeiroDiaMes);
  const faturamentoTotal = vendasDoMes.reduce((acc, m) => acc + m.total, 0);

  // Agrupa quantidades por produto
  const agrupado = {};
  vendasDoMes.forEach(m => {
    m.itens.forEach(item => {
      if (!agrupado[item.nome]) agrupado[item.nome] = 0;
      agrupado[item.nome] += item.quantidadeVendida;
    });
  });

  const dadosProdutos = Object.keys(agrupado)
    .map(nome => ({
      nome: nome.length > 18 ? nome.slice(0, 16) + '…' : nome,
      Vendidos: agrupado[nome],
      Previsao: Math.round((agrupado[nome] / diasPassados) * 30),
    }))
    .sort((a, b) => b.Vendidos - a.Vendidos);

  // Agrupa faturamento por dia (para gráfico de linha)
  const porDia = {};
  vendasDoMes.forEach(m => {
    const dia = new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    porDia[dia] = (porDia[dia] || 0) + m.total;
  });
  const dadosDia = Object.keys(porDia).map(dia => ({ dia, Faturamento: Number(porDia[dia].toFixed(2)) }));

  return (
    <div className="slide-in">
      <h1 className="page-title">Relatórios e Inteligência</h1>
      <p className="page-subtitle">Análise de vendas do mês atual com previsão para os próximos 30 dias.</p>

      {/* Resumo rápido */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}><CalendarDays size={22} color="#2563eb" /></div>
          <div>
            <div className="stat-value">{diasPassados}</div>
            <div className="stat-label">Dias no mês atual</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}><ShoppingCart size={22} color="#d97706" /></div>
          <div>
            <div className="stat-value">{vendasDoMes.length}</div>
            <div className="stat-label">Vendas registradas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}><TrendingUp size={22} color="#059669" /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>R$ {faturamentoTotal.toFixed(2)}</div>
            <div className="stat-label">Faturamento no mês</div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras - produtos */}
      <div className="card">
        <h3 style={{ fontWeight: '700', marginBottom: '20px', color: 'var(--secondary)' }}>
          Produtos Vendidos vs. Previsão para os 30 dias
        </h3>
        {dadosProdutos.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dadosProdutos} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Legend />
              <Bar dataKey="Vendidos" name="Vendidos no Mês" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Previsao" name="Previsão Final Mês" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.65} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <p>Sem dados de venda neste mês para gerar o gráfico.</p>
          </div>
        )}
      </div>

      {/* Gráfico de linha - faturamento por dia */}
      {dadosDia.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '20px', color: 'var(--secondary)' }}>
            Faturamento por Dia
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dadosDia} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={v => `R$ ${v.toFixed(2)}`} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Line type="monotone" dataKey="Faturamento" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Histórico */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontWeight: '700', color: 'var(--secondary)' }}>Histórico de Operações</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={exportarCSV} disabled={!movimentacoes.length}>
              <FileSpreadsheet size={16} /> Baixar planilha (CSV)
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={exportarPDF} disabled={!movimentacoes.length}>
              <FileText size={16} /> Salvar PDF
            </button>
          </div>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Data e Hora</th>
                <th>Tipo</th>
                <th>Itens</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.slice(0, 15).map(m => (
                <tr key={m.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(m.data).toLocaleString('pt-BR')}</td>
                  <td><span className={`badge ${m.tipo === 'entrada' ? 'badge-green' : 'badge-blue'}`}>{m.tipo.toUpperCase()}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{m.itens.map(i => `${i.quantidadeVendida}x ${i.nome}`).join(', ')}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>R$ {Number(m.total).toFixed(2)}</td>
                </tr>
              ))}
              {movimentacoes.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Nenhuma operação ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
