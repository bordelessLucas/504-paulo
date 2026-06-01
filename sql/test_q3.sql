SELECT policyname, tablename, permissive, roles, command
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('profiles','perguntas','avaliacoes','respostas','melhorias_salariais');
