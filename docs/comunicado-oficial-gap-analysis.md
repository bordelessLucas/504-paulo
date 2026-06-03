# Comunicado Oficial — Gap Analysis (Metodologia 360°)

Referência: **Comunicado de Lançamento** (escala 0–3, **3 perguntas universais**, ciclos quinzenal/semestral/anual).

> Este documento **substitui** no planejamento o modelo antigo de 12 seções (GO1, SB1…).  
> Ver também: `docs/backlog-implementacao-fase-2.md` para itens gerais (cadastro, PDF, alertas).

---

## Modelo oficial (resumo)

### Escala 0 a 3

| Nota | Significado |
|------|-------------|
| 0 | Insuficiente — correção imediata |
| 1 | Regular — falhas frequentes |
| 2 | Bom — atende padrões |
| 3 | Excelente — referência |

### 3 perguntas universais (todos os ciclos)

| # | Tema | Texto (comunicado) |
|---|------|-------------------|
| 1 | Técnica e Prazos | Executa com excelência técnica, cumpre prazos e entrega relatórios? |
| 2 | Segurança e SMS | Cumpre normas SMS, postura segura e meta zero acidentes? |
| 3 | Postura e Convivência | Comportamento em viagens, pontualidade em embarques e convivência na base? |

### Ciclos

| Código | Nome | Quem avalia | Foco |
|--------|------|-------------|------|
| 1.1 | Quinzenal – Bordo | Supervisor de bordo | Trecho / embarque |
| 1.2 | Semestral – Gestores | Gestores de base (Logística, Projetos, Integridade) | Comportamento acumulado, relatórios, entregas |
| 1.3 | Anual – Análise Estratégica | Gerente Admin, RH, Gerente direto | PLR, bonificação, reajuste coletivo (sustentabilidade do caixa) |

### Melhoria salarial

| Código | Quem | Status no app |
|--------|------|---------------|
| 2.1 | Reajuste — **gestores** | Parcial (só **gerente** hoje) |
| 2.2 | Autoavaliação — colaborador | Implementado |

### Deveres (elegibilidade)

- Meta Zero Acidentes (SMS)
- Evitar faltas / no-show em embarques

---

## ✅ Já implementado (aderente ou próximo)

| Item | Detalhe técnico |
|------|-----------------|
| Login por papéis | supervisor, gestor, gerente, rh, ceo, colaborador |
| Fluxo quinzenal básico | `avaliacoes.tipo = quinzenal`, equipe + formulário |
| Formulário de avaliação | Notas, justificativa (2/3), pontos de melhoria anteriores |
| Autoavaliação (2.2) | Modal colaborador → `melhorias_salariais` |
| Reajuste com aprovação | Gerente → RH → CEO (`melhorias_salariais`) |
| Validação parcial de notas | Bloqueio se justificativa vazia em 2/3 |
| Elegibilidade tempo | 6 meses para autoavaliação (`eligibility.ts`) |
| Dashboard CEO | Radar, semáforo, ranking (escala ainda 0–5 na UI) |

---

## 🟡 Parcial — precisa ajuste ao comunicado

| Item | Hoje | Comunicado |
|------|------|------------|
| Escala de notas | 0, 1, 2, 3, **5** + evidência na nota 5 | Somente **0 a 3** |
| Perguntas | Por `secao_departamento` do avaliador (N perguntas no banco) | **3 universais** fixas |
| Semestral | Tipo existe no enum; UI sempre grava `quinzenal` | Ciclo 1.2 dedicado |
| Reajuste (2.1) | Tab **Estratégico** só para **gerente** | **Gestores** (e critério de notas) |
| Textos na UI | “Departamento”, escala 0–5 | Legenda 0–3 + nomes dos 3 eixos |
| Médias / radar CEO | Calculado sobre escala antiga | Recalcular máx. 3 |

---

## ❌ Ainda não implementado

| Item | Prioridade |
|------|------------|
| Seed SQL das 3 perguntas universais (`P1`, `P2`, `P3`) | P0 |
| Remover nota 5 e campo evidência (ou tornar opcional só legado) | P0 |
| Legenda de notas 0–3 no formulário (tooltips/cards) | P1 |
| UI ciclo **semestral** (lista, tipo, copy “Gestores de base”) | P0 |
| UI ciclo **anual** (1.3) — painel decisão PLR/bonificação | P1 |
| Tipo `anual` no banco (hoje só `quinzenal` \| `semestral`) | P1 |
| Reajuste para papel **gestor** (e supervisor se aplicável) | P1 |
| Critério “atingiu notas” antes de reajuste | P1 |
| **Minhas avaliações** colaborador (placeholder) | P1 |
| Deveres: meta zero acidentes / no-show (registro + elegibilidade) | P2 |
| Comunicado in-app (tela “Metodologia” ou onboarding) | P2 |

---

## Tarefas técnicas recomendadas (ordem)

### Sprint A — Alinhar modelo de avaliação (P0)

1. `sql/seed_perguntas_universais.sql` — 3 linhas em `perguntas` (`codigo`: `P1`, `P2`, `P3`; `secao_departamento`: `UNIVERSAL` ou null)
2. Alterar `fetchPerguntasPorDepartamento` → `fetchPerguntasUniversais()` (ignorar dept. do avaliador)
3. `validation.ts` + `score-picker.tsx`: `ALLOWED_SCORES = [0,1,2,3]`; remover `requiresEvidencia(5)`
4. Constraint SQL `respostas.nota check (nota in (0,1,2,3))` + migration
5. Atualizar copy do formulário e dashboards (máx. 3)

### Sprint B — Ciclos (P0–P1)

1. Parâmetro `tipo` na navegação: quinzenal vs semestral
2. Supervisor → sempre quinzenal; gestor → semestral (Logística/Projetos/Integridade)
3. Filtros em Minha Equipe / listas por ciclo
4. Enum `tipo_avaliacao` + valor `anual` + tela Análise Estratégica (RH + gerentes)

### Sprint C — Melhoria salarial e deveres (P1–P2)

1. Tab ou fluxo **Reajuste** para `gestor`
2. Validar média mínima / sem notas 0 recorrentes antes de solicitar reajuste
3. Tabela `incidentes` ou flags em perfil para SMS / no-show
4. Bloquear autoavaliação/reajuste se deveres violados

---

## Decisões rápidas com o cliente

1. Notas **0 e 1** exigem justificativa como 2 e 3? (comunicado não detalha; hoje só 2 e 3)
2. Supervisor de bordo pode solicitar **reajuste** ou só gestores de base?
3. Análise **anual** é formulário de notas ou só painel de decisão sobre dados agregados?
4. Gestores “Integridade” = papel `gestor` com departamento fixo?

---

*Atualizado: maio/2026*
