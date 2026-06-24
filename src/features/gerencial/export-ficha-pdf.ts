import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { STATUS_SOLICITACAO_LABELS } from '@/features/colaborador/solicitacoes-api';
import type { ColaboradorFichaData } from '@/features/gerencial/ficha-colaborador-api';
import { getSemaforoItem, SEMAFORO_ITENS } from '@/features/gerencial/semaforo';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateBr(isoDate: string | null | undefined): string {
  if (!isoDate?.trim()) {
    return '—';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString('pt-BR');
}

function formatTelefone(ddd: string | null, telefone: string | null): string {
  if (!ddd?.trim() && !telefone?.trim()) {
    return '—';
  }

  return `(${ddd ?? ''}) ${telefone ?? ''}`.trim();
}

function buildSemaforoHtml(ficha: ColaboradorFichaData): string {
  const ativo = getSemaforoItem(ficha.semaforoStatus);

  const lights = SEMAFORO_ITENS.map((item) => {
    const isActive = item.status === ficha.semaforoStatus;
    return `
      <div class="semaforo-item">
        <div class="semaforo-light" style="background:${item.color};opacity:${isActive ? 1 : 0.25};border:${isActive ? '2px solid #012D60' : '2px solid transparent'}"></div>
        <div class="semaforo-label">${escapeHtml(item.label)}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="semaforo-wrap">
      <div class="semaforo-row">${lights}</div>
      <div class="semaforo-summary">
        <div class="label">Status do colaborador</div>
        <div class="value">${escapeHtml(ativo.label)} — ${escapeHtml(ativo.description)}</div>
        <div class="meta">Média geral: ${ficha.mediaGeral !== null ? ficha.mediaGeral.toFixed(1) : '—'} · ${ficha.totalRespostas} resposta(s)</div>
      </div>
    </div>
  `;
}

function buildRadarHtml(radar: ColaboradorFichaData['radar']): string {
  const maxValor = 3;

  const bars = radar.labels.map((label, index) => {
    const valor = radar.valores[index] ?? 0;
    const width = Math.max(4, Math.round((valor / maxValor) * 100));

    return `
      <div class="radar-row">
        <div class="radar-label">${escapeHtml(label)}</div>
        <div class="radar-track"><div class="radar-fill" style="width:${width}%"></div></div>
        <div class="radar-value">${valor.toFixed(1)}</div>
      </div>
    `;
  }).join('');

  return `<div class="radar-wrap">${bars}</div>`;
}

function hasRadarData(radar: ColaboradorFichaData['radar']): boolean {
  return radar.valores.some((valor) => valor > 0);
}

function buildAvaliacoesHtml(ficha: ColaboradorFichaData): string {
  if (ficha.avaliacoes.length === 0) {
    return '<p class="empty">Nenhuma avaliação aprovada no período.</p>';
  }

  return ficha.avaliacoes
    .map((avaliacao) => {
      const respostas = avaliacao.respostas
        .map((resposta) => {
          const justificativa = resposta.justificativa
            ? `<div class="justificativa">${escapeHtml(resposta.justificativa)}</div>`
            : '';

          return `
            <tr>
              <td>${escapeHtml(resposta.codigo)}</td>
              <td>${escapeHtml(resposta.label)}</td>
              <td class="center">${resposta.nota !== null ? resposta.nota : '—'}</td>
              <td>${justificativa}</td>
            </tr>
          `;
        })
        .join('');

      return `
        <div class="avaliacao-block">
          <div class="avaliacao-header">
            <strong>${escapeHtml(avaliacao.tipoLabel)}</strong>
            <span>${formatDateBr(avaliacao.createdAt)}</span>
          </div>
          <div class="avaliacao-meta">
            Avaliador: ${escapeHtml(avaliacao.avaliadorNome ?? '—')}
            · Média da avaliação: ${avaliacao.media !== null ? avaliacao.media.toFixed(1) : '—'}
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Eixo</th>
                <th>Nota</th>
                <th>Justificativa</th>
              </tr>
            </thead>
            <tbody>${respostas}</tbody>
          </table>
        </div>
      `;
    })
    .join('');
}

function buildMelhoriasHtml(ficha: ColaboradorFichaData): string {
  if (ficha.melhoriasSalariais.length === 0) {
    return '<p class="empty">Nenhuma solicitação salarial registrada.</p>';
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Status</th>
          <th>Data</th>
          <th>Resumo</th>
        </tr>
      </thead>
      <tbody>
        ${ficha.melhoriasSalariais
          .map(
            (melhoria) => `
              <tr>
                <td>${escapeHtml(melhoria.tipoLabel)}</td>
                <td>${escapeHtml(STATUS_SOLICITACAO_LABELS[melhoria.status])}</td>
                <td>${formatDateBr(melhoria.createdAt)}</td>
                <td>${escapeHtml(melhoria.justificativa.slice(0, 300))}${melhoria.justificativa.length > 300 ? '...' : ''}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function buildDecisoesHtml(ficha: ColaboradorFichaData): string {
  if (ficha.decisoesAnuais.length === 0) {
    return '<p class="empty">Nenhuma decisão anual estratégica registrada.</p>';
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Ano</th>
          <th>Benefício</th>
          <th>Médias (Q/S)</th>
          <th>Justificativa financeira</th>
        </tr>
      </thead>
      <tbody>
        ${ficha.decisoesAnuais
          .map(
            (decisao) => `
              <tr>
                <td>${decisao.anoReferencia}</td>
                <td>${escapeHtml(decisao.tipoBeneficioLabel)}</td>
                <td>${decisao.mediaQuinzenalAno !== null ? decisao.mediaQuinzenalAno.toFixed(1) : '—'} / ${decisao.mediaSemestralAno !== null ? decisao.mediaSemestralAno.toFixed(1) : '—'}</td>
                <td>${escapeHtml(decisao.justificativaFinanceira)}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

const PDF_STYLES = `
  @page { size: A4; margin: 18mm; }
  body { font-family: Biko, Arial, sans-serif; color: #1A2332; font-size: 11px; line-height: 1.45; }
  .doc-header { border-bottom: 3px solid #012D60; padding-bottom: 12px; margin-bottom: 16px; }
  .doc-title { font-size: 18px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #012D60; }
  .doc-subtitle { font-size: 12px; color: #5C6570; margin-top: 4px; }
  .doc-meta { font-size: 10px; color: #5C6570; margin-top: 8px; }
  h2 { font-size: 13px; margin: 20px 0 8px; border-bottom: 1px solid rgba(1,45,96,0.1); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; color: #012D60; }
  .highlight { background: #F0EDE4; border: 1px solid rgba(1,45,96,0.1); border-radius: 4px; padding: 12px; margin: 12px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; margin-top: 8px; }
  .label { color: #5C6570; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
  .value { font-size: 12px; font-weight: 600; margin-top: 2px; }
  .meta { color: #5C6570; font-size: 10px; }
  .empty { color: #5C6570; font-style: italic; }
  .semaforo-wrap { margin-top: 8px; }
  .semaforo-row { display: flex; gap: 8px; justify-content: space-between; }
  .semaforo-item { flex: 1; text-align: center; }
  .semaforo-light { width: 24px; height: 24px; border-radius: 4px; margin: 0 auto 4px; }
  .semaforo-label { font-size: 9px; color: #5C6570; }
  .semaforo-summary { margin-top: 10px; padding: 10px; border: 1px solid rgba(1,45,96,0.1); border-radius: 4px; background: #FFFFFF; }
  .radar-wrap { margin-top: 8px; display: grid; gap: 8px; }
  .radar-row { display: grid; grid-template-columns: 130px 1fr 36px; gap: 8px; align-items: center; }
  .radar-label { font-size: 10px; }
  .radar-track { height: 10px; background: #EFEFEF; border-radius: 999px; overflow: hidden; }
  .radar-fill { height: 100%; background: #012D60; border-radius: 999px; }
  .radar-value { font-size: 10px; font-weight: 600; text-align: right; }
  .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
  .data-table th, .data-table td { border: 1px solid rgba(1,45,96,0.1); padding: 6px 8px; vertical-align: top; text-align: left; }
  .data-table th { background: #F0EDE4; font-size: 9px; text-transform: uppercase; }
  .center { text-align: center; }
  .avaliacao-block { margin-bottom: 14px; page-break-inside: avoid; }
  .avaliacao-header { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; }
  .avaliacao-meta { color: #787774; font-size: 10px; margin: 4px 0 6px; }
  .justificativa { color: #555; font-size: 9px; margin-top: 2px; }
  .page-break { page-break-before: always; }
  .lote-cover { margin-bottom: 24px; }
`;

function buildFichaBody(ficha: ColaboradorFichaData, options?: { showPageBreak?: boolean }): string {
  const { profile } = ficha;

  return `
    ${options?.showPageBreak ? '<div class="page-break"></div>' : ''}
    <div class="doc-header">
      <div class="doc-title">Painel de Avaliação de Performance — Offshore</div>
      <div class="doc-subtitle">Metodologia offshore · Escala 0 a 3 · IMA ponderado</div>
      <div class="doc-meta">Período: ${escapeHtml(ficha.periodoLabel)} · Gerado em ${new Date().toLocaleString('pt-BR')}</div>
    </div>

    <div class="highlight">
      <div class="label">Colaborador</div>
      <div class="value" style="font-size:16px;">${escapeHtml(profile.nome)}</div>
      <div class="meta">${escapeHtml([profile.funcao, profile.departamento].filter(Boolean).join(' · ') || 'Sem função/departamento')}</div>
    </div>

    <h2>Dados cadastrais</h2>
    <div class="grid">
      <div><div class="label">Departamento</div><div class="value">${escapeHtml(profile.departamento ?? '—')}</div></div>
      <div><div class="label">Função / cargo</div><div class="value">${escapeHtml(profile.funcao ?? '—')}</div></div>
      <div><div class="label">Líder direto</div><div class="value">${escapeHtml(profile.liderNome ?? '—')}</div></div>
      <div><div class="label">Status</div><div class="value">${escapeHtml(profile.status ?? '—')}</div></div>
      <div><div class="label">Data de admissão</div><div class="value">${formatDateBr(profile.dataAdmissao)}</div></div>
      <div><div class="label">Tempo de empresa</div><div class="value">${escapeHtml(profile.tempoEmpresaLabel ?? '—')}</div></div>
      <div><div class="label">Data de nascimento</div><div class="value">${formatDateBr(profile.dataNascimento)}</div></div>
      <div><div class="label">Telefone</div><div class="value">${escapeHtml(formatTelefone(profile.ddd, profile.telefone))}</div></div>
      <div><div class="label">Classificação</div><div class="value">${escapeHtml(profile.classificacao ?? '—')}</div></div>
      <div><div class="label">Nível IRATA</div><div class="value">${escapeHtml(profile.nivelIrata ?? '—')}</div></div>
      <div><div class="label">Expertise</div><div class="value">${escapeHtml(profile.expertise ?? '—')}</div></div>
      <div><div class="label">Código interno</div><div class="value">${escapeHtml(profile.codigoInterno ?? '—')}</div></div>
      <div><div class="label">Plataforma</div><div class="value">${escapeHtml(profile.plataforma ?? '—')}</div></div>
      <div><div class="label">Formação acadêmica</div><div class="value">${escapeHtml(profile.formacaoAcademica ?? '—')}</div></div>
      <div><div class="label">Certificações</div><div class="value">${escapeHtml(profile.certificacoes ?? '—')}</div></div>
      <div><div class="label">Formação técnica</div><div class="value">${escapeHtml(profile.formacaoTecnica ?? '—')}</div></div>
      <div><div class="label">Certificação EDN</div><div class="value">${profile.certificacaoEdn ? 'Sim' : 'Não'}</div></div>
    </div>

    <h2>Desempenho consolidado</h2>
    ${buildSemaforoHtml(ficha)}

    ${hasRadarData(ficha.radarOffshore)
      ? `<h2>Radar — 12 eixos offshore</h2>${buildRadarHtml(ficha.radarOffshore)}`
      : ''}
    ${hasRadarData(ficha.radar)
      ? `<h2>Radar — 3 eixos universais</h2>${buildRadarHtml(ficha.radar)}`
      : '<p class="empty">Sem dados de radar no período.</p>'}

    <h2>Histórico de avaliações aprovadas</h2>
    ${buildAvaliacoesHtml(ficha)}

    <h2>Solicitações salariais</h2>
    ${buildMelhoriasHtml(ficha)}

    <h2>Decisões anuais estratégicas</h2>
    ${buildDecisoesHtml(ficha)}
  `;
}

function buildFichaHtml(ficha: ColaboradorFichaData): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head><meta charset="utf-8" /><style>${PDF_STYLES}</style></head>
      <body>${buildFichaBody(ficha)}</body>
    </html>
  `;
}

function buildLoteHtml(fichas: ColaboradorFichaData[], titulo: string, departamento?: string): string {
  const cover = `
    <div class="lote-cover doc-header">
      <div class="doc-title">Relatório de fichas — Offshore</div>
      <div class="doc-subtitle">${escapeHtml(titulo)}</div>
      <div class="doc-meta">
        ${departamento ? `Departamento: ${escapeHtml(departamento)} · ` : ''}
        ${fichas.length} colaborador(es) · Gerado em ${new Date().toLocaleString('pt-BR')}
      </div>
    </div>
  `;

  const bodies = fichas
    .map((ficha, index) => buildFichaBody(ficha, { showPageBreak: index > 0 }))
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head><meta charset="utf-8" /><style>${PDF_STYLES}</style></head>
      <body>${cover}${bodies}</body>
    </html>
  `;
}

async function sharePdf(uri: string, dialogTitle: string) {
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle,
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  return uri;
}

export async function exportColaboradorFichaPdf(ficha: ColaboradorFichaData) {
  const html = buildFichaHtml(ficha);
  const { uri } = await Print.printToFileAsync({ html });
  await sharePdf(uri, `Ficha — ${ficha.profile.nome}`);
  return uri;
}

export async function exportFichasLotePdf(params: {
  fichas: ColaboradorFichaData[];
  titulo: string;
  departamento?: string;
}) {
  if (params.fichas.length === 0) {
    throw new Error('Nenhuma ficha para exportar.');
  }

  const html = buildLoteHtml(params.fichas, params.titulo, params.departamento);
  const { uri } = await Print.printToFileAsync({ html });
  const label = params.departamento
    ? `Fichas — ${params.departamento}`
    : `Fichas — ${params.titulo}`;
  await sharePdf(uri, label);
  return uri;
}
