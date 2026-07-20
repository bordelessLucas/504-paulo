# DNA Performance — Checklist E2E por papel (Excel Rev Jul 20 2026)

Use este checklist após aplicar a migration `20260720160000_dna_performance_excel.sql`.

## Pré-requisitos
- [ ] Migration aplicada no Supabase
- [ ] Seed de perguntas GO1–IN3 ativo
- [ ] Usuários de teste para os 7 papéis

## Colaborador
- [ ] Menu: DNA-TEK (Regras, Metodologia) + Autoavaliação + Status
- [ ] Dashboard com solicitação tipada (curso / mérito / qualificação) + checklist
- [ ] Status das solicitações lista deferido / indeferido / em análise

## Supervisor de Bordo
- [ ] Avaliação em lote (3 notas SB) com filtros cliente/unidade/período
- [ ] Relatório individual + históricos quinzenal/semestral/desligados
- [ ] Status das solicitações

## Gestores de Base / Gerente
- [ ] Avaliação semestral por seção do departamento
- [ ] Reajuste + histórico de reajuste
- [ ] Análise anual (ativos / desligados / perfil)

## RH / Admin
- [ ] Cadastro colaborador, cliente, avaliadores
- [ ] Registro de incidente enriquecido (bloqueia elegibilidade 6 meses)
- [ ] Ranking, análise de perfil, aprovações

## CEO
- [ ] Análise dos avaliadores (preenchimento)
- [ ] Histórico de reajuste + impacto no caixa (valores estimados)
- [ ] Notificação `ima_critico` quando média &lt; 1,0

## Governança
- [ ] Nota 0/1 exige justificativa; nota 3 exige evidência
- [ ] IMA &lt; 1,8 abre PDI automático
- [ ] IMA &lt; 1,0 notifica diretoria
