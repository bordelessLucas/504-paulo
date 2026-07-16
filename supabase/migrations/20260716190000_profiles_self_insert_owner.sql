-- Auto-cadastro: o usuário que se cadastra sozinho é o dono da conta (CEO)
-- e precisa criar o próprio registro em public.profiles.
--
-- A policy restringe o INSERT à própria linha (id = auth.uid()), de modo que
-- ninguém consiga criar/forjar o profile de outro usuário. Contas criadas pelo
-- fluxo administrativo (Edge Function create-colaborador) usam a service_role e
-- ignoram RLS, portanto não são afetadas por esta policy.

DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;

CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
