-- Escala 0 a 3 + perguntas UNIVERSAL visíveis para todos os papéis

-- Normaliza notas antigas (5 -> 3) antes do novo check
UPDATE public.respostas SET nota = 3 WHERE nota = 5;

ALTER TABLE public.respostas DROP CONSTRAINT IF EXISTS respostas_nota_check;

ALTER TABLE public.respostas
  ADD CONSTRAINT respostas_nota_check CHECK (nota IN (0, 1, 2, 3));

-- RLS: gestores/supervisores também leem perguntas UNIVERSAL
DROP POLICY IF EXISTS perguntas_select_by_role_and_dept ON public.perguntas;

CREATE POLICY perguntas_select_by_role_and_dept ON public.perguntas
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) NOT IN ('gestor', 'supervisor')
      OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) IN ('ceo', 'rh', 'admin', 'gerente')
      OR (SELECT p.departamento FROM public.profiles p WHERE p.id = auth.uid()) = secao_departamento
      OR secao_departamento = 'UNIVERSAL'
    )
  );

-- Garante INSERT para authenticated (avaliadores criam avaliações)
GRANT INSERT ON public.avaliacoes TO authenticated;
GRANT INSERT ON public.respostas TO authenticated;
