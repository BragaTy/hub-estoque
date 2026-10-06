-- Atualização v2: custo, estoque mínimo, validade, forma de pagamento e perdas.
-- Rode no SQL Editor do Supabase (pode rodar mais de uma vez sem problemas).

alter table produtos add column if not exists preco_custo numeric(10,2) not null default 0;
alter table produtos add column if not exists estoque_minimo integer not null default 5;
alter table produtos add column if not exists validade date;

alter table movimentacoes add column if not exists pagamento text;
alter table movimentacoes add column if not exists custo_total numeric(10,2) not null default 0;

-- Vendas antigas ficam como "dinheiro"
update movimentacoes set pagamento = 'dinheiro' where tipo = 'saida' and pagamento is null;

-- Preço de custo fictício (~45% do preço de venda) e estoque mínimo
update produtos set preco_custo = round(preco * 0.45, 2) where preco_custo = 0;
update produtos set estoque_minimo = 10 where codigo in ('1','2','3','4','10','11','20','21','30','40','41','50','51','60','61','70','71','102','103');
update produtos set estoque_minimo = 20 where codigo in ('100','101','7894900011517');

-- Validades fictícias dos salgados (relativas a hoje, para os alertas aparecerem)
update produtos set validade = current_date + 2   where codigo = '1';   -- vence em breve
update produtos set validade = current_date + 5   where codigo = '2';
update produtos set validade = current_date + 1   where codigo = '3';   -- vence em breve
update produtos set validade = current_date - 1   where codigo = '4';   -- VENCIDO
update produtos set validade = current_date + 3   where codigo = '10';  -- vence em breve
update produtos set validade = current_date + 7   where codigo = '11';
update produtos set validade = current_date + 4   where codigo = '20';
update produtos set validade = current_date + 10  where codigo = '21';
update produtos set validade = current_date + 2   where codigo = '30';  -- vence em breve
update produtos set validade = current_date + 6   where codigo = '40';
update produtos set validade = current_date + 8   where codigo = '41';
update produtos set validade = current_date - 2   where codigo = '50';  -- VENCIDO
update produtos set validade = current_date + 12  where codigo = '51';
update produtos set validade = current_date + 3   where codigo = '60';  -- vence em breve
update produtos set validade = current_date + 9   where codigo = '61';
update produtos set validade = current_date + 14  where codigo = '70';
update produtos set validade = current_date + 1   where codigo = '71';  -- vence em breve (e estoque baixo)
