-- Verification queries for schema, views, policies, grants, triggers
-- 1) Tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN ('profiles','perguntas','avaliacoes','respostas','melhorias_salariais');

-- 2) Views
SELECT viewname
FROM pg_views
WHERE schemaname='public'
  AND viewname IN ('avaliacoes_masked','respostas_masked');

-- 3) Policies
SELECT policyname, tablename, permissive, roles, command
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('profiles','perguntas','avaliacoes','respostas','melhorias_salariais');

-- 4) Grants on avaliacoes/respostas
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public'
  AND table_name IN ('avaliacoes','respostas')
  ORDER BY table_name, grantee;

-- 5) Function and triggers
SELECT proname FROM pg_proc WHERE proname = 'set_updated_at';
SELECT tgname, tgrelid::regclass::text AS table_name FROM pg_trigger WHERE tgname IN ('trg_profiles_updated_at','trg_melhorias_updated_at');

-- 6) Quick smoke: list a few rows from views (if any)
SELECT * FROM public.avaliacoes_masked LIMIT 5;
SELECT * FROM public.respostas_masked LIMIT 5;
