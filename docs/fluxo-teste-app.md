# Fluxo de teste — Avalia (app completo)

Roteiro prático para validar o que está implementado, na ordem correta de dependências.

---

## 0. Antes de começar

### Ambiente

```bash
npm start
```

- **Web:** pressione `w` no terminal
- **Celular:** Expo Go + QR code
- **Android:** emulador ou APK EAS

### Banco Supabase (rodar uma vez se ainda não rodou)

| Ordem | Script / migration |
|-------|-------------------|
| 1 | `sql/migrate_escala_0_3.sql` |
| 2 | `sql/seed_perguntas_universais.sql` |
| 3 | `sql/fix_avaliacoes_insert_rls.sql` |
| 4 | `supabase/migrations/20260528120000_cadastro_colaborador_completo.sql` |
| 5 | `supabase/migrations/20260528125000_tipo_avaliacao_anual.sql` |
| 6 | `supabase/migrations/20260528130000_decisoes_anuais_estrategicas.sql` |

### Edge Function

Publicar `create-colaborador` no Supabase (código em `supabase/functions/create-colaborador/index.ts`).

### Contas necessárias

Você precisa de **pelo menos um usuário por papel** em `auth.users` + `profiles.role`:

| Papel | Para testar |
|-------|-------------|
| `rh` ou `admin` | Cadastro, CSV, Aprovações RH, Painel Anual |
| `ceo` | Dashboard gerencial, Aprovações CEO, Histórico completo |
| `supervisor` | Avaliação quinzenal |
| `gestor` ou `gerente` | Avaliação semestral + Reajuste |
| `colaborador` | Dashboard, Minhas Avaliações, Autoavaliação |

**Senha padrão** de contas criadas pelo app/CSV: `12345678`

> Se não tiver contas de gestão, crie no Supabase Auth e defina `profiles.role` manualmente no Table Editor.

---

## 1. Fluxo principal (E2E — ~30 min)

Siga esta sequência. Cada passo alimenta o próximo.

```
RH cadastra colaboradores
    ↓
Supervisor/Gestor avalia colaboradores
    ↓
Colaborador vê histórico (sem avaliador)
    ↓
Gestor/Gerente solicita reajuste
    ↓
RH aprova → CEO aprova
    ↓
CEO vê dashboard gerencial
    ↓
RH/CEO registra decisão anual
```

---

### Passo 1 — Login e navegação por papel

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 1.1 | Login com conta **RH/Admin** | Entra no app, tab inicial **Admin** |
| 1.2 | Verificar tabs visíveis | Admin, Anual, Avaliação, Aprovações, Perfil |
| 1.3 | Logout → login **colaborador** | Tab inicial **Dashboard**; tabs: Dashboard, Avaliações, Perfil |
| 1.4 | Logout → login **supervisor** | Tab inicial **Avaliação**; tabs: Avaliação, Equipe, Perfil |
| 1.5 | Logout → login **gestor** | Tabs: Avaliação, Equipe, **Reajuste**, Perfil |
| 1.6 | Logout → login **CEO** | Tab inicial **Gerencial**; tabs: Gerencial, Anual, Avaliação, Admin, Aprovações, Perfil |

---

### Passo 2 — Cadastro RH (ficha offshore)

**Quem:** RH, CEO ou Admin  
**Onde:** Tab **Admin**

#### 2A — Formulário manual

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 2.1 | Abrir seções do formulário | 3 accordions: Dados pessoais, Contratuais, Certificações |
| 2.2 | Cadastrar colaborador completo | Mensagem de sucesso |
| 2.3 | Campos de teste | E-mail novo, nome, nascimento `15/03/1990`, DDD `21`, tel. `987654321`, classificação `Offshore Pleno`, IRATA `N2`, EDN marcado, status `Ativo` |
| 2.4 | Validar erros | E-mail inválido, DDD `2`, data `32/13/2000` → mensagens nos campos |
| 2.5 | Supabase → `profiles` | Registro com todos os campos novos preenchidos |

#### 2B — Importação CSV

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 2.6 | Importar `fixtures/colaboradores-teste.csv` | `5 perfil(is) importado(s) com sucesso` |
| 2.7 | Login com `colaborador1@teste.com` / `12345678` | Entra como colaborador |
| 2.8 | CSV com erros (criar arquivo de teste) | Linhas válidas importam; relatório lista `Erro na linha X: ...` |

