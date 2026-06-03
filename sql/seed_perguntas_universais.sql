-- Metodologia 360°: 3 perguntas universais (escala 0 a 3)
-- Execute no SQL Editor do Supabase após migrate_escala_0_3.sql

INSERT INTO public.perguntas (codigo, descricao, secao_departamento, peso)
VALUES
  (
    'P1',
    'Técnica e Prazos: O colaborador executa suas tarefas com excelência técnica, cumpre os prazos acordados e entrega os relatórios exigidos?',
    'UNIVERSAL',
    3
  ),
  (
    'P2',
    'Segurança e SMS: O colaborador cumpre rigorosamente todas as normas de SMS, mantém a postura segura no trecho/embarque e zela pela meta zero acidentes?',
    'UNIVERSAL',
    3
  ),
  (
    'P3',
    'Postura e Convivência: O colaborador demonstra comportamento adequado em viagens, pontualidade nos embarques e boa convivência na base com a equipe?',
    'UNIVERSAL',
    3
  )
ON CONFLICT (codigo) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  secao_departamento = EXCLUDED.secao_departamento,
  peso = EXCLUDED.peso;
