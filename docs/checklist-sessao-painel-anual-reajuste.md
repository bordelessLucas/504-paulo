# Checklist — Sessão: Painel Anual + Reajuste (Gestor)

Resumo do que foi implementado nesta sessão de desenvolvimento.

---

## 1. Painel Anual Estratégico (P0)

### Banco de dados
- [x] Enum `tipo_avaliacao` + valor **`anual`**
- [x] Tabela **`decisoes_anuais_estrategicas`** (benefício, justificativa, médias, ano, vínculo)
- [x] RLS: leitura/inserção para RH, CEO, Gerente e Admin
- [x] Política INSERT em `avaliacoes` tipo `anual` (marcador formal do ciclo)
- [x] Script: `sql/migrate_tipo_anual_decisoes.sql`

### App
- [x] `src/features/anual/painel-anual-api.ts` — médias quinzenal/semestral do ano + salvar decisão
- [x] `src/screens/admin/painel-anual-estrategico.tsx` — painel estilo Notion
- [x] Tipos em `types/supabase.ts`: `anual`, `TipoBeneficioAnual`, tabela `decisoes_anuais_estrategicas`
- [x] Helper `isPainelAnualEstrategicoRole()`
- [x] Label do ciclo anual em `ciclos.ts`

### Navegação
- [x] Tab **Anual** para CEO, Admin, RH e Gerente
- [x] `PainelAnualEstrategico` em `types.ts`, `role-menus.ts`, `RoleTabNavigator.tsx`

### Fluxo na tela
- [x] Lista colaboradores ativos
- [x] Média **quinzenal** e **semestral** do ano corrente
- [x] Dropdown de benefício: Reajuste, PLR, Bonificação, Nenhum
- [x] Campo justificativa financeira / impacto no caixa
- [x] Salva `avaliacoes` (anual) + `decisoes_anuais_estrategicas`
- [x] Bloqueio de duplicata (1 decisão por colaborador/ano)

---

## 2. Painel de Reajuste — Gestor + Elegibilidade

### Acesso
- [x] Tab **Reajuste** (`PainelReajuste`) para **`gestor`** e **`gerente`**
- [x] **`supervisor`** continua sem tab de reajuste
- [x] Renomeio de `Estrategico` → `PainelReajuste` (label: "Reajuste")
- [x] `estrategico-screen.tsx` mantido como re-export legado

### Regras de negócio
- [x] Elegibilidade: média geral **≥ 2.0** e pelo menos 1 resposta
- [x] Bloqueio do formulário + alerta laranja/vermelho se inelegível
- [x] Mensagem: *"Colaborador inelegível para reajuste devido à média de performance (Abaixo de 2.0)"*
- [x] Validação também no servidor (`createSolicitacaoMelhoria`)

### Formulário
- [x] **Tipo de solicitação**: Reajuste, Vale, Bonificação, Curso
- [x] Componente `TipoSolicitacaoSelect` (estilo select HTML)
- [x] Justificativa obrigatória (mín. 10 caracteres)
- [x] Tipo + média incluídos no texto salvo em `melhorias_salariais`

### Arquivos
- [x] `src/screens/gerente/painel-reajuste-screen.tsx`
- [x] `src/features/reajuste/eligibility.ts`
- [x] `src/features/reajuste/types.ts`
- [x] `src/components/reajuste/tipo-solicitacao-select.tsx`
- [x] `src/features/aprovacoes/api.ts` — `createSolicitacaoMelhoria` atualizado

### Banco (RLS)
- [x] Política INSERT para **gestor** em `melhorias_salariais`
- [x] Script: `sql/fix_melhorias_gestor_insert.sql`
- [x] Atualização em `sql/melhorias_salariais_rls.sql`

---

## 3. Deploys pendentes (Supabase)

Executar no **SQL Editor** se ainda não rodou nesta sessão:

| Ordem | Script |
|-------|--------|
| 1 | `sql/migrate_tipo_anual_decisoes.sql` |
| 2 | `sql/fix_melhorias_gestor_insert.sql` |

---

## 4. Teste rápido pós-deploy

| # | Cenário | Papel |
|---|---------|-------|
| 1 | Tab **Anual** visível | CEO / RH / Gerente |
| 2 | Consolidar médias quinzenal + semestral e registrar decisão | CEO |
| 3 | Tentar segunda decisão no mesmo ano → bloqueio | CEO |
| 4 | Tab **Reajuste** visível | Gestor |
| 5 | Colaborador média &lt; 2.0 → alerta, sem envio | Gestor |
| 6 | Colaborador média ≥ 2.0 → enviar com tipo + justificativa | Gestor |
| 7 | Solicitação aparece em **Aprovações** do RH | RH |

---

## 5. Fora do escopo desta sessão (ainda pendente)

- [ ] Cadastro completo de colaborador (IRATA, telefone, formações…)
- [ ] Status de avaliações **por gestor** no painel CEO
- [ ] PDF em grupo por período
- [ ] Velocímetro IMA
- [ ] Deveres SMS / no-show com bloqueio de elegibilidade
- [ ] Alertas críticos + e-mail/WhatsApp

---

*Sessão: maio/2026*
