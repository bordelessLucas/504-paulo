SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public'
  AND table_name IN ('avaliacoes','respostas')
  ORDER BY table_name, grantee;
