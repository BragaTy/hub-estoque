import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && key);

if (!supabaseConfigurado) {
  console.error('Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes no build.');
}

// Valores de reserva evitam que o app quebre (tela branca) quando faltam as variáveis
export const supabase = createClient(
  url || 'https://sem-configuracao.supabase.co',
  key || 'sem-configuracao'
);
