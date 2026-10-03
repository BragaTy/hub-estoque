// Exporta linhas para CSV (abre direto no Excel; separador ; e BOM para acentos).
export function baixarCSV(nomeArquivo, cabecalho, linhas) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const conteudo = [cabecalho, ...linhas].map(l => l.map(esc).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

// Abre uma janela de impressão com o relatório; o usuário escolhe "Salvar como PDF".
export function imprimirPDF(titulo, cabecalho, linhas) {
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(titulo)}</title>
<style>
  body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}
  h1{font-size:20px;margin-bottom:4px} p{color:#64748b;font-size:12px;margin-top:0}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
  th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left} th{background:#f1f5f9}
</style></head><body>
<h1>${esc(titulo)}</h1><p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
<table><thead><tr>${cabecalho.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
<tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { alert('Permita pop-ups para gerar o PDF.'); return; }
  w.document.write(html);
  w.document.close();
}
