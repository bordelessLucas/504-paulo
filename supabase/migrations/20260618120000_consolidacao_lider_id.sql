-- Hierarquia de equipe: vínculo opcional supervisor/gestor/gerente → colaborador
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lider_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_lider_id_idx ON public.profiles(lider_id);

COMMENT ON COLUMN public.profiles.lider_id IS 'Líder direto (supervisor, gestor ou gerente) do colaborador.';
