-- Valor 'anual' no enum tipo_avaliacao (deve rodar antes da tabela decisoes_anuais)
ALTER TYPE public.tipo_avaliacao ADD VALUE IF NOT EXISTS 'anual';
