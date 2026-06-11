# Checklist — Sessão 28/05/2026 (Avalia)

Resumo completo do que foi implementado, corrigido e documentado nesta sessão.

---

## 1. Cadastro RH — colaborador completo (offshore)

### Banco de dados
- [x] Migration `supabase/migrations/20260528120000_cadastro_colaborador_completo.sql`
- [x] Novos campos em `profiles`: `classificacao`, `nivel_irata`, `data_nascimento`, `ddd`, `telefone`, `expertise`, `formacao_tecnica`, `certificacao_edn`

### App
- [x] `src/components/rh/formulario-colaborador.tsx` — formulário em 3 seções (accordion)
- [x] `src/components/rh/upload-planilha-rh.tsx` — importação CSV com erros por linha
- [x] Edge Function `create-colaborador` atualizada com todos os campos
- [x] Fixture de teste: `fixtures/colaboradores-teste.csv`

### Deploy pendente
- [ ] Aplicar migration no Supabase remoto (se ainda não aplicada)
- [ ] Republicar Edge Function `create-colaborador`

---

## 2. Painel Anual Estratégico

### Banco de dados
- [x] Migration `supabase/migrations/20260528125000_tipo_avaliacao_anual.sql` — enum `anual`
- [x] Migration `supabase/migrations/20260528130000_decisoes_anuais_estrategicas.sql` — tabela + RLS
- [x] Correção erro **PGRST205** (`decisoes_anuais_estrategicas` não encontrada)

### App
- [x] `src/features/anual/painel-anual-api.ts`
- [x] `src/screens/admin/painel-anual-estrategico.tsx`
- [x] Tab **Anual** para CEO, Admin, RH e Gerente
- [x] Fluxo: médias quinzenal/semestral + benefício + justificativa + bloqueio de duplicata

### Layout responsivo (master-detail)
- [x] Desktop (≥ 768px): lista à esquerda, detalhe à direita
- [x] Celular: formulário em **modal** (sheet)
- [x] `src/components/anual/painel-anual-detalhe-colaborador.tsx`
- [x] `SPLIT_LAYOUT_MIN_WIDTH` em `src/constants/layout.ts`
- [x] `ColaboradorRow` com estado `isSelected`

---

## 3. Avaliação — regras e UX

### Justificativa obrigatória
- [x] `src/features/avaliacao/validation.ts` — justificativa exigida para **qualquer nota** (0–3)
- [x] `src/screens/avaliacao/formulario-avaliacao-screen.tsx` — campo sempre visível após selecionar nota

### Ponto de melhoria (modal opcional)
- [x] `src/components/avaliacao/ponto-melhoria-avaliacao-modal.tsx`
- [x] Fluxo: salvar avaliação → modal → salva em `respostas.evidencia`
- [x] `addPontoMelhoriaAvaliacao()` em `src/features/avaliacao/api.ts`
- [x] `submitAvaliacao` retorna `{ avaliacaoId }`

### UI do modal de ponto de melhoria
- [x] Tema light/dark consistente (removido fundo branco fixo)
- [x] Botões "Sim, registrar" (primário) e "Não, obrigado" (secundário) lado a lado
- [x] Ícone, hierarquia tipográfica e sombra sutil no card

---

## 4. Perfil do usuário

### Banco de dados
- [x] Migration `supabase/migrations/20260528140000_profile_avatar.sql`
- [x] Coluna `avatar_url` + bucket `avatars` + políticas RLS de storage

### App
- [x] `expo-image-picker` instalado
- [x] `src/features/perfil/profile-api.ts` + `validation.ts`
- [x] `src/components/perfil/profile-avatar-picker.tsx`
- [x] `src/components/perfil/change-password-form.tsx`
- [x] `src/screens/shared/perfil-screen.tsx` reescrita
- [x] `AuthUser` com `avatarUrl`; `auth-context` carrega `avatar_url` com fallback

### Deploy pendente
- [ ] Aplicar migration `20260528140000_profile_avatar.sql` no Supabase remoto

---

