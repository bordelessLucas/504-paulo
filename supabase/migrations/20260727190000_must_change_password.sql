-- Força troca de senha no primeiro acesso (usuários criados pelo CEO/RH).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.must_change_password IS
  'Quando true, o usuário deve definir uma nova senha antes de usar o app.';
