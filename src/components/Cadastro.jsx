import React, { useState, useContext } from 'react';
import { EstoqueContext } from '../context/EstoqueContext';

export default function Cadastro() {
  const { addProduto, buscarProduto } = useContext(EstoqueContext);
  
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const salvarProduto = (e) => {
    e.preventDefault();
    if (!codigo || !nome || !quantidade || !preco) {
      setMensagem({ texto: 'Por favor, preencha todos os campos.', tipo: 'error' });
      return;
    }

    if (buscarProduto(codigo)) {
      setMensagem({ texto: 'Já existe um produto com este código!', tipo: 'error' });
      return;
    }

    addProduto({
      codigo,
      nome,
      quantidade: Number(quantidade),
      preco: Number(preco)
    });
    
    setMensagem({ texto: 'Produto cadastrado com sucesso!', tipo: 'success' });
    setCodigo(''); setNome(''); setQuantidade(''); setPreco('');
  };

  return (
    <div className="card slide-in">
      <h2 className="header-title">Cadastro de Produto</h2>
      <p className="header-subtitle">Adicione itens para acompanhar o estoque e vendas.</p>
      
      {mensagem.texto && (
        <div style={{ padding: '16px', marginBottom: '24px', borderRadius: '12px', fontWeight: '600', backgroundColor: mensagem.tipo === 'error' ? '#fee2e2' : '#d1fae5', color: mensagem.tipo === 'error' ? '#b91c1c' : '#047857' }}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={salvarProduto}>
        <div className="form-group">
          <label>Código Interno ou Código de Barras</label>
          <input type="text" className="form-control" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: CX01 (Coxinha) ou Bipar código..." />
        </div>
        
        <div className="form-group">
          <label>Nome do Produto / Descrição</label>
          <input type="text" className="form-control" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Empada de Frango com Catupiry" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Quantidade Inicial</label>
            <input type="number" className="form-control" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Preço de Venda (R$)</label>
            <input type="number" step="0.01" className="form-control" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', fontSize: '1.1rem', padding: '16px' }}>
          Finalizar Cadastro
        </button>
      </form>
    </div>
  );
}
