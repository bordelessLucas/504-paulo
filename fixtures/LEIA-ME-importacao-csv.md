# Importação CSV — colaboradores

## Arquivo de teste

`colaboradores-teste.csv`

## Colunas

| Coluna | Obrigatório | Exemplo |
|--------|-------------|---------|
| `email` | Sim* | `colaborador1@teste.com` |
| `nome` | Sim | `Ana Silva` |
| `funcao` | Não | `Operadora` |
| `departamento` | Não | `Operações Bordo` |
| `data_admissao` | Não | `2023-06-15` |
| `status` | Não | `ativo` |
| `role` | Não | `colaborador` |

\* Ou `id` (UUID) se o usuário já existir no Auth.

## Comportamento

1. **E-mail novo** → cria conta no Auth + perfil (`role` e demais campos do CSV).
2. **Senha padrão** de contas criadas pelo CSV: `12345678`
3. **E-mail já existente** → apenas atualiza o `profiles` (upsert).

Papéis aceitos em `role`: `colaborador`, `supervisor`, `gestor`, `gerente`, `rh`, `ceo`, `admin`.

## Edge Function obrigatória

Publique no Supabase:

```bash
supabase functions deploy create-colaborador
```

Ou copie `supabase/functions/create-colaborador/index.ts` no dashboard de Edge Functions.

Variáveis automáticas: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.

## Quem pode importar

RH, CEO ou Admin (tab **Admin** → Importar planilha).
