# Checklist — Sessão 29/07/2026 (Fase 4 + Relatório Gerencial 2.5)

Checklist do que foi implementado e validável com prints. Ambiente: `cd web && npm run dev`.

---

## Entregas do dia

### A. Relatório Gerencial CEO (Excel 2.5) — `/app/gerencial`
- [x] Resumo executivo (total, concluídas/com IMA, pendentes/sem IMA, % )
- [x] Análise geral da equipe — 5 faixas escala **0–3** (≥2,7 / 2,1–2,6 / 1,5–2,0 / 1,0–1,4 / &lt;1,0)
- [x] Status de avaliações por gestor (tabela + status/ação)
- [x] Top / Bottom exclusivos por IMA (sem overlap; títulos dinâmicos)
- [x] Gauge IMA + Radar offshore/legado
- [x] Saúde PDI + export PDF (impressão do browser)
- [x] Correção UI: badges das faixas, KPIs zerados, badge “Cinza”

### B. Visão estratégica — `/app/estrategico`
- [x] Radar offshore + gauge IMA
- [x] Top / Bottom side-by-side
- [x] Nine-box (matriz 3×3)
- [x] Riscos de turnover + plano de sucessão
- [x] IMA por departamento

### C. Impacto no caixa — `/app/impacto-caixa`
- [x] Folha salarial (R$)
- [x] Impacto aprovado (R$)
- [x] % da folha e % médio de reajuste
- [x] Buckets mensal / anual
- [x] Status por gestor (quando houver ciclo)

### D. Cargos / Funções + CBO (Excel 1.10)
- [x] Migration `supabase/migrations/20260729160000_cargos_cbo.sql`
- [x] API `cargos-api` + CRUD web `/app/cadastro-cargos`
- [x] Tela mobile `CadastroCargosScreen`
- [x] Menu RH / CEO / Admin

### E. Navegação / PDI
- [x] Links PDI no sidebar (por papel)
- [x] CTA “PDI da equipe” em Minha Equipe
- [x] CTA “Meus PDIs” no Dashboard do colaborador
- [x] Menus RH: Gerencial, Estratégico, Impacto, Cargos, Avaliadores

### F. Infra / suporte
- [x] Charts SVG web (Radar + IMA Gauge)
- [x] Adapter PDF web (print window)
- [x] Handoff atualizado (`docs/handoff-sessao-28-07-2026-paridade-web.md`)

---

## Como comprovar (prints sugeridos)

| # | Papel | URL | Print |
|---|-------|-----|-------|
| 1 | CEO | `/app/gerencial` | Resumo + faixas 0–3 |
| 2 | CEO | `/app/gerencial` | Top/Bottom sem overlap |
| 3 | CEO | `/app/gerencial` | Gauge + Radar |
| 4 | CEO | `/app/estrategico` | Nine-box |
| 5 | CEO | `/app/impacto-caixa` | Folha / R$ / % |
| 6 | RH | `/app/cadastro-cargos` | CRUD cargo + CBO |
| 7 | Gestor | sidebar / Minha Equipe | Link PDI da equipe |

---

## Pendente (fora desta sessão)

- [ ] Aplicar migration `cargos_cbo` + seed `20260730160000_seed_cargos_cbo.sql` no Supabase
- [x] Seed da lista de cargos do Excel 1.10 (arquivo criado; aplicar no remoto)
- [x] Cadastro colaborador: telefone_2, observações, contadores 1.7 (web + mobile + Edge)
- [x] Cliente: contatos base/bordo no create (web + mobile + API)
- [ ] Impacto caixa mensal/anual separados (2.7 / 2.8)
- [ ] Abas sem wireframe: 2.18, 2.22, 3.20, 3.21
- [ ] QA E2E por perfil (Fase 5)

---

*Gerado em 29/07/2026.*
