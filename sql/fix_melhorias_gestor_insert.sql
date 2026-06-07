-- Permite gestor solicitar reajuste/benefício (mesmo fluxo do gerente)
-- Execute no Supabase SQL Editor

DROP POLICY IF EXISTS melhorias_insert_gestor ON public.melhorias_salariais;

CREATE POLICY melhorias_insert_gestor ON public.melhorias_salariais
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'gestor'
    )
    AND gerente_id = auth.uid()
    AND status = 'pendente_rh'
  );
