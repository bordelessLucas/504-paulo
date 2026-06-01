SELECT viewname
FROM pg_views
WHERE schemaname='public'
  AND viewname IN ('avaliacoes_masked','respostas_masked');
