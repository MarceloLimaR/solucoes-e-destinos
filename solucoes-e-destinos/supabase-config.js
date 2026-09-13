/* ============================================================
   SOLUÇÕES & DESTINOS — CONFIGURAÇÃO DO BANCO (SUPABASE)
   ============================================================
   Este é o ÚNICO arquivo que você precisa editar.
   Cole aqui a URL do projeto e a chave "anon/public" do painel
   do Supabase (Project Settings → API).

   A chave "anon" é pública por design e fica protegida pelas
   regras de segurança (RLS) criadas no banco.
   NUNCA cole aqui a chave "service_role".
   ============================================================ */

window.SUPABASE_URL = "https://sopbhylllfhlyerzpntx.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_VHTxni4om_CvdV3UXAF-WA_qM0hjAUL";

/* ------------------------------------------------------------
   MODO SIMPLES (sem login):
   Se você rodou o arquivo supabase-moderacao-simples.sql no
   Supabase, tire as três barras (//) da linha abaixo. Assim o
   moderar.html abre direto, sem pedir e-mail nem senha.
   ------------------------------------------------------------ */
// window.SUPABASE_TOKEN_MODERADOR = "sd-2026-moderador-solucoes-destinos";
