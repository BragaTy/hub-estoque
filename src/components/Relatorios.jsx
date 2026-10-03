import React, { useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, CalendarDays } from 'lucide-react';

export default function Relatorios() {
  const { movimentacoes } = useContext(EstoqueContext);

  // Filtra apenas vendas deste mes para calculo de previsao
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const diasPassadosNoMes = hoje.getDate(); // Dia atual (ex: dia 15 = 15 dias de vendas)

  const vendasDoMes = movimentacoes.filter(m => m.tipo === 'saida' && new Date(m.data) >= primeiroDiaMes);

  // Agrupa quantidades vendidas por produto
  const vendasAgrupadas = {};
  vendasDoMes.forEach(mov => {
    mov.itens.forEach(item => {
      if (!vendasAgrupadas[item.nome]) vendasAgrupadas[item.nome] = 0;
      vendasAgrupadas[item.nome] += item.quantidadeVendida;
    });
  });

  const dadosGrafico = Object.keys(vendasAgrupadas).map(nome => {
    const qtdVendida = vendasAgrupadas[nome];
    
    // Regra de três simples para previsão: Se vendeu X em Y dias, em 30 dias venderá Z.
    // Previsao = (Qtd Vendida / Dias Passados) * 30
    const previsao = Math.round((qtdVendida / diasPassadosNoMes) * 30);

    return {
      nome,
      Vendidos: qtdVendida,
      Previsao30Dias: previsao
    };
  });

  // Ordena para mostrar os mais vendidos primeiro
  dadosGrafico.sort((a, b) => b.Vendidos - a.Vendidos);

  return (
    <div className="card slide-in">
      <h2 className="header-title">Relatórios e Inteligência</h2>
      <p className="header-subtitle">Visualize as vendas do mês atual e a previsão matemática para repor estoque.</p>
      
      <div className="grid-2" style={{ marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CalendarDays size={40} color="#3b82f6" />
          <div>
            <h4 style={{ color: '#1e3a8a', margin: 0 }}>Dias Calculados</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{diasPassadosNoMes} dias</p>
            <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>Referência do mês atual</span>
          </div>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TrendingUp size={40} color="#22c55e" />
          <div>
            <h4 style={{ color: '#14532d', margin: 0 }}>Vendas Registradas</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{vendasDoMes.length} operações</p>
            <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Volume de saídas do mês</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 350, marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--secondary)' }}>Desempenho e Previsão (Próximos 30 dias)</h3>
        {dadosGrafico.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="nome" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Legend />
              <Bar dataKey="Vendidos" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vendido no Mês" />
              <Bar dataKey="Previsao30Dias" fill="#10b981" radius={[4, 4, 0, 0]} name="Previsão Final Mês" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Nenhum dado de saída registrado neste mês.
          </div>
        )}
      </div>

      <h3 style={{ marginTop: '40px', marginBottom: '16px', color: 'var(--secondary)' }}>Histórico Recente (Últimas Operações)</h3>
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table>
          <thead>
            <tr>
              <th>Data e Hora</th>
              <th>Operação</th>
              <th>Itens</th>
              <th style={{ textAlign: 'right' }}>Total Venda</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.slice(0, 10).map(m => (
              <tr key={m.id}>
                <td>{new Date(m.data).toLocaleString('pt-BR')}</td>
                <td>
                  <span className={`badge ${m.tipo === 'entrada' ? 'badge-green' : 'badge-blue'}`}>
                    {m.tipo.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontSize: '0.9rem' }}>
                  {m.itens.map(i => `${i.quantidadeVendida}x ${i.nome}`).join(', ')}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  R$ {Number(m.total).toFixed(2)}
                </td>
              </tr>
            ))}
            {movimentacoes.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhuma operação registrada ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
