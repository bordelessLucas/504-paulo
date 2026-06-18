# Comunicado Oficial — Gap Analysis (Metodologia 360°)

Referência: **Comunicado de Lançamento** (escala 0–3, **3 perguntas universais**, ciclos quinzenal/semestral/anual).

> Este documento **substitui** no planejamento o modelo antigo de 12 seções (GO1, SB1…).  
> Ver também: `docs/backlog-implementacao-fase-2.md` para itens gerais.

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
| 2.1 | Reajuste — **gestores e gerente** | Implementado (gestor + gerente → RH → CEO) |
| 2.2 | Autoavaliação — colaborador | Implementado |

### Deveres (elegibilidade)

- Meta Zero Acidentes (SMS) — bloqueio via incidentes recentes
- Evitar faltas / no-show em embarques — bloqueio via incidentes recentes

---

## ✅ Implementado no MVP (consolidado jun/2026)

| Item | Detalhe técnico |
|------|-----------------|
| Login por 7 papéis | colaborador, supervisor, gestor, gerente, rh, ceo, admin |
| Escala 0–3 | `score-picker`, validação, legenda no formulário |
| 3 perguntas universais | `fetchPerguntasUniversais()`, seção `UNIVERSAL` |
| Ciclos quinzenal / semestral / anual | Tipo por papel; filtros em histórico e equipe |
| Fluxo RH → CEO | Avaliações e `melhorias_salariais` com `pendente_rh` → `pendente_ceo` → `aprovada` |
| Colaborador vê só aprovadas | Views `avaliacoes_masked` / `respostas_masked` |
| Avaliações em análise (colaborador) | Dashboard lista status sem notas (`pendente_rh`, `pendente_ceo`) |
| Semáforo pessoal | Dashboard colaborador com `DesempenhoSemaforo` |
| Minhas solicitações | Autoavaliação e reajuste com status no dashboard |
| Escopo por departamento + `lider_id` | `colaborador-scope.ts` + migration `20260618120000` |
| Cadastro RH completo | Ficha offshore + CSV com relatório de erros por linha |
| Badge pendências | Tab/drawer em Validações/Aprovações (RH e CEO) |
| Confirmação antes de enviar | Alert em avaliação e reajuste |
| PDF ficha colaborador | Ficha offshore completa: cadastro, semáforo, radar, P1/P2/P3, melhorias, decisões anuais |
| Exportação PDF em lote | Por departamento e período no dashboard gerencial |
| Painel anual estratégico | Veredito anual; admin pode registrar; gerente em modo consulta |
| Navegação responsiva | Sidebar desktop + bottom tabs mobile |
| Deep link em notificações | Navega para aba contextual |
| Incidentes / deveres | Bloqueio autoavaliação e reajuste |

---

## 🟡 Parcial — melhorias futuras

| Item | Hoje | Próximo passo |
|------|------|---------------|
| Hierarquia `lider_id` | Campo no cadastro; escopo com fallback departamento | Popular dados em massa; validar cadeia multi-nível |
| Comunicado in-app | Copy nos formulários | Tela “Metodologia” ou onboarding |
| PDF ficha | Ficha offshore A4 com semáforo e radar em HTML | — |
| CSV import | Erros por linha | Suporte a coluna `lider_id` no template |

---

## ❌ Backlog pós-MVP

| Item | Prioridade |
|------|------------|
| Notificações push nativas (além do painel in-app) | P2 |
| Relatórios exportáveis em lote (RH) | P2 |
| Auditoria de alterações em perfis | P3 |

---

## Decisões rápidas com o cliente

1. Notas **0 e 1** exigem justificativa como 2 e 3? (comunicado não detalha; hoje só 2 e 3)
2. Supervisor de bordo pode solicitar **reajuste** ou só gestores de base?
3. Hierarquia `lider_id`: um único líder ou cadeia (supervisor → gestor → gerente)?
4. Gestores “Integridade” = papel `gestor` com departamento fixo?

---

*Atualizado: junho/2026 — MVP consolidado*
