# Backlog — Implementação Fase 2

Documento de referência com base no escopo enviado pelo cliente (Projeto 1 – Avaliação de Performance).  
Organizado por tópicos para planejamento incremental após o MVP atual.

> **Fonte de verdade atual:** [Comunicado Oficial — Metodologia 360°](comunicado-oficial-gap-analysis.md)  
> (3 perguntas universais, escala 0–3, ciclos 1.1/1.2/1.3). O modelo de 12 seções (GO1, SB1…) fica **fora** do escopo imediato salvo pedido explícito.

**Legenda de prioridade**

| Sigla | Significado |
|-------|-------------|
| P0 | Bloqueia aderência ao modelo do cliente |
| P1 | Alto valor de negócio; próximo ciclo de entrega |
| P2 | Melhoria relevante; pode aguardar |
| P3 | Fase 2+ / integrações externas |

**Status atual (MVP)** — já entregue em linhas gerais: auth por papel, avaliação quinzenal, melhoria salarial (gestor → RH → CEO), autoavaliação colaborador, dashboard CEO (radar, semáforo, top/bottom), PDF ficha individual, cadastro/CSV básico.

---

## 1. Cadastro do colaborador

### 1.1 Campos faltantes na UI e no CSV

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Classificação e nível IRATA | P1 | Expor no formulário RH e no CSV; colunas já existem em `profiles` |
| Data de nascimento e idade calculada | P1 | Campo de nascimento + exibição de idade (dia/mês/ano) |
| Tempo de empresa | P2 | Calculado a partir de `data_admissao` (somente leitura) |
| DDD e telefone | P1 | Novas colunas em `profiles` + máscara na UI |
| Expertise / especialidade | P1 | Nova coluna + campo no cadastro e perfil |
| Formação acadêmica e técnica | P1 | Novas colunas ou JSON estruturado |
| Certificação EDN | P1 | Campo dedicado com validade opcional |
| Código interno (“item”) | P2 | Identificador legado do cliente para relatórios |
| Status Ativo/Inativo | P1 | Já no schema; garantir filtro em listagens e bloqueio de avaliação |

**Entregáveis sugeridos:** migration SQL, atualização de tipos TypeScript, formulário RH, template CSV documentado em `fixtures/`.

### 1.2 Importação em lote

| Item | Prioridade | Descrição |
|------|------------|-----------|
| CSV com todos os campos | P1 | Estender `upload-profiles-batch` e Edge `create-colaborador` |
| Validação e relatório de erros por linha | P2 | Resumo “X criados, Y falhas” com motivo |
| Edição em massa | P3 | Atualizar perfis existentes via CSV |

---

## 2. Painel de avaliação de performance

### 2.1 Modelo de perguntas (12 seções A–L)

O cliente define **12 seções de avaliação** (Gerente de Operações, Supervisor de Bordo, Logística, RH/Equipe, etc.), cada uma com **3 perguntas** e pesos 1 ou 3 — não os 12 departamentos corporativos usados hoje no radar.

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Seed das perguntas (GO1–IN3) | P0 | Script SQL ou painel admin para popular `perguntas` conforme documento |
| Mapeamento seção → papel avaliador | P0 | Quem preenche SB (supervisor), GO (gerente ops), etc. |
| Cabeçalho da ficha | P2 | Funcionário, cargo, data, gestor avaliador no topo do formulário/PDF |
| Classificação automática (coluna D) | P2 | Fórmula por faixa de nota 0–3 após cada resposta |

**Referência de códigos:** GO1–GO3, SB1–SB3, LO1–LO3, ME1–ME3, PR1–PR3, MA1–MA3, TR1–TR3, SM1–SM3, RH1–RH3, FA1–FA3, PC1–PC3, IN1–IN3.

### 2.2 Periodicidade e fluxos

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Quinzenal – Avaliação de Bordo | P1 | UI e copy dedicados; supervisor de bordo; ciclo por embarque/quinzena |
| Semestral – Avaliação de Gestores | P0 | Lista, pendências, formulário e regras para `tipo = semestral` |
| Anual – Análise Estratégica (2.3) | P1 | Painel RH + gerente admin + gerente direto: decisões PLR, bonificação, reajuste coletivo |
| Histórico arquivado | P2 | Mover avaliações concluídas para repositório ou flag `arquivada` + view somente leitura |

### 2.3 Escala e validação

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Alinhar escala 0–3 vs 0–1–2–3–5 | P0 | Decisão com cliente; ajustar `validation.ts`, UI e documentação |
| Metodologia de escala (doc.) | P2 | Tela ou PDF interno explicando faixas |
| Matriz de peso documentada | P2 | Exibir peso 3 (GO, SB) vs peso 1 nas demais seções |

### 2.4 Governança operacional

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Regra 4 e 12 meses (direitos e deveres) | P2 | Marcos de carreira; alertas ou bloqueios por tempo de casa |
| Métrica 5 perguntas × 12 dept. (versão antiga do doc.) | P3 | Só se cliente confirmar que ainda usa 5 perguntas em algum departamento |

---

## 3. Melhoria salarial e carreira

