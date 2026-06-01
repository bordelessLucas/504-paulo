SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN ('profiles','perguntas','avaliacoes','respostas','melhorias_salariais');
