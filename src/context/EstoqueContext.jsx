import React, { createContext, useState, useEffect } from 'react';

export const EstoqueContext = createContext();

export function EstoqueProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega do arquivo TXT ao iniciar
  useEffect(() => {
    fetch('/api/banco')
      .then(res => res.json())
      .then(data => {
        setProdutos(data.produtos || []);
        setMovimentacoes(data.movimentacoes || []);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao carregar banco.txt", err);
        setCarregando(false);
      });
  }, []);

  // Salva no arquivo TXT toda vez que algo mudar (se já tiver carregado)
  useEffect(() => {
    if (!carregando) {
      const dados = { produtos, movimentacoes };
      fetch('/api/banco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados, null, 2)
      });
    }
  }, [produtos, movimentacoes, carregando]);

  const addProduto = (produto) => {
    setProdutos(prev => {
      const existe = prev.find(p => p.codigo === produto.codigo);
      if (existe) {
        return prev.map(p => p.codigo === produto.codigo ? { ...p, quantidade: p.quantidade + produto.quantidade } : p);
      }
      return [...prev, produto];
    });
  };

  const editProduto = (codigo, novosDados) => {
    setProdutos(prev => prev.map(p => p.codigo === codigo ? { ...p, ...novosDados } : p));
  };

  const removeProduto = (codigo) => {
    setProdutos(prev => prev.filter(p => p.codigo !== codigo));
  };

  const registrarCaixa = (itensCarrinho, tipo = 'saida') => {
    setProdutos(prev => {
      return prev.map(p => {
        const itemNoCarrinho = itensCarrinho.find(i => i.codigo === p.codigo);
        if (itemNoCarrinho) {
          const novaQtd = tipo === 'saida' ? p.quantidade - itemNoCarrinho.quantidadeVendida : p.quantidade + itemNoCarrinho.quantidadeVendida;
          return { ...p, quantidade: novaQtd };
        }
        return p;
      });
    });

    const novaMovimentacao = {
      id: Date.now(),
      data: new Date().toISOString(),
      itens: itensCarrinho,
      tipo,
      total: itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidadeVendida), 0)
    };
    setMovimentacoes(prev => [novaMovimentacao, ...prev]);
  };

  const buscarProduto = (codigo) => {
    return produtos.find(p => p.codigo === codigo);
  };

  if (carregando) return <div style={{padding: 20, textAlign: 'center'}}>Carregando banco de dados...</div>;

  return (
    <EstoqueContext.Provider value={{
      produtos, movimentacoes, addProduto, editProduto, removeProduto, registrarCaixa, buscarProduto
    }}>
      {children}
    </EstoqueContext.Provider>
  );
}
