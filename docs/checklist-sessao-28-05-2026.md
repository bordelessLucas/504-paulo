# Checklist — Sessão 28/05/2026 (Avalia)

Resumo do que foi implementado, corrigido e documentado nesta sessão.

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

---

## 3. Avaliação — regras e UX

### Justificativa obrigatória
- [x] `src/features/avaliacao/validation.ts` — justificativa exigida para **qualquer nota** (0–3)
- [x] `src/screens/avaliacao/formulario-avaliacao-screen.tsx` — campo sempre visível após selecionar nota

### Ponto de melhoria (modal opcional)
- [x] `src/components/avaliacao/ponto-melhoria-avaliacao-modal.tsx`
- [x] Fluxo: salvar avaliação → modal "Gostaria de deixar um ponto de melhoria?" → salva em `respostas.evidencia`
- [x] `addPontoMelhoriaAvaliacao()` em `src/features/avaliacao/api.ts`
- [x] `submitAvaliacao` retorna `{ avaliacaoId }`

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
- [x] `src/screens/shared/perfil-screen.tsx` reescrita (nome, e-mail, papel, foto, trocar senha)
- [x] `AuthUser` com `avatarUrl`; `auth-context` carrega `avatar_url`

### Deploy pendente
- [ ] Aplicar migration `20260528140000_profile_avatar.sql` no Supabase remoto

---

## 5. Responsividade e layout (UI/UX)

- [x] `src/constants/layout.ts` — constantes de layout
- [x] `src/hooks/use-tab-screen-layout.ts` — padding dinâmico
- [x] `src/components/navigation/tab-screen-container.tsx`
- [x] `RoleTabNavigator.tsx` — tab bar com `insets.bottom` (sem altura fixa)
- [x] Toast reposicionado acima da tab bar
- [x] Telas com `edges={['top']}` e padding inferior dinâmico
- [x] `SafeAreaProvider` em `src/app/_layout.tsx`
- [x] Lista de colaboradores com paginação e `FlatList` com `flex: 1`

---

## 6. Correção — CEO vendo telas de colaborador

### Problema
- Conta CEO (`franklyn.lima22@gmail.com`) com `role: 'ceo'` no banco, mas app exibia tabs de colaborador.

### Causa
- Fallback silencioso para `colaborador` quando `role` não carregava (falha no SELECT do profile, inclusive por `avatar_url` inexistente).

### Correções
- [x] `src/features/auth/resolve-user-role.ts` — normalização e validação de papéis; `role` do `profiles` tem prioridade
- [x] `src/features/auth/auth-context.tsx` — carrega campos base primeiro; `avatar_url` em query separada; `isProfileReady`; `onAuthStateChange` aguarda `syncSession`
- [x] `src/navigation/AppNavigator.tsx` — remove fallback cego; aguarda perfil; tela de erro + retry/sair se sem role; `RoleTabNavigator key={role}`
- [x] `src/hooks/use-auth-role.ts` — expõe `isProfileReady` e `isGerencialDashboard`

### Navegação esperada para CEO
- [x] Tabs: **Gerencial · Anual · Avaliação · Admin · Aprovações · Perfil**
- [x] Tela inicial: **Gerencial**

### Validação pendente
- [ ] Reload do app (tecla `r` no Expo) ou logout/login com `franklyn.lima22@gmail.com`
- [ ] Confirmar em **Perfil** que o papel exibe **CEO**

---

## 7. Documentação

- [x] `docs/fluxo-teste-app.md` — fluxo de teste do app por papel
- [x] `docs/checklist-sessao-entregas.md` — entregas gerais (sessões anteriores)
- [x] `docs/checklist-sessao-painel-anual-reajuste.md` — painel anual + reajuste
- [x] Este checklist: `docs/checklist-sessao-28-05-2026.md`

---

## 8. Migrations Supabase (ordem recomendada)

1. [ ] `20260528120000_cadastro_colaborador_completo.sql`
2. [ ] `20260528125000_tipo_avaliacao_anual.sql`
3. [ ] `20260528130000_decisoes_anuais_estrategicas.sql`
4. [ ] `20260528140000_profile_avatar.sql`

---

## 9. Arquivos principais alterados hoje

| Área | Arquivos |
|------|----------|
| Auth / papel | `auth-context.tsx`, `resolve-user-role.ts`, `AppNavigator.tsx`, `use-auth-role.ts` |
| Layout | `tab-screen-container.tsx`, `use-tab-screen-layout.ts`, `RoleTabNavigator.tsx`, `toast.tsx`, `_layout.tsx` |
| Avaliação | `validation.ts`, `formulario-avaliacao-screen.tsx`, `ponto-melhoria-avaliacao-modal.tsx`, `api.ts` |
| Perfil | `perfil-screen.tsx`, `profile-api.ts`, `profile-avatar-picker.tsx`, `change-password-form.tsx` |
| RH | `formulario-colaborador.tsx`, `upload-planilha-rh.tsx`, `create-colaborador` (edge) |
| SQL | 4 migrations em `supabase/migrations/` |

---

## 10. Testes manuais sugeridos (pós-reload)

- [ ] Login como CEO → tabs Gerencial / Anual / Admin visíveis
- [ ] Perfil → papel **CEO**, foto e troca de senha
- [ ] Avaliação → justificativa obrigatória em qualquer nota
- [ ] Avaliação → modal de ponto de melhoria ao finalizar
- [ ] RH → cadastro manual e importação CSV com campos offshore
- [ ] Painel Anual → consolidar médias e registrar decisão
- [ ] Layout → botões não sobrepostos à tab bar em telas longas

---

## 11. Limpeza / próximos passos

- [x] Scripts temporários de diagnóstico removidos (`scripts/check-ceo-roles.mjs`, etc.)
- [x] `npx tsc --noEmit` passando
- [ ] Atualizar `docs/fluxo-teste-app.md` com cenários de Perfil e ponto de melhoria (opcional)
- [ ] Commit das alterações (quando solicitado)