**CSV de erros (copiar e salvar como `erros-teste.csv`):**

```csv
email,nome,ddd,telefone,data_nascimento,status
ok@teste.com,João OK,21,987654321,01/01/1990,ativo
erro1@teste.com,Maria Erro,21,123,01/01/1990,ativo
erro2@teste.com,Pedro Erro,21,987654321,32/13/2000,ativo
erro3@teste.com,Ana Erro,21,987654321,01/01/1990,inexistente
```

---

### Passo 3 — Avaliação 360° (3 perguntas, escala 0–3)

**Pré-requisito:** Perguntas P1, P2, P3 no banco (`seed_perguntas_universais.sql`).

#### 3A — Supervisor (quinzenal)

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 3.1 | Login **supervisor** → tab **Avaliação** | Lista de colaboradores ativos |
| 3.2 | Selecionar colaborador → **Avaliar** | Formulário com 3 perguntas universais |
| 3.3 | Ver legenda da escala | Notas 0, 1, 2, 3 com descrições |
| 3.4 | Preencher notas + justificativas → Salvar | Sucesso; sem erro RLS |
| 3.5 | Tab **Equipe** | Status do ciclo quinzenal atualizado |

#### 3B — Gestor ou Gerente (semestral)

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 3.6 | Login **gestor** ou **gerente** → tab **Avaliação** | Lista de colaboradores |
| 3.7 | Avaliar o mesmo colaborador | Ciclo **semestral** (não quinzenal) |
| 3.8 | Salvar avaliação | Sucesso |

#### 3C — Histórico (CEO vs colaborador)

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 3.9 | Login **CEO** → Avaliação → colaborador → **Histórico** | Vê nome do **avaliador** |
| 3.10 | Login **colaborador** → tab **Avaliações** | Vê histórico **sem** nome do avaliador |
| 3.11 | Dashboard colaborador | Média geral e feedbacks atualizados |

---

### Passo 4 — Reajuste / melhoria salarial

#### 4A — Gestor ou Gerente solicita

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 4.1 | Login **gestor** ou **gerente** → tab **Reajuste** | Lista de colaboradores ativos |
| 4.2 | Selecionar colaborador **com média ≥ 2.0** | Botão de envio habilitado |
| 4.3 | Escolher tipo: Reajuste, Vale, Bonificação ou Curso | Select funciona |
| 4.4 | Preencher justificativa → Enviar | Toast de sucesso |
| 4.5 | Colaborador com média **< 2.0** | Alerta laranja/vermelho; envio bloqueado |

#### 4B — RH aprova

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 4.6 | Login **RH** → tab **Aprovações** | Solicitações `pendente_rh` |
| 4.7 | Aprovar solicitação | Status muda para `pendente_ceo` |

#### 4C — CEO aprova

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 4.8 | Login **CEO** → tab **Aprovações** | Solicitações `pendente_ceo` |
| 4.9 | Aprovar | Status final `aprovado` (ou rejeitar → `rejeitado`) |

---

### Passo 5 — Dashboard gerencial (CEO)

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 5.1 | Login **CEO** → tab **Gerencial** | Carrega sem erro |
| 5.2 | Verificar componentes | Semáforo, radar, ranking top/bottom |
| 5.3 | Exportar PDF de um colaborador | PDF gerado/compartilhado |

---

### Passo 6 — Painel Anual Estratégico

**Pré-requisito:** Colaborador com avaliações no **ano corrente** (passos 3.x).

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 6.1 | Login **RH** ou **CEO** → tab **Anual** | Lista carrega (sem PGRST205) |
| 6.2 | Selecionar colaborador | Médias quinzenal e semestral do ano |
| 6.3 | Escolher benefício: Reajuste, PLR, Bonificação ou Nenhum | Chips/select funcionam |
| 6.4 | Preencher justificativa financeira → Salvar | Toast de sucesso |
| 6.5 | Reabrir mesmo colaborador/ano | Decisão já salva aparece |
| 6.6 | Tentar salvar de novo no mesmo ano | Bloqueio de duplicata |

---

