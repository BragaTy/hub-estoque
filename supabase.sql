-- Cole isto no SQL Editor do Supabase e clique em Run

create table if not exists produtos (
  codigo text primary key,
  nome text not null,
  quantidade integer not null default 0,
  preco numeric(10,2) not null default 0
);

create table if not exists movimentacoes (
  id bigint primary key,
  data timestamptz not null default now(),
  tipo text not null,
  total numeric(10,2) not null default 0,
  itens jsonb not null default '[]'
);

alter table produtos enable row level security;
alter table movimentacoes enable row level security;

-- Acesso total via chave anon (o login do app Ã© local, sem Supabase Auth).
-- Para mais seguranÃ§a no futuro, migre para Supabase Auth e restrinja estas polÃ­ticas.
drop policy if exists "acesso produtos" on produtos;
create policy "acesso produtos" on produtos for all using (true) with check (true);
drop policy if exists "acesso movimentacoes" on movimentacoes;
create policy "acesso movimentacoes" on movimentacoes for all using (true) with check (true);

-- Dados iniciais (do antigo banco.txt)
-- Gere com: node scripts/gerar-seed.mjs > seed.sql   e rode o resultado tambÃ©m no SQL Editor
