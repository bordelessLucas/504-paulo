-- Seed manual: cargos/funções + CBO (Excel 1.10)
-- Executar no SQL Editor do Supabase se a migration ainda não rodou.
-- Pré-requisito: tabela public.cargos (migration 20260729160000_cargos_cbo.sql)

INSERT INTO public.cargos (nome, codigo_cbo, organizacao_id)
SELECT v.nome, v.codigo_cbo, NULL
FROM (
  VALUES
    ('½ OFICIAL', '7244-10'),
    ('ADMINISTRADOR', '2521-05'),
    ('AJUDANTE', '7170-20'),
    ('ALMOXARIFE', '4141-05'),
    ('ANALISTA', '2521-05'),
    ('ARMADOR', '7153-15'),
    ('ASSISTENTE', '3912-05'),
    ('AUXILIAR', '4141-05'),
    ('CALDEIREIRO', '7244-10'),
    ('COORDENADOR', '1423-05'),
    ('COZINHEIRO', '5132-05'),
    ('DELINEADOR', '3180-05'),
    ('DESENHISTA', '3180-05'),
    ('ELETRICISTA', '7156-15'),
    ('ENCARREGADO', '7102-05'),
    ('ENGENHEIRO', '2142-05'),
    ('ESMERILHADOR', '7212-15'),
    ('ESPECIALISTA', '2521-05'),
    ('ESTOQUISTA', '4141-25'),
    ('FRESADOR', '7212-20'),
    ('GERENTE', '1421-05'),
    ('INSPETOR', '3912-05'),
    ('INSTRUMENTISTA', '3135-05'),
    ('JOVEM APRENDIZ', '9113-05'),
    ('LÍDER', '7102-05'),
    ('MACARIQUEIRO', '7244-35'),
    ('MARCENEIRO', '7711-05'),
    ('MECÂNICO', '9113-05'),
    ('MONTADOR', '7155-45'),
    ('MOTORISTA', '7823-05'),
    ('OPERADOR', '7842-05'),
    ('ORÇAMENTISTA', '3542-05'),
    ('PEDREIRO', '7152-10'),
    ('PINTOR', '7233-15'),
    ('PROFISSIONAL DE ACESSO POR CORDAS', '7155-45'),
    ('PROJETISTA', '3180-05'),
    ('RÁDIO OPERADOR', '7842-05'),
    ('RECEPCIONISTA', '4221-05'),
    ('RIGGER', '7832-25'),
    ('SOLDADOR', '7243-15'),
    ('SUPERVISOR', '4101-05'),
    ('TÉCNICO', '3912-05'),
    ('TORNEIRO', '9113-05')
) AS v(nome, codigo_cbo)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.cargos c
  WHERE c.organizacao_id IS NULL
    AND lower(c.nome) = lower(v.nome)
);
