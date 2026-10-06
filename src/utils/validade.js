// Utilitários de validade. A validade é uma data 'YYYY-MM-DD' (ou vazia).
export function diasParaVencer(validade) {
  if (!validade) return null;
  const [a, m, d] = String(validade).slice(0, 10).split('-').map(Number);
  const venc = new Date(a, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((venc - hoje) / 86400000);
}

export const estaVencido = (p) => {
  const d = diasParaVencer(p.validade);
  return d !== null && d < 0;
};

export const venceEmBreve = (p, limite = 3) => {
  const d = diasParaVencer(p.validade);
  return d !== null && d >= 0 && d <= limite;
};

export const formatarData = (validade) => {
  if (!validade) return '—';
  const [a, m, d] = String(validade).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
};

export const estoqueAcabando = (p) => p.quantidade <= (p.estoque_minimo ?? 5);

export const FORMAS_PAGAMENTO = [
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'pix', label: 'Pix' },
  { id: 'cartao', label: 'Cartão' },
];

export const nomePagamento = (id) => FORMAS_PAGAMENTO.find(f => f.id === id)?.label || '—';
