# Importação CSV — colaboradores (ficha offshore)

## Arquivo de teste

`colaboradores-teste.csv`

## Colunas

| Coluna | Obrigatório | Exemplo |
|--------|-------------|---------|
| `email` | Sim* | `colaborador1@teste.com` |
| `nome` | Sim | `Ana Silva` |
| `funcao` | Não | `Operadora de Rope Access` |
| `departamento` | Não | `Operações Bordo` |
| `classificacao` | Não | `Offshore Pleno` |
| `nivel_irata` | Não | `N1`, `N2`, `N3` ou `N/A` |
| `data_nascimento` | Não | `15/03/1990` ou `1990-03-15` |
| `data_admissao` | Não | `2023-06-15` |
| `ddd` | Não** | `21` |
| `telefone` | Não** | `987654321` |
| `expertise` | Não | `Trabalho em altura` |
| `formacao_tecnica` | Não | `Técnico em Segurança do Trabalho` |
| `certificacao_edn` | Não | `sim` ou `nao` |
| `status` | Não | `ativo`, `inativo`, `ferias`, `afastado` |
| `role` | Não | `colaborador` |

\* Ou `id` (UUID) se o usuário já existir no Auth.

\** Se informar um, informe ambos. DDD com 2 dígitos; telefone com 8 ou 9 dígitos.

## Relatório de erros por linha

Linhas inválidas não interrompem a importação das demais. A UI exibe mensagens como:

- `Erro na linha 3: Telefone inválido (informe 8 ou 9 dígitos).`
- `Erro na linha 5: data_nascimento "32/13/2000" inválida (use AAAA-MM-DD ou DD/MM/AAAA).`

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

## Migration do banco

Aplique `supabase/migrations/20260528120000_cadastro_colaborador_completo.sql` no projeto Supabase.

## Quem pode importar

RH, CEO ou Admin (tab **Admin** → Importar planilha).
