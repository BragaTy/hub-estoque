// Previsão de ruptura: média diária de vendas nos últimos `janelaDias` dias.
export function calcularPrevisoes(produtos, movimentacoes, janelaDias = 30) {
  const agora = Date.now();
  const inicio = agora - janelaDias * 24 * 60 * 60 * 1000;

  const vendidos = {};
  let primeiraVenda = agora;
  movimentacoes.forEach(m => {
    if (m.tipo !== 'saida') return;
    const t = new Date(m.data).getTime();
    if (t < inicio) return;
    if (t < primeiraVenda) primeiraVenda = t;
    m.itens.forEach(i => {
      vendidos[i.codigo] = (vendidos[i.codigo] || 0) + i.quantidadeVendida;
    });
  });

  // dias efetivamente observados (mínimo 1, máximo a janela)
  const diasObservados = Math.min(janelaDias, Math.max(1, Math.ceil((agora - primeiraVenda) / 86400000)));

  return produtos
    .map(p => {
      const total = vendidos[p.codigo] || 0;
      const mediaDia = total / diasObservados;
      const diasRestantes = mediaDia > 0 ? p.quantidade / mediaDia : null;
      return { ...p, mediaDia, diasRestantes };
    })
    .filter(p => p.diasRestantes !== null);
}

export function alertasDeRuptura(produtos, movimentacoes, limiteDias = 7) {
  return calcularPrevisoes(produtos, movimentacoes)
    .filter(p => p.diasRestantes <= limiteDias)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}
