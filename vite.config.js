import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Nome do repositório no GitHub (necessário para o GitHub Pages)
  base: '/hub-estoque/',
  plugins: [react()],
})