## 5. Responsividade e layout (UI/UX geral)

- [x] `src/constants/layout.ts` — constantes de layout + breakpoint split
- [x] `src/hooks/use-tab-screen-layout.ts` — padding dinâmico
- [x] `src/components/navigation/tab-screen-container.tsx`
- [x] `RoleTabNavigator.tsx` — tab bar com `insets.bottom`
- [x] Toast reposicionado acima da tab bar
- [x] Telas com padding inferior dinâmico
- [x] `SafeAreaProvider` em `src/app/_layout.tsx`

---

## 6. Correção — CEO vendo telas de colaborador

- [x] `src/features/auth/resolve-user-role.ts` — validação de papéis; `role` do `profiles` tem prioridade
- [x] `src/features/auth/auth-context.tsx` — carrega campos base primeiro; `isProfileReady`
- [x] `src/navigation/AppNavigator.tsx` — remove fallback cego para `colaborador`
- [x] Navegação CEO: **Gerencial · Anual · Avaliação · Admin · Aprovações · Perfil**

### Validação pendente
- [ ] Reload/logout-login como CEO e confirmar papel em **Perfil**

---

## 7. Dashboard executivo (CEO) — metodologia 360°

### API
- [x] `src/features/gerencial/dashboard-api.ts` refatorada
- [x] `src/features/gerencial/api.ts` — re-export
- [x] `src/features/gerencial/perguntas-universais.ts` — P1, P2, P3
- [x] Radar 3 eixos: Técnica, SMS, Postura (escala 0–3)
- [x] **IMA** — média global por colaborador ativo
- [x] Status de preenchimento por supervisor/gestor (quinzena/semestre)

### Componentes visuais
- [x] `src/components/gerencial/radar-desempenho-chart.tsx` — escala 0–3
- [x] `src/components/gerencial/ima-gauge-chart.tsx` — velocímetro semicircular
- [x] `src/components/gerencial/status-preenchimento-list.tsx`
- [x] `src/screens/admin/dashboards-gerenciais-screen.tsx` reescrito

---

## 8. Sistema de incidentes — quebra de deveres

### Banco de dados
- [x] Migration `supabase/migrations/20260528150000_incidentes.sql`
- [x] Tabela `incidentes` — tipos: `acidente_sms`, `no_show`, `advertencia`
- [x] RLS: RH/CEO/Admin inserem; gestores leem para elegibilidade
- [x] Trigger de log para incidentes graves (base para e-mail futuro)

### App
- [x] `src/features/incidentes/api.ts` + `validation.ts`
- [x] `src/components/rh/registro-incidente.tsx` — aba **Admin**
- [x] `src/features/colaborador/eligibility.ts` — janela 6 meses + mensagem de bloqueio
- [x] `src/components/colaborador/bloqueio-deveres-hint.tsx`
- [x] Trava **autoavaliação** no dashboard do colaborador
- [x] Trava **reajuste** no painel do gestor
- [x] Validação no servidor (`autoavaliacao-api.ts`, `aprovacoes/api.ts`)

### Deploy pendente
- [ ] Aplicar migration `20260528150000_incidentes.sql` no Supabase remoto

---

## 9. Painel de Reajuste — layout + elegibilidade na lista

### API
- [x] `src/features/reajuste/api.ts` — `fetchColaboradoresReajusteResumo()` em lote
- [x] Média, total de respostas, incidentes e elegibilidade por colaborador

### Componentes
- [x] `src/components/reajuste/colaborador-reajuste-row.tsx` — média + badge (Elegível / Inelegível / Deveres)
- [x] `src/components/reajuste/painel-reajuste-solicitacao.tsx` — formulário + modal

### Layout responsivo
- [x] Desktop: lista à esquerda, solicitação à direita
- [x] Celular: lista em tela cheia + **modal** ao selecionar
- [x] `src/screens/gerente/painel-reajuste-screen.tsx` reescrito

---

## 10. UI — modal de autoavaliação (colaborador)

