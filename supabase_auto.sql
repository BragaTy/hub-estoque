-- Automação: vendas fictícias + descarte de vencidos + reposição.
-- Rode no SQL Editor do Supabase (pode rodar mais de uma vez). Pré-requisito: supabase_v2.sql.

-- Gera n vendas de 1 produto cada (não vencido, com estoque), baixando o estoque.
create or replace function gerar_vendas_automaticas(n int default 3)
returns int
language plpgsql
as $$
declare
  p produtos%rowtype;
  q int;
  feitas int := 0;
  i int;
begin
  for i in 1..n loop
    select * into p from produtos
    where quantidade > 0 and (validade is null or validade >= current_date)
    order by random() limit 1;
    exit when not found;

    q := least(p.quantidade, 1 + floor(random() * 4)::int);

    update produtos set quantidade = quantidade - q where codigo = p.codigo;

    insert into movimentacoes (id, data, tipo, pagamento, total, custo_total, itens)
    values (
      (extract(epoch from clock_timestamp()) * 1000000)::bigint,
      now(),
      'saida',
      (array['dinheiro', 'pix', 'cartao'])[1 + floor(random() * 3)::int],
      p.preco * q,
      p.preco_custo * q,
      jsonb_build_array(jsonb_build_object(
        'codigo', p.codigo, 'nome', p.nome, 'preco', p.preco,
        'preco_custo', p.preco_custo, 'quantidadeVendida', q))
    );
    feitas := feitas + 1;
  end loop;
  return feitas;
end;
$$;

-- Descarta vencidos (vira PERDA) e repõe lote novo; também repõe o que está abaixo do mínimo (vira ENTRADA).
create or replace function repor_e_descartar()
returns text
language plpgsql
as $$
declare
  p produtos%rowtype;
  repor int;
  unit numeric;
  descartados int := 0;
  repostos int := 0;
begin
  -- 1) vencidos com estoque -> perda
  for p in select * from produtos where validade < current_date and quantidade > 0 loop
    unit := case when p.preco_custo > 0 then p.preco_custo else p.preco end;
    insert into movimentacoes (id, data, tipo, pagamento, total, custo_total, itens)
    values (
      (extract(epoch from clock_timestamp()) * 1000000)::bigint,
      now(), 'perda', null, unit * p.quantidade, unit * p.quantidade,
      jsonb_build_array(jsonb_build_object(
        'codigo', p.codigo, 'nome', p.nome, 'preco', p.preco, 'preco_custo', p.preco_custo,
        'quantidadeVendida', p.quantidade, 'motivo', 'Vencimento'))
    );
    update produtos set quantidade = 0 where codigo = p.codigo;
    descartados := descartados + 1;
  end loop;

  -- 2) vencidos, ou com estoque abaixo de um limite folgado -> entrada de unidades
  --    (limite = o maior entre 40 e 4x o mínimo; reposição leva o estoque a 100 ou 10x o mínimo)
  --    A validade só é renovada quando o lote venceu; se não, mantém a data atual.
  for p in select * from produtos
           where validade < current_date or quantidade <= greatest(40, estoque_minimo * 4) loop
    repor := greatest(100, p.estoque_minimo * 10) - p.quantidade;
    continue when repor <= 0;
    insert into movimentacoes (id, data, tipo, pagamento, total, custo_total, itens)
    values (
      (extract(epoch from clock_timestamp()) * 1000000)::bigint,
      now(), 'entrada', null, p.preco_custo * repor, p.preco_custo * repor,
      jsonb_build_array(jsonb_build_object(
        'codigo', p.codigo, 'nome', p.nome, 'preco', p.preco, 'preco_custo', p.preco_custo,
        'quantidadeVendida', repor))
    );
    update produtos
    set quantidade = p.quantidade + repor,
        validade = case when p.validade is null then null
                        when p.validade < current_date then current_date + (5 + floor(random() * 10)::int)
                        else p.validade end
    where codigo = p.codigo;
    repostos := repostos + 1;
  end loop;

  return format('descartados=%s repostos=%s', descartados, repostos);
end;
$$;

-- Permite chamar as funções pela API (chave pública do site)
grant execute on function gerar_vendas_automaticas(int) to anon, authenticated;
grant execute on function repor_e_descartar() to anon, authenticated;
