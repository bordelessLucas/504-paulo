SELECT policyname, tablename, permissive, roles::text AS roles, qual, with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('profiles','perguntas','avaliacoes','respostas','melhorias_salariais');