- [x] `src/features/colaborador/autoavaliacao-modal.tsx` reescrito
- [x] Tema light/dark consistente
- [x] Ícone, labels, hints e inputs com borda
- [x] Botões "Enviar solicitação" (primário) e "Cancelar" (secundário)

---

## 11. Documentação

- [x] `docs/fluxo-teste-app.md`
- [x] `docs/checklist-sessao-entregas.md`
- [x] `docs/checklist-sessao-painel-anual-reajuste.md`
- [x] Este checklist: `docs/checklist-sessao-28-05-2026.md`

---

## 12. Correção — sessão Supabase (`Invalid Refresh Token`)

- [x] `src/lib/supabase-storage.ts` — troca de SecureStore para **AsyncStorage** (limite 2048 bytes corrompia JWT)
- [x] `src/features/auth/session-utils.ts` — `getSafeSession`, limpeza de token inválido
- [x] `src/features/auth/auth-context.tsx` — bootstrap e logout com recuperação graciosa
- [x] `@react-native-async-storage/async-storage` instalado

### Validação pendente
- [ ] Reiniciar app e fazer login limpo após a mudança de storage

---

## 13. Painel Admin CEO — cards + modais + gerar acessos

- [x] `src/screens/admin/painel-admin-screen.tsx` — grid de cards (2 colunas no desktop)
- [x] `src/components/admin/admin-feature-card.tsx`
- [x] `src/components/admin/admin-feature-modal.tsx`
- [x] `src/components/rh/formulario-acesso-plataforma.tsx` — criar login com papel (RH, supervisor, admin, colaborador, etc.)
- [x] `src/features/rh/access-roles.ts` — regras de quem pode atribuir qual papel
- [x] Forms RH com modo `embedded` (modal): colaborador, incidente, planilha
- [x] Edge Function `create-colaborador` — validação de papéis no servidor (CEO/Admin vs RH)

### Cards do painel
| Card | Quem vê |
|------|---------|
| Gerar acesso à plataforma | CEO, Admin |
| Cadastrar colaborador | RH, CEO, Admin |
| Registrar incidente | RH, CEO, Admin |
| Importar planilha RH | RH, CEO, Admin |

### Deploy pendente
- [ ] Republicar Edge Function `create-colaborador`

---

## 14. Alertas em tempo real (notificações)

### Banco de dados
- [x] Migration `supabase/migrations/20260528160000_notificacoes.sql`
- [x] Tabela `notificacoes` + enum `tipo_notificacao` + RLS
- [x] Triggers em: `avaliacoes`, `melhorias_salariais`, `incidentes`, `decisoes_anuais_estrategicas`
- [x] Supabase Realtime habilitado na tabela

### App
- [x] `src/features/notificacoes/api.ts` + `types.ts` + `notifications-context.tsx`
- [x] `src/components/notificacoes/notification-bell.tsx` — sino flutuante com badge
- [x] `src/components/notificacoes/notifications-panel.tsx` — painel de alertas
- [x] Integrado em `AppNavigator.tsx` (toast instantâneo + lista)

### Quem recebe o quê (resumo)
| Evento | Destinatários |
|--------|---------------|
| Avaliação registrada | RH/Admin (validação) |
| Avaliação validada pelo RH | CEO |
| Solicitação / autoavaliação nova | RH |
| RH encaminha ao CEO | CEO |
| Incidente registrado | CEO, RH, gerentes do dept., colaborador |
| Decisão anual | CEO, RH |

### Deploy pendente
- [ ] Aplicar migration `20260528160000_notificacoes.sql`
- [ ] Confirmar Realtime ativo em `notificacoes` no painel Supabase

---

## 15. Fluxo RH valida → CEO aprova (avaliações + solicitações)

### Banco de dados
- [x] Migration `20260528165000_status_devolvida_solicitacao.sql` — status `devolvida` em solicitações
- [x] Migration `20260528170000_fluxo_validacao_rh_ceo.sql`
- [x] Coluna `status` em `avaliacoes` (`status_validacao`: pendente_rh → pendente_ceo → aprovada/recusada/devolvida)
- [x] RLS: RH/Admin validam; **somente CEO** aprova ou recusa definitivamente
- [x] View `avaliacoes_masked` — colaborador só vê avaliações **aprovadas**
- [x] Triggers de notificação atualizados para o novo fluxo

