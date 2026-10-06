import React, { useState, useContext, useMemo, useRef } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';
import { ShoppingCart, Trash2, CheckCircle, Search } from 'lucide-react';
import { estaVencido, venceEmBreve, diasParaVencer, formatarData, FORMAS_PAGAMENTO, nomePagamento } from '../utils/validade';

// minúsculas + remoção de acentos (Unicode NFD)
const normalizar = (s) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Caixa() {
  const { buscarProduto, registrarCaixa, produtos } = useContext(EstoqueContext);
  const [codigoBusca, setCodigoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [pagamento, setPagamento] = useState('dinheiro');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const inputRef = useRef(null);

  const adicionarPorCodigo = (codigoDigitado) => {
    setErro(''); setSucesso('');
    const codigo = String(codigoDigitado).trim();
    if (!codigo) return;

    const produto = buscarProduto(codigo);
    if (!produto) { setErro(`Produto "${codigo}" não encontrado.`); return; }
    if (produto.quantidade <= 0) { setErro(`"${produto.nome}" está sem estoque.`); return; }
    if (estaVencido(produto)) {
      setErro(`"${produto.nome}" VENCEU em ${formatarData(produto.validade)} e não pode ser vendido. Registre o descarte em Estoque.`);
      return;
    }

    setCarrinho(prev => {
      const existente = prev.find(i => i.codigo === produto.codigo);
      if (existente) {
        if (existente.quantidadeVendida >= produto.quantidade) {
          setErro('Quantidade máxima em estoque atingida para este item.');
          return prev;
        }
        return prev.map(i => i.codigo === produto.codigo ? { ...i, quantidadeVendida: i.quantidadeVendida + 1 } : i);
      }
      return [...prev, { ...produto, quantidadeVendida: 1 }];
    });
    setCodigoBusca('');
  };

  const sugestoes = useMemo(() => {
    const termo = normalizar(codigoBusca.trim());
    if (!termo) return [];
    return (produtos || [])
      .filter(p => normalizar(p.nome).includes(termo) || normalizar(p.codigo).includes(termo))
      .slice(0, 8);
  }, [codigoBusca, produtos]);

  const selecionarSugestao = (produto) => {
    adicionarPorCodigo(produto.codigo);
    setMostrarSugestoes(false);
    setIndiceAtivo(-1);
    inputRef.current?.focus();
  };

  const adicionarAoCarrinho = (e) => {
    e.preventDefault();
    const codigo = codigoBusca.trim();
    // Item destacado via teclado
    if (indiceAtivo >= 0 && sugestoes[indiceAtivo]) return selecionarSugestao(sugestoes[indiceAtivo]);
    // Bipe de leitor: código exato adiciona direto
    if (codigo && buscarProduto(codigo)) {
      adicionarPorCodigo(codigo);
      setMostrarSugestoes(false);
      inputRef.current?.focus();
      return;
    }
    // Resultado único na busca por nome
    if (sugestoes.length === 1) return selecionarSugestao(sugestoes[0]);
    adicionarPorCodigo(codigo);
    inputRef.current?.focus();
  };

  const aoTeclar = (e) => {
    if (!sugestoes.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setMostrarSugestoes(true);
      setIndiceAtivo(i => (i + 1) % sugestoes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceAtivo(i => (i <= 0 ? sugestoes.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setMostrarSugestoes(false); setIndiceAtivo(-1);
    }
  };

  const alterarQtd = (codigo, delta) => {
    setCarrinho(prev => {
      const prodOriginal = produtos.find(p => p.codigo === codigo);
      return prev.map(i => {
        if (i.codigo !== codigo) return i;
        const nova = i.quantidadeVendida + delta;
        if (nova <= 0) return i; // não vai abaixo de 1
        if (nova > prodOriginal.quantidade) { setErro('Sem estoque suficiente.'); return i; }
        return { ...i, quantidadeVendida: nova };
      });
    });
  };

  const remover = (codigo) => setCarrinho(prev => prev.filter(i => i.codigo !== codigo));

  const finalizarVenda = () => {
    if (!carrinho.length) return;
    const vencido = carrinho.find(i => estaVencido(produtos.find(p => p.codigo === i.codigo) || i));
    if (vencido) { setErro(`"${vencido.nome}" está vencido. Remova do carrinho.`); return; }
    registrarCaixa(carrinho, 'saida', pagamento);
    setCarrinho([]);
    setSucesso(`Venda finalizada (${nomePagamento(pagamento)})! Estoque atualizado.`);
    setErro('');
  };

  const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidadeVendida, 0);

  return (
    <div className="slide-in">
      <h1 className="page-title">Frente de Caixa</h1>
      <p className="page-subtitle">Adicione itens pelo código e finalize a venda de uma vez.</p>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      <div className="card">
        <form onSubmit={adicionarAoCarrinho} className="pdv-input-row">
          <div className="pdv-search-wrap">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Digite o nome ou código (ex: pao, 10) e pressione Enter..."
              value={codigoBusca}
              onChange={e => { setCodigoBusca(e.target.value); setErro(''); setMostrarSugestoes(true); setIndiceAtivo(-1); }}
              onKeyDown={aoTeclar}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
              autoComplete="off"
              autoFocus
            />
            {mostrarSugestoes && sugestoes.length > 0 && (
              <ul className="pdv-sugestoes" role="listbox">
                {sugestoes.map((p, i) => (
                  <li
                    key={p.codigo}
                    role="option"
                    aria-selected={i === indiceAtivo}
                    className={`pdv-sugestao${i === indiceAtivo ? ' ativo' : ''}${p.quantidade <= 0 ? ' sem-estoque' : ''}`}
                    onMouseDown={e => e.preventDefault()}
                    onMouseEnter={() => setIndiceAtivo(i)}
                    onClick={() => selecionarSugestao(p)}
                  >
                    <div>
                      <strong>{p.nome}</strong>
                      <small>Código: {p.codigo}</small>
                    </div>
                    <div className="pdv-sugestao-meta">
                      <span>R$ {Number(p.preco).toFixed(2)}</span>
                      <small>Estoque: {p.quantidade}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={18} /> Adicionar
          </button>
        </form>


        <div className="carrinho-lista">
          {carrinho.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={56} />
              <p>O carrinho está vazio. Digite um código acima.</p>
            </div>
          ) : (
            carrinho.map((item, idx) => (
              <div key={item.codigo} className="carrinho-item">
                <div className="carrinho-item-info">
                  <h4>{idx + 1}. {item.nome}</h4>
                  <p>Código: <strong>{item.codigo}</strong> · Preço unit.: R$ {item.preco.toFixed(2)}</p>
                  {venceEmBreve(item) && (
                    <p style={{ color: '#d97706', fontWeight: 600 }}>
                      ⚠ Vence {diasParaVencer(item.validade) === 0 ? 'hoje' : `em ${diasParaVencer(item.validade)} dia(s)`} ({formatarData(item.validade)})
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="carrinho-qtd-ctrl">
                    <button type="button" className="qtd-btn" onClick={() => alterarQtd(item.codigo, -1)}>−</button>
                    <span className="qtd-display">{item.quantidadeVendida}</span>
                    <button type="button" className="qtd-btn" onClick={() => alterarQtd(item.codigo, +1)}>+</button>
                  </div>
                  <div className="carrinho-item-preco">
                    R$ {(item.preco * item.quantidadeVendida).toFixed(2)}
                  </div>
                  <button type="button" className="btn btn-ghost btn-icon" onClick={() => remover(item.codigo)} title="Remover">
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {carrinho.length > 0 && (
          <>
            <div className="carrinho-total-box" style={{ marginTop: '20px' }}>
              <span>TOTAL DA VENDA</span>
              <div className="carrinho-total-valor">R$ {total.toFixed(2)}</div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label className="form-label">Forma de pagamento</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {FORMAS_PAGAMENTO.map(f => (
                  <button key={f.id} type="button"
                    className={`btn ${pagamento === f.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPagamento(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={finalizarVenda} className="btn btn-success btn-block" style={{ marginTop: '14px', padding: '16px', fontSize: '1.1rem' }}>
              <CheckCircle size={22} /> Finalizar Venda ({nomePagamento(pagamento)})
            </button>
          </>
        )}
      </div>
    </div>
  );
}
