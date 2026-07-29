# Sessão 28/07/2026 — Paridade web (Fases 1–3) + o que fazer amanhã

Documento de handoff. Fonte Excel do Paulo: `~/Downloads/Desempenho Rev Jul 24 2026 (1).xlsx`.

---

## O que foi feito hoje

### Objetivo
Levar para o **web** o que o mobile já tinha (funcionalidades, permissões e fluxos), cruzando com o Excel DNA PERFORMANCE.

### Fase 1 — Admin / RH operacional
- `/app/admin` voltou a ser hub operacional (igual mobile):
  - Gerar acesso à plataforma (CEO/Admin)
  - Cadastrar colaborador
  - Registrar incidente
  - Importar planilha CSV
- Nine-box / turnover / sucessão saíram do Admin e foram para **Visão estratégica**

### Fase 2 — Avaliação
- Links corrigidos (`/app/avaliacao/:id`, não rotas órfãs)
- Painel com busca + botão **Formulário em lote**
- Form individual com governança (0/1 → justificativa; 3 → evidência), pontos de melhoria e PDIs abertos
- Histórico por colaborador: `/app/avaliacao/:id/historico`

### Fase 3 — Writes + PDI
- Reajuste: selecionar colaborador e **solicitar** melhoria (tipo + justificativa)
- Cadastro cliente: formulário **Novo cliente**
- Avaliadores: lista enriquecida + CTA para Admin gerar acesso
- PDI: links `/app/pdi/*`, criar na equipe, detalhe com status/progresso/obs/cancelar, comentário do colaborador

### Arquivos principais (web)
- `web/src/pages/AdminDashboardPage.tsx`
- `web/src/components/rh/*` (acesso, colaborador, incidente, CSV, cliente)
- `web/src/pages/FormularioAvaliacaoPage.tsx`, `PainelAvaliacaoPage.tsx`, `HistoricoAvaliacaoColaboradorPage.tsx`
- `web/src/pages/PainelReajustePage.tsx`
- `web/src/pages/CadastroClientePage.tsx`, `CadastroAvaliadoresPage.tsx`
- `web/src/pages/PdiListPage.tsx`, `PdiDetailPage.tsx`, `PdiEquipePage.tsx`
- `web/src/components/pdi/CriarPdiForm.tsx`

### Senha padrão de acessos novos
`senha123` (troca no 1º login se a flag estiver ativa)

### Dev web
```bash
cd web && npm run dev
# http://localhost:5180
```

---

## Como testar (checklist rápido)

Ordem sugerida:

1. **CEO/Admin** → `/app/admin` → gerar acesso + cadastrar colaborador (+ incidente/CSV se der tempo)
2. **Supervisor/Gestor** → Painel de avaliação → lote + individual + histórico
3. **Gerente/RH/CEO** → Reajuste → solicitar em elegível → RH/CEO aprovar
4. **RH** → Cadastro cliente → Novo cliente; Avaliadores → conferir lista + “Gerar acesso”
5. **Gestor** → `/app/pdi-equipe` → criar PDI → detalhe → editar/cancelar
6. **Colaborador** → `/app/pdi` → comentar PDI

Detalhe do roteiro foi passado no chat da sessão; se algo falhar, anotar: bloco, papel, URL e mensagem de erro.

---

## O que falta (amanhã / próximos)

### Fase 4 — Dashboards + residual do Excel (próximo foco)
- Aprofundar **Dashboards gerenciais** e **Visão estratégica** (paridade com mobile: radar, rankings, export se houver)
- **Impacto caixa** com métricas do Excel (folha, R$, %)
- Relatório gerencial CEO (Excel `2.5`) — KPIs, faixas, status por gestor
- Telas extras do Excel ainda sem layout fechado pelo Paulo (`2.18`, `3.20`–`3.21`, etc.) — só depois que o cliente confirmar wireframe
- **Cadastro de Cargos/Funções + CBO** (Excel `1.10`) — feature nova (não existe no mobile ainda)

### Gaps conhecidos (não fechados hoje)
- Cadastro cliente: create sem contatos base/bordo (mobile também não cria esses campos)
- Avaliadores: create continua só via “Gerar acesso” no Admin (igual mobile)
- OfflineQueue: **não portar** para web
- Menus por papel: revisar alinhamento fino ao Excel (Admin/CEO/RH ainda “não concluídos” no MENU do Paulo)
- Alguns deep links PDI/equipe podem não estar no menu de todos os papéis — acessar via URL `/app/pdi-equipe` se necessário

### Fase 5 — QA por perfil (quando Fase 4 estabilizar)
Login e checklist por papel cruzando Excel + mobile:
`colaborador → supervisor → gestor → gerente → rh → ceo → admin`

---

## Decisões / regras de produto
- Fonte de verdade de telas: Excel do Paulo + comportamento do mobile
- Web = paridade mobile + alinhamento Excel
- Onde Excel pede algo que mobile não tem → feature nova (preferência web/PWA primeiro se o Paulo priorizar web)

---

## Status

| Fase | Status |
|------|--------|
| 0 Rotas base (parcial) | Feito no fluxo de avaliação/PDI |
| 1 Admin RH | Feito |
| 2 Avaliação | Feito |
| 3 Reajuste / Cliente / PDI | Feito |
| 4 Dashboards + Excel residual | **Feito em 29/07/2026** |
| 5 QA por perfil | Pendente |

### Fase 4 entregue (29/07)
- Dashboards gerenciais: IMA gauge, radar offshore/legado, rankings Top/Bottom/Completo, PDI, export PDF, faixas CEO, status por gestor
- Visão estratégica: radar + gauge + nine-box matriz + turnover + sucessão
- Impacto caixa: folha, R$, % da folha, % médio, status gestores
- Cadastro Cargos/Funções + CBO (migration + web/mobile)
- Menus RH/CEO/Admin alinhados + links PDI no AppShell / Minha Equipe / Dashboard colaborador

*Atualizado em 29/07/2026.*
