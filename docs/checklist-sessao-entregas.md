# Checklist — Sessão de entregas (Avalia)

Resumo do que foi analisado, implementado, documentado e o que precisa de **deploy** manual.

---

## 1. Análise e planejamento

- [x] Confronto do escopo do cliente (Projeto 1 + comunicado oficial) com o app atual
- [x] Identificação do que já existia vs. parcial vs. faltando
- [x] Documento de backlog fase 2: `docs/backlog-implementacao-fase-2.md`
- [x] Gap analysis do comunicado (3 perguntas universais, escala 0–3): `docs/comunicado-oficial-gap-analysis.md`
- [x] Decisão de priorizar o comunicado oficial em vez do modelo antigo de 12 seções (GO1, SB1…)

---

## 2. Metodologia 360° — Avaliação (implementado no app)

- [x] **3 perguntas universais** (P1 Técnica, P2 SMS, P3 Postura) via `fetchPerguntasUniversais()`
- [x] **Escala 0 a 3** (removida nota 5 e evidência obrigatória na UI)
- [x] Legenda da escala no formulário (`EscalaLegenda`)
- [x] **Ciclos por papel**
  - Supervisor → `quinzenal` (Avaliação de Bordo)
  - Gestor / Gerente → `semestral`
- [x] Formulário de avaliação atualizado (`formulario-avaliacao-screen.tsx`)
- [x] Minha Equipe com ciclo correto (`fetchEquipeStatusCiclo`)
- [x] Semáforo do dashboard CEO ajustado para média em escala 0–3

---

## 3. Visibilidade das avaliações (CEO e colaborador)

- [x] **Colaborador** — tab *Minhas Avaliações* com histórico via views mascaradas (sem nome do avaliador)
- [x] **CEO / RH / Admin** — tab *Avaliação* + tela *Histórico* com avaliador visível
- [x] API `historico-api.ts` (masked vs. completo)
- [x] Componente `AvaliacaoHistoricoCard` + tela `HistoricoAvaliacoesScreen`
- [x] Dashboard do colaborador usando `avaliacoes_masked` / `respostas_masked`

---

## 4. O que já existia no MVP (mantido / reforçado na sessão)

- [x] Auth e menus por papel (colaborador, supervisor, gestor, gerente, RH, CEO, admin)
- [x] Fluxo quinzenal básico + Minha Equipe
- [x] Melhoria salarial: gerente → RH → CEO + autoavaliação colaborador (6 meses)
- [x] Dashboard gerencial (radar, semáforo, top/bottom, PDF ficha)
- [x] Cadastro RH + importação CSV + Edge Function `create-colaborador`
- [x] Correções anteriores: `created_at`, grants CEO, join `melhorias_salariais`, picker CSV

---

## 5. Scripts SQL criados / atualizados

| Script | Objetivo | Deploy |
|--------|----------|--------|
| `sql/seed_perguntas_universais.sql` | Insere P1, P2, P3 (`UNIVERSAL`) | **Supabase SQL Editor** |
| `sql/migrate_escala_0_3.sql` | Notas só 0–3 + RLS perguntas `UNIVERSAL` | **Supabase SQL Editor** |
| `sql/fix_avaliacoes_insert_rls.sql` | INSERT/UPDATE em `avaliacoes` e `respostas` para supervisor/gestor/gerente | **Supabase SQL Editor** |
| `sql/fix_avaliacoes_grants_executive.sql` | SELECT para CEO/RH no dashboard | **Supabase SQL Editor** (se ainda não rodou) |
| `sql/fix_avaliacoes_date_column.sql` | Coluna `created_at` + view mascarada | **Supabase SQL Editor** (se ainda não rodou) |
| `sql/melhorias_salariais_rls.sql` | RLS melhorias salariais | **Supabase SQL Editor** (se ainda não rodou) |
| `sql/get_user_id_by_email.sql` | RPC para Edge Function | **Supabase SQL Editor** (se ainda não rodou) |
| `sql/create_supabase_schema.sql` | Schema base atualizado (referência / novos ambientes) | Referência |

---

## 6. Deploys

### 6.1 Supabase (banco + RLS)

Executar no **SQL Editor** do projeto remoto, na ordem recomendada:

1. `fix_avaliacoes_date_column.sql` (se o app ainda não usa `created_at` no remoto)
2. `migrate_escala_0_3.sql`
3. `seed_perguntas_universais.sql`
4. `fix_avaliacoes_insert_rls.sql` ← corrige erro RLS ao salvar avaliação (gerente)
5. `fix_avaliacoes_grants_executive.sql`
6. `melhorias_salariais_rls.sql`
7. `get_user_id_by_email.sql`

**Status:** depende do que já foi colado no painel; após o erro do gerente, o script **insert RLS** é obrigatório.

### 6.2 Supabase Edge Function

```bash
supabase functions deploy create-colaborador
```

- Cria usuário Auth + perfil no cadastro/CSV.
- **Status:** deploy manual na CLI; confirmar se já foi publicada no projeto `fubarmllmpzvgnvcdgzh` (ou ID atual).

### 6.3 App Android (APK — EAS Build)

- [x] `android.package` em `app.json`: `com.borderlesspc12.avalia`
- [x] `eas.json` com perfil `preview` → `buildType: "apk"`
- [ ] Variáveis `EXPO_PUBLIC_SUPABASE_*` no EAS (`env` no `eas.json` ou `eas secret:create`) — conferir se não ficaram placeholders
- [ ] Build: `eas build -p android --profile preview`

**Status:** build iniciado na sessão; baixar o `.apk` em [expo.dev](https://expo.dev) → projeto **avalia** → **Builds** quando concluir.

### 6.4 App (desenvolvimento local)

- `npm start` — não é deploy; uso em dev com `.env` local.

---

## 7. Pendências (fase 2 — não feitas hoje)

- [ ] Painel análise **anual** estratégica (PLR / bonificação coletiva)
- [ ] Reajuste salarial pelo **gestor** (hoje focado no gerente)
- [ ] Cadastro completo (IRATA, telefone, formações, etc.)
- [ ] Deveres: meta zero acidentes / no-show com bloqueio de elegibilidade
- [ ] Status de avaliações **por gestor** no painel CEO
- [ ] PDF em grupo por período
- [ ] Velocímetro IMA

---

## 8. Teste rápido pós-deploy

| # | Teste |
|---|--------|
| 1 | Supervisor avalia colaborador (3 perguntas, notas 0–3) |
| 2 | Gerente salva avaliação sem erro RLS |
| 3 | Colaborador vê *Minhas Avaliações* sem nome do avaliador |
| 4 | CEO abre *Avaliação* → histórico com avaliador |
| 5 | APK instala e login Supabase funciona |

---

*Gerado na sessão de desenvolvimento — maio/2026.*
