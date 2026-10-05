import React, { createContext, useState, useEffect, useRef } from 'react';
import { supabase, supabaseConfigurado } from '../supabase';

export const EstoqueContext = createContext();

const CACHE_KEY = 'hub-estoque-cache';

const lerCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || null;
  } catch {
    return null;
  }
};

const avisarErro = (acao, error) => {
  if (error) {
    console.error(`Erro no Supabase (${acao})`, error);
    alert(`Não foi possível salvar (${acao}). Verifique a conexão.`);
  }
};

export function EstoqueProvider({ children }) {
  // Cache local: o estoque aparece na hora enquanto o Supabase responde
  const cache = lerCache();
  const [produtos, setProdutos] = useState(cache?.produtos || []);
  const [movimentacoes, setMovimentacoes] = useState(cache?.movimentacoes || []);
  const [carregando, setCarregando] = useState(!cache);

  // Referência ao estado mais recente, para calcular o que gravar no banco
  const produtosRef = useRef(produtos);
  produtosRef.current = produtos;

  const carregar = async () => {
    const [p, m] = await Promise.all([
      supabase.from('produtos').select('*').order('codigo'),
      supabase.from('movimentacoes').select('*').order('data', { ascending: false }),
    ]);
    if (p.error || m.error) {
      console.error('Erro ao carregar do Supabase', p.error || m.error);
      setCarregando(false);
      return;
    }
    setProdutos(p.data.map(x => ({
      ...x,
      quantidade: Number(x.quantidade),
      preco: Number(x.preco),
      preco_custo: Number(x.preco_custo || 0),
      estoque_minimo: Number(x.estoque_minimo ?? 5),
    })));
    setMovimentacoes(m.data.map(x => ({ ...x, total: Number(x.total), custo_total: Number(x.custo_total || 0) })));
    setCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (!carregando) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ produtos, movimentacoes }));
    }
  }, [produtos, movimentacoes, carregando]);

  const addProduto = async (produto) => {
    const existe = produtosRef.current.find(p => p.codigo === produto.codigo);
    const final = existe
      ? { ...existe, quantidade: existe.quantidade + produto.quantidade }
      : produto;
    setProdutos(prev => existe
      ? prev.map(p => p.codigo === produto.codigo ? final : p)
      : [...prev, final]);
    const { error } = await supabase.from('produtos').upsert(final);
    avisarErro('cadastrar produto', error);
  };

  const editProduto = async (codigo, novosDados) => {
    setProdutos(prev => prev.map(p => p.codigo === codigo ? { ...p, ...novosDados } : p));
    const { error } = await supabase.from('produtos').update(novosDados).eq('codigo', codigo);
    avisarErro('editar produto', error);
  };

  const removeProduto = async (codigo) => {
    setProdutos(prev => prev.filter(p => p.codigo !== codigo));
    const { error } = await supabase.from('produtos').delete().eq('codigo', codigo);
    avisarErro('remover produto', error);
  };

  const registrarCaixa = async (itensCarrinho, tipo = 'saida', pagamento = 'dinheiro') => {
    const atualizados = [];
    const novos = produtosRef.current.map(p => {
      const item = itensCarrinho.find(i => i.codigo === p.codigo);
      if (!item) return p;
      const novaQtd = tipo === 'saida' ? p.quantidade - item.quantidadeVendida : p.quantidade + item.quantidadeVendida;
      const atualizado = { ...p, quantidade: novaQtd };
      atualizados.push(atualizado);
      return atualizado;
    });
    setProdutos(novos);

    const novaMovimentacao = {
      id: Date.now(),
      data: new Date().toISOString(),
      itens: itensCarrinho,
      tipo,
      pagamento: tipo === 'saida' ? pagamento : null,
      total: itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidadeVendida), 0),
      custo_total: itensCarrinho.reduce((acc, item) => acc + ((item.preco_custo || 0) * item.quantidadeVendida), 0),
    };
    setMovimentacoes(prev => [novaMovimentacao, ...prev]);

    const [r1, r2] = await Promise.all([
      supabase.from('produtos').upsert(atualizados),
      supabase.from('movimentacoes').insert(novaMovimentacao),
    ]);
    avisarErro('registrar venda', r1.error || r2.error);
  };

  // Perda/descarte: tira do estoque sem gerar receita. O valor perdido é o custo
  // (ou o preço de venda, se o custo não estiver cadastrado).
  const registrarPerda = async (codigo, quantidade, motivo = 'Vencimento') => {
    const produto = produtosRef.current.find(p => p.codigo === codigo);
    if (!produto || quantidade <= 0) return;
    const qtd = Math.min(quantidade, produto.quantidade);
    const atualizado = { ...produto, quantidade: produto.quantidade - qtd };
    setProdutos(prev => prev.map(p => p.codigo === codigo ? atualizado : p));

    const unitario = produto.preco_custo > 0 ? produto.preco_custo : produto.preco;
    const novaMovimentacao = {
      id: Date.now(),
      data: new Date().toISOString(),
      tipo: 'perda',
      pagamento: null,
      itens: [{ codigo, nome: produto.nome, quantidadeVendida: qtd, preco: produto.preco, preco_custo: produto.preco_custo || 0, motivo }],
      total: unitario * qtd,
      custo_total: unitario * qtd,
    };
    setMovimentacoes(prev => [novaMovimentacao, ...prev]);

    const [r1, r2] = await Promise.all([
      supabase.from('produtos').update({ quantidade: atualizado.quantidade }).eq('codigo', codigo),
      supabase.from('movimentacoes').insert(novaMovimentacao),
    ]);
    avisarErro('registrar perda', r1.error || r2.error);
  };

  const buscarProduto = (codigo) => {
    return produtos.find(p => p.codigo === codigo);
  };

  if (!supabaseConfigurado) return <div style={{padding: 20, textAlign: 'center', color: 'crimson'}}>Supabase não configurado: faltam os secrets VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no GitHub (Settings → Secrets and variables → Actions). Depois, rode o deploy novamente.</div>;

  if (carregando) return <div style={{padding: 20, textAlign: 'center'}}>Carregando banco de dados...</div>;

  return (
    <EstoqueContext.Provider value={{
      produtos, movimentacoes, addProduto, editProduto, removeProduto, registrarCaixa, registrarPerda, buscarProduto
    }}>
      {children}
    </EstoqueContext.Provider>
  );
}
