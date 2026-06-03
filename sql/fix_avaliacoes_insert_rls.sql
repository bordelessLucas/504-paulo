-- Permite supervisor, gestor e gerente gravar avaliações e respostas.
-- Sem políticas INSERT, o RLS bloqueia: "new row violates row-level security policy".
-- Execute no Supabase SQL Editor.

GRANT INSERT ON public.avaliacoes TO authenticated;
GRANT INSERT ON public.respostas TO authenticated;
GRANT UPDATE ON public.respostas TO authenticated;

-- Avaliações: só quem avalia pode inserir (avaliador_id = usuário logado)
DROP POLICY IF EXISTS avaliacoes_insert_avaliador ON public.avaliacoes;

CREATE POLICY avaliacoes_insert_avaliador ON public.avaliacoes
  FOR INSERT
  WITH CHECK (
    avaliador_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('supervisor', 'gestor', 'gerente')
    )
  );

-- Respostas: vinculadas a uma avaliação criada pelo próprio avaliador
DROP POLICY IF EXISTS respostas_insert_avaliador ON public.respostas;

CREATE POLICY respostas_insert_avaliador ON public.respostas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.avaliacoes a
      WHERE a.id = avaliacao_id
        AND a.avaliador_id = auth.uid()
    )
  );

-- Atualização de "melhorou" em respostas de avaliações anteriores do colaborador
DROP POLICY IF EXISTS respostas_update_avaliador ON public.respostas;

CREATE POLICY respostas_update_avaliador ON public.respostas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('supervisor', 'gestor', 'gerente')
    )
    AND EXISTS (
      SELECT 1
      FROM public.avaliacoes a
      JOIN public.profiles colab ON colab.id = a.avaliado_id
      WHERE a.id = respostas.avaliacao_id
        AND colab.role = 'colaborador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('supervisor', 'gestor', 'gerente')
    )
  );
