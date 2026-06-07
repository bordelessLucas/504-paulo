-- Políticas RLS para fluxo Gerente → RH → CEO/Admin em melhorias_salariais
-- Execute no Supabase SQL Editor após create_supabase_schema.sql

-- Ampliar leitura para admin (além de rh/ceo)
drop policy if exists melhorias_select_colaborador on public.melhorias_salariais;

create policy melhorias_select_authenticated on public.melhorias_salariais
  for select using (
    auth.uid() is not null
    and (
      colaborador_id = auth.uid()
      or gerente_id = auth.uid()
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('rh', 'ceo', 'admin')
      )
    )
  );

-- Colaborador envia autoavaliação (gerente_id nulo)
drop policy if exists melhorias_insert_colaborador on public.melhorias_salariais;

create policy melhorias_insert_colaborador on public.melhorias_salariais
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'colaborador'
    )
    and colaborador_id = auth.uid()
    and gerente_id is null
    and status = 'pendente_rh'
  );

-- Gerente cria solicitação (status inicial pendente_rh)
drop policy if exists melhorias_insert_gerente on public.melhorias_salariais;

create policy melhorias_insert_gerente on public.melhorias_salariais
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'gerente'
    )
    and gerente_id = auth.uid()
    and status = 'pendente_rh'
  );

-- Gestor de base cria solicitação (status inicial pendente_rh)
drop policy if exists melhorias_insert_gestor on public.melhorias_salariais;

create policy melhorias_insert_gestor on public.melhorias_salariais
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'gestor'
    )
    and gerente_id = auth.uid()
    and status = 'pendente_rh'
  );

-- RH valida ou recusa (somente pendente_rh)
drop policy if exists melhorias_update_rh on public.melhorias_salariais;

create policy melhorias_update_rh on public.melhorias_salariais
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'rh'
    )
    and status = 'pendente_rh'
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'rh'
    )
    and status in ('pendente_ceo', 'recusado')
  );

-- CEO/Admin aprova ou recusa (somente pendente_ceo)
drop policy if exists melhorias_update_ceo on public.melhorias_salariais;

create policy melhorias_update_ceo on public.melhorias_salariais
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('ceo', 'admin')
    )
    and status = 'pendente_ceo'
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('ceo', 'admin')
    )
    and status in ('aprovado', 'recusado')
  );
