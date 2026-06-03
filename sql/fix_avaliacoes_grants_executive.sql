-- Corrige "permission denied for table avaliacoes" para CEO/RH/Admin no dashboard gerencial.
-- O schema original revogou SELECT nas tabelas base; o app consulta avaliacoes/respostas com RLS.
-- Execute no Supabase SQL Editor.

-- Restaura leitura para usuários autenticados (RLS continua filtrando as linhas)
grant select on public.avaliacoes to authenticated;
grant select on public.respostas to authenticated;

-- Garante gravação de avaliações (idempotente se já existir)
grant insert on public.avaliacoes to authenticated;
grant insert on public.respostas to authenticated;
grant update on public.respostas to authenticated;

-- CEO, RH e Admin: leitura ampla de avaliações
drop policy if exists avaliacoes_select_ceo_admin on public.avaliacoes;

create policy avaliacoes_select_ceo_admin on public.avaliacoes
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('ceo', 'rh', 'admin')
    )
  );

-- CEO, RH e Admin: leitura ampla de respostas (demais papéis mantêm regra original)
drop policy if exists respostas_select_avaliado on public.respostas;

create policy respostas_select_avaliado on public.respostas
  for select using (
    exists (
      select 1 from public.avaliacoes a
      where a.id = public.respostas.avaliacao_id and a.avaliado_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('ceo', 'rh', 'admin')
    )
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'gestor')
      and not (
        (select role from public.profiles where id = (
          select avaliador_id from public.avaliacoes where id = public.respostas.avaliacao_id
        )) = 'gestor'
        and (select avaliador_id from public.avaliacoes where id = public.respostas.avaliacao_id)
          is distinct from auth.uid()
      )
    )
  );
