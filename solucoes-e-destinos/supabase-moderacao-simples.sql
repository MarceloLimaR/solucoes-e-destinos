-- ============================================================
-- SOLUÇÕES & DESTINOS — MODERAÇÃO SEM LOGIN (OPCIONAL)
-- ============================================================
-- Rode este SQL SOMENTE se você quiser aprovar os recados
-- sem precisar criar usuário e fazer login no Supabase.
-- SQL Editor → New query → colar → RUN
-- ============================================================

-- O moderador (quem tem o token) pode VER tudo, inclusive pendentes
drop policy if exists "moderador token ve tudo" on public.recados;
create policy "moderador token ve tudo"
  on public.recados for select
  to anon
  using (current_setting('request.headers', true)::json->>'x-moderador'
         = 'sd-2026-moderador-solucoes-destinos');

-- O moderador pode APROVAR / RECUSAR
drop policy if exists "moderador token atualiza" on public.recados;
create policy "moderador token atualiza"
  on public.recados for update
  to anon
  using (current_setting('request.headers', true)::json->>'x-moderador'
         = 'sd-2026-moderador-solucoes-destinos')
  with check (current_setting('request.headers', true)::json->>'x-moderador'
         = 'sd-2026-moderador-solucoes-destinos');

-- O moderador pode APAGAR
drop policy if exists "moderador token apaga" on public.recados;
create policy "moderador token apaga"
  on public.recados for delete
  to anon
  using (current_setting('request.headers', true)::json->>'x-moderador'
         = 'sd-2026-moderador-solucoes-destinos');