### App
- [x] `src/features/aprovacoes/approval-roles.ts`
- [x] `src/features/aprovacoes/avaliacoes-validacao-api.ts`
- [x] `src/components/aprovacoes/avaliacao-validacao-card.tsx`
- [x] `src/screens/admin/aprovacoes-screen.tsx` — abas **Solicitações** e **Avaliações**
- [x] RH: **Validar e encaminhar** ou **Devolver** (não recusa definitivo)
- [x] CEO: **Aprovar** ou **Recusar** (decisão final)
- [x] Tab **Validações** (RH/Admin) vs **Aprovações** (CEO) em `role-menus.ts`
- [x] Novas avaliações iniciam em `pendente_rh`; mensagem ao salvar: *"enviada para validação do RH"*
- [x] Métricas (reajuste, dashboard CEO, painel anual) usam só avaliações `aprovada`

### Fluxo resumido

**Solicitações:** Gerente/Colaborador → `pendente_rh` → RH valida → `pendente_ceo` → CEO aprova/recusa

**Avaliações:** Avaliador → `pendente_rh` → RH valida → `pendente_ceo` → CEO aprova/recusa

---

## 16. Migrations Supabase (ordem recomendada)

1. [ ] `20260528120000_cadastro_colaborador_completo.sql`
2. [ ] `20260528125000_tipo_avaliacao_anual.sql`
3. [ ] `20260528130000_decisoes_anuais_estrategicas.sql`
4. [ ] `20260528140000_profile_avatar.sql`
5. [ ] `20260528150000_incidentes.sql`
6. [ ] `20260528160000_notificacoes.sql`
7. [ ] `20260528165000_status_devolvida_solicitacao.sql`
8. [ ] `20260528170000_fluxo_validacao_rh_ceo.sql`

```bash
supabase db push
supabase functions deploy create-colaborador
```

---

## 17. Testes manuais sugeridos

### Sessão anterior (ainda válidos)
- [ ] CEO → Dashboard Gerencial: radar 3 eixos, IMA, status gestores
- [ ] CEO → tab **Anual**: split desktop / modal mobile
- [ ] Gestor → tab **Reajuste**: média + badge na lista; split/modal
- [ ] RH → Admin → registrar incidente → colaborador bloqueado em autoavaliação e reajuste
- [ ] Colaborador → modal autoavaliação com UI corrigida
- [ ] Avaliador → modal ponto de melhoria com UI corrigida
- [ ] CEO → Perfil mostra papel **CEO** e tabs corretas

### Entregas de hoje
- [ ] Login após fix de refresh token (sem `AuthApiError`)
- [ ] CEO → Admin → cards abrem modais (gerar acesso, cadastro, incidente, planilha)
- [ ] CEO → Gerar acesso → criar usuário RH/supervisor com papel correto
- [ ] Supervisor avalia → RH recebe alerta → **Validações → Avaliações**
- [ ] RH valida → CEO recebe alerta → **Aprovações → Avaliações** → aprovar
- [ ] Colaborador só vê avaliação após aprovação do CEO
- [ ] Gerente solicita reajuste → RH valida → CEO aprova/recusa
- [ ] RH **devolve** solicitação (status `devolvida`) — CEO não vê como recusada
- [ ] Sino de notificações: badge, toast em tempo real, marcar como lida

---

## 18. Limpeza / próximos passos

- [x] `npx tsc --noEmit` passando
- [ ] Aplicar todas as migrations no Supabase remoto
- [ ] Atualizar `docs/fluxo-teste-app.md` com validação RH/CEO e notificações
- [ ] Commit das alterações (quando solicitado)
- [ ] Opcional: Edge Function de e-mail para incidentes graves
- [ ] Opcional: reenvio de avaliação devolvida pelo avaliador (fluxo de correção)
