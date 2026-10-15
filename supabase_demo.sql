-- Dados de demonstração: descarta os vencidos, repõe lote novo e gera vendas recentes.
-- Rode no SQL Editor do Supabase. (Pré-requisito: supabase_v2.sql já executado.)
-- Pode rodar de novo quando os produtos vencerem outra vez.

-- 1) Registra como PERDA todo produto vencido que ainda tem estoque
insert into movimentacoes (id, data, tipo, pagamento, total, custo_total, itens)
select
  (extract(epoch from now()) * 1000)::bigint + row_number() over (order by p.codigo),
  now(),
  'perda',
  null,
  (case when p.preco_custo > 0 then p.preco_custo else p.preco end) * p.quantidade,
  (case when p.preco_custo > 0 then p.preco_custo else p.preco end) * p.quantidade,
  jsonb_build_array(jsonb_build_object(
    'codigo', p.codigo, 'nome', p.nome, 'preco', p.preco, 'preco_custo', p.preco_custo,
    'quantidadeVendida', p.quantidade, 'motivo', 'Vencimento'))
from produtos p
where p.validade < current_date and p.quantidade > 0;

-- 2) Repõe lote novo dos vencidos: estoque cheio e nova validade (de 2 a 14 dias, variando por produto)
update produtos
set quantidade = greatest(estoque_minimo * 5, 30),
    validade   = current_date + (2 + abs(hashtext(codigo)) % 13)
where validade < current_date;

-- 3) Vendas fictícias nos últimos ~6 dias (formas de pagamento variadas).
--    Obs.: servem só para os relatórios; não alteram o estoque acima.
insert into movimentacoes (id, data, tipo, pagamento, total, custo_total, itens)
select
  (extract(epoch from now()) * 1000)::bigint + 100000 + g,
  now() - ((g * 7) || ' hours')::interval,
  'saida',
  (array['dinheiro', 'pix', 'cartao'])[1 + g % 3],
  p.preco * x.q,
  p.preco_custo * x.q,
  jsonb_build_array(jsonb_build_object(
    'codigo', p.codigo, 'nome', p.nome, 'preco', p.preco, 'preco_custo', p.preco_custo,
    'quantidadeVendida', x.q))
from generate_series(1, 20) g
join lateral (select 1 + (g % 4) as q) x on true
join lateral (
  select * from produtos
  where codigo in ('1','2','3','4','10','11','20','21','30','40','41','50','51','60','61','70','71')
  order by codigo offset (g % 17) limit 1
) p on true;
