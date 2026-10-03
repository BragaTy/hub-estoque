import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin customizado para simular um banco de dados em TXT
function txtDatabasePlugin() {
  const dbPath = path.resolve('banco.txt');

  return {
    name: 'txt-database',
    configureServer(server) {
      // Endpoint para LER o banco.txt
      server.middlewares.use('/api/banco', (req, res, next) => {
        if (req.method === 'GET') {
          if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({ produtos: [], movimentacoes: [] }));
          }
          const data = fs.readFileSync(dbPath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
          return;
        }

        // Endpoint para GRAVAR no banco.txt
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            // Salva diretamente no arquivo banco.txt
            fs.writeFileSync(dbPath, body);
            res.end('Salvo com sucesso');
          });
          return;
        }

        next();
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), txtDatabasePlugin()],
})
