import React, { useState, useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { ShoppingCart, Search, Trash, CheckCircle } from 'lucide-react';

export default function Caixa() {
  const { buscarProduto, registrarCaixa } = useContext(EstoqueContext);
  const [codigoBusca, setCodigoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const adicionarAoCarrinho = (e) => {
    e.preventDefault();
    setErro(''); setSucesso('');

    const produto = buscarProduto(codigoBusca);
    if (!produto) {
      setErro('Produto não encontrado!');
      return;
    }

    if (produto.quantidade <= 0) {
      setErro('Produto sem estoque disponível!');
      return;
    }

    setCarrinho(prev => {
      const existente = prev.find(item => item.codigo === produto.codigo);
      if (existente) {
        if (existente.quantidadeVendida >= produto.quantidade) {
          setErro('Quantidade máxima em estoque atingida para este item.');
          return prev;
        }
        return prev.map(item => item.codigo === produto.codigo ? { ...item, quantidadeVendida: item.quantidadeVendida + 1 } : item);
      }
      return [...prev, { ...produto, quantidadeVendida: 1 }];
    });
    setCodigoBusca('');
  };

  const removerDoCarrinho = (codigo) => {
    setCarrinho(prev => prev.filter(item => item.codigo !== codigo));
  };

  const alterarQtd = (codigo, valor) => {
    setCarrinho(prev => prev.map(item => {
      if (item.codigo === codigo) {
        const novaQtd = Number(valor);
        if (novaQtd <= 0) return item; // Ignora 0
        return { ...item, quantidadeVendida: novaQtd };
      }
      return item;
    }));
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) return;
    registrarCaixa(carrinho, 'saida');
    setCarrinho([]);
    setSucesso('Venda/Saída registrada com sucesso! Estoque atualizado.');
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidadeVendida), 0);

  return (
    <div className="card slide-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="header-title">Frente de Caixa (PDV)</h2>
          <p className="header-subtitle">Adicione múltiplos itens e dê baixa de uma só vez.</p>
        </div>
        <ShoppingCart size={40} color="var(--primary)" />
      </div>

      {erro && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>{erro}</div>}
      {sucesso && <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>{sucesso}</div>}

      <form onSubmit={adicionarAoCarrinho} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Bipe o código de barras ou digite o código..." 
          value={codigoBusca}
          onChange={e => setCodigoBusca(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
          <Search size={20} /> Adicionar
        </button>
      </form>

      <div style={{ minHeight: '200px' }}>
        {carrinho.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
            <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
            <p>O carrinho está vazio.</p>
          </div>
        ) : (
          carrinho.map((item, index) => (
            <div key={item.codigo} className="carrinho-item">
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{index + 1}. {item.nome}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Código: {item.codigo} | Estoque: {item.quantidade}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600' }}>Qtd:</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ width: '80px', textAlign: 'center' }}
                    value={item.quantidadeVendida}
                    onChange={(e) => alterarQtd(item.codigo, e.target.value)}
                  />
                </div>
                <div style={{ fontWeight: 'bold', width: '100px', textAlign: 'right', fontSize: '1.1rem' }}>
                  R$ {(item.preco * item.quantidadeVendida).toFixed(2)}
                </div>
                <button onClick={() => removerDoCarrinho(item.codigo)} className="btn btn-outline btn-icon" style={{ color: 'var(--danger)', borderColor: 'transparent' }}>
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {carrinho.length > 0 && (
        <div style={{ marginTop: '30px', borderTop: '2px dashed var(--border)', paddingTop: '20px' }}>
          <div className="carrinho-total">
            TOTAL: R$ {totalCarrinho.toFixed(2)}
          </div>
          
          <button onClick={finalizarVenda} className="btn btn-success" style={{ width: '100%', marginTop: '20px', fontSize: '1.2rem', padding: '16px' }}>
            <CheckCircle size={24} /> Finalizar Saída
          </button>
        </div>
      )}
    </div>
  );
}
