// Converte banco.txt em SQL de INSERT. Uso: node scripts/gerar-seed.mjs > seed.sql
import fs from 'fs';

const db = JSON.parse(fs.readFileSync('banco.txt', 'utf-8'));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const out = [];
for (const p of db.produtos || []) {
  out.push(
    `insert into produtos (codigo, nome, quantidade, preco) values (${q(p.codigo)}, ${q(p.nome)}, ${p.quantidade}, ${p.preco}) on conflict (codigo) do nothing;`
  );
}
for (const m of db.movimentacoes || []) {
  out.push(
    `insert into movimentacoes (id, data, tipo, total, itens) values (${m.id}, ${q(m.data)}, ${q(m.tipo)}, ${m.total}, ${q(JSON.stringify(m.itens))}::jsonb) on conflict (id) do nothing;`
  );
}
console.log(out.join('\n'));