### Passo 7 — Colaborador (autoavaliação)

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 7.1 | Login **colaborador** com ≥ 6 meses de admissão | Dashboard mostra opção de autoavaliação |
| 7.2 | Abrir modal de autoavaliação → enviar | Solicitação criada |
| 7.3 | Tab **Perfil** | Dados do perfil visíveis |

---

## 2. Testes por papel (referência rápida)

### Colaborador
- [ ] Dashboard com média e feedbacks
- [ ] Minhas Avaliações (histórico mascarado)
- [ ] Autoavaliação (se elegível)
- [ ] Perfil

### Supervisor
- [ ] Avaliação quinzenal (P1, P2, P3)
- [ ] Minha Equipe (status do ciclo)
- [ ] **Não** tem tab Reajuste

### Gestor
- [ ] Avaliação semestral
- [ ] Minha Equipe
- [ ] Painel Reajuste + trava média ≥ 2.0
- [ ] **Não** tem tab Anual

### Gerente
- [ ] Tudo do gestor +
- [ ] Tab Anual

### RH
- [ ] Admin: cadastro manual + CSV
- [ ] Aprovações (visão RH)
- [ ] Avaliação + Histórico completo
- [ ] Painel Anual

### CEO
- [ ] Dashboard gerencial + PDF
- [ ] Aprovações (visão CEO)
- [ ] Admin + Anual + Avaliação

### Admin
- [ ] Mesmas permissões de RH + CEO nas tabs disponíveis

---

## 3. Verificação no Supabase (SQL)

```sql
-- Perguntas universais
SELECT codigo, descricao FROM perguntas WHERE secao_departamento = 'UNIVERSAL';

-- Últimos perfis cadastrados
SELECT nome, classificacao, nivel_irata, ddd, telefone, certificacao_edn, status, role
FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Avaliações recentes
SELECT a.tipo, p.nome AS avaliado, a.created_at
FROM avaliacoes a
JOIN profiles p ON p.id = a.avaliado_id
ORDER BY a.created_at DESC LIMIT 10;

-- Solicitações de melhoria
SELECT m.status, c.nome AS colaborador, m.justificativa, m.created_at
FROM melhorias_salariais m
JOIN profiles c ON c.id = m.colaborador_id
ORDER BY m.created_at DESC LIMIT 10;

-- Decisões anuais
SELECT * FROM decisoes_anuais_estrategicas ORDER BY created_at DESC LIMIT 5;
```

---

## 4. Problemas comuns

| Sintoma | Solução |
|---------|---------|
| Formulário sem perguntas | Rodar `seed_perguntas_universais.sql` |
| Erro RLS ao salvar avaliação | Rodar `fix_avaliacoes_insert_rls.sql` |
| `PGRST205` decisoes_anuais | Rodar migrations `20260528125000` + `20260528130000` |
| Erro ao cadastrar (coluna inexistente) | Rodar migration `cadastro_colaborador_completo` |
| Edge Function falha | Republicar `create-colaborador` |
| Painel Anual sem médias | Avaliar colaborador antes (passo 3) |
| Reajuste bloqueado | Colaborador precisa média ≥ 2.0 em avaliações |
| CSV importa 0 linhas | Conferir cabeçalhos do `colaboradores-teste.csv` |

---

## 5. Smoke test (5 minutos)

Checklist mínimo antes de demonstrar ao cliente:

1. [ ] Login RH → Admin → cadastrar 1 colaborador
2. [ ] Importar `colaboradores-teste.csv`
3. [ ] Login supervisor → avaliar 1 colaborador (3 perguntas, nota 0–3)
4. [ ] Login colaborador → ver avaliação em Minhas Avaliações (sem avaliador)
5. [ ] Login gestor → Reajuste → enviar solicitação
6. [ ] Login RH → Aprovações → aprovar
7. [ ] Login CEO → Gerencial carrega + Anual salva decisão

---

## 6. Arquivos úteis

| Arquivo | Uso |
|---------|-----|
| `fixtures/colaboradores-teste.csv` | Importação feliz |
| `fixtures/LEIA-ME-importacao-csv.md` | Colunas e regras do CSV |
| `docs/checklist-sessao-entregas.md` | Deploy SQL completo |
| `docs/checklist-sessao-painel-anual-reajuste.md` | Detalhes painel anual + reajuste |