### 3.1 Fluxos existentes — refinamentos

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Reajuste pelo gestor de base | P1 | Tab ou ação para `gestor`/`supervisor`, não só `gerente` |
| Tipos de benefício | P2 | Select: reajuste %, vale, PLR, outros + justificativa |
| Histórico na ficha individual | P1 | Incluir `melhorias_salariais` no PDF e tela do colaborador |
| Notificações por e-mail | P2 | Ao mudar status (pendente RH, CEO, aprovado) |

### 3.2 Autoavaliação

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Anexo de certificados/qualificações | P2 | Storage Supabase + vínculo na solicitação |
| Regras 4/12 meses além dos 6 meses atuais | P2 | Conforme governança do cliente |

---

## 4. Relatórios e dashboards

### 4.1 PDF e fichas

| Item | Prioridade | Descrição |
|------|------------|-----------|
| PDF em grupo por período | P1 | Seleção de departamento/período; múltiplas fichas ou resumo |
| Ficha completa | P1 | Avaliações + melhorias salariais + semáforo no período |
| Layout A4 alinhado à planilha do cliente | P2 | Cabeçalho “PAINEL DE AVALIAÇÃO DE PERFORMANCE - OFFSHORE” |

### 4.2 Dashboards interativos

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Velocímetro IMA | P1 | Indicador único de performance; definir fórmula com cliente |
| Radar por eixos de avaliação (A–L) | P1 | Alternativa ou complemento ao radar por departamento |
| Filtros por período, gestor, departamento | P2 | CEO e RH |
| Semáforo cinza/laranja | P2 | Revisar regras se cliente exigir 5 cores exatas |

### 4.3 Painel gerencial de avaliações

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Status por gestor | P0 | “Gestor X: N avaliações pendentes / concluídas na quinzena/semestre” |
| Ranking (já parcial) | P1 | Manter top/bottom; link direto para ficha |
| Colaboradores com menor desempenho | P1 | Lista dedicada + ações (feedback, plano) |

---

## 5. Experiência por papel

| Papel | Itens sugeridos | Prioridade |
|-------|-----------------|------------|
| Colaborador | Tela **Minhas Avaliações** (hoje placeholder) | P0 |
| Colaborador | Ver semáforo e média por período | P1 |
| Supervisor | Fluxo quinzenal “bordo” explícito | P1 |
| Gestor | Semestral + solicitação de reajuste | P1 |
| Gerente | Análise anual separada de “Estratégico” salarial | P1 |
| RH | Painel semestral/anual; cadastro completo | P1 |
| CEO | Status por gestor + exportações | P0 |

---

## 6. Funcionalidades transversais

### 6.1 Alertas e incidentes

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Registro de incidentes graves | P2 | Nova tabela + formulário |
| E-mail imediato para gestores | P2 | Supabase Edge + SMTP ou Resend |
| WhatsApp | P3 | API Business (Twilio, Meta); custo e LGPD |

### 6.2 Dados e infraestrutura

| Item | Prioridade | Descrição |
|------|------------|-----------|
| Views para relatórios | P2 | Agregações por gestor/período |
| Auditoria de alterações | P3 | Log em perfis e avaliações |
| Testes E2E por papel | P2 | Expandir checklist manual existente |

---

## 7. Ordem de implementação sugerida

Fases para negociar com o cliente:

### Fase 2A — Modelo de avaliação correto (4–6 semanas)

1. Decisão escala 0–3  
2. Seed perguntas seções A–L  
3. Fluxo semestral  
4. Status de avaliações por gestor (CEO)  
5. Minhas avaliações (colaborador)

### Fase 2B — Cadastro e relatórios (3–4 semanas)

1. Campos completos de cadastro + CSV  
2. PDF grupo por período  
3. Histórico melhorias na ficha  
4. Velocímetro IMA (fórmula acordada)

### Fase 2C — Estratégico e integrações (4+ semanas)

1. Painel análise anual (PLR/bonificação)  
2. Reajuste por gestor de base  
3. Alertas críticos + e-mail  
4. Governança 4/12 meses  
5. WhatsApp (se aprovado)

---

## 8. Decisões pendentes com o cliente

Antes de codar, confirmar por escrito:

1. Escala final de notas: **0–3** ou manter **0, 1, 2, 3, 5**?  
2. Radar e IMA usam **departamentos** ou **seções A–L**?  
3. Quem preenche cada seção (matriz papel × seção)?  
4. Semestral e anual têm formulários diferentes do quinzenal?  
5. Fórmula do **IMA** e faixas do **semáforo** (5 cores).  
6. PLR/bonificação anual: só registro ou integração financeira?  
7. Canais de alerta: só e-mail ou também WhatsApp?

---

## 9. Referências no repositório

| Área | Caminhos principais |
|------|---------------------|
| Avaliação | `src/features/avaliacao/` |
| Melhorias salariais | `src/features/aprovacoes/`, `src/features/estrategico/` |
| Dashboard CEO | `src/features/gerencial/` |
| Cadastro / CSV | `src/features/rh/`, `supabase/functions/create-colaborador/` |
| SQL | `sql/create_supabase_schema.sql`, `sql/melhorias_salariais_rls.sql` |
| Importação teste | `fixtures/colaboradores-teste.csv`, `fixtures/LEIA-ME-importacao-csv.md` |

---

*Última atualização: maio/2026 — alinhado ao escopo do cliente e ao estado do app 504-paulo.*
