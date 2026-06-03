import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { ColaboradorFichaData } from '@/features/gerencial/dashboard-api';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFichaHtml(ficha: ColaboradorFichaData) {
  const { profile, mediaGeral, totalRespostas, feedbacks, avaliacoes } = ficha;

  const feedbackItems =
    feedbacks.length > 0
      ? feedbacks.map((texto) => `<li>${escapeHtml(texto)}</li>`).join('')
      : '<li>Nenhum feedback registrado.</li>';

  const avaliacaoItems =
    avaliacoes.length > 0
      ? avaliacoes
          .map(
            (avaliacao) =>
              `<li>${escapeHtml(avaliacao.tipo)} — ${new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}</li>`,
          )
          .join('')
      : '<li>Nenhuma avaliação registrada.</li>';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 24mm; }
          body {
            font-family: Inter, Arial, sans-serif;
            color: #2F3437;
            font-size: 12px;
            line-height: 1.5;
          }
          h1 { font-size: 22px; margin-bottom: 4px; }
          h2 {
            font-size: 14px;
            margin-top: 24px;
            margin-bottom: 8px;
            border-bottom: 1px solid #EAEAEA;
            padding-bottom: 4px;
          }
          .meta { color: #787774; margin-bottom: 16px; }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 24px;
            margin-top: 12px;
          }
          .label { color: #787774; font-size: 11px; text-transform: uppercase; }
          .value { font-size: 13px; font-weight: 600; }
          .highlight {
            background: #F7F6F3;
            border: 1px solid #EAEAEA;
            border-radius: 4px;
            padding: 12px;
            margin-top: 12px;
          }
          ul { padding-left: 18px; margin: 8px 0 0; }
        </style>
      </head>
      <body>
        <h1>Ficha do colaborador</h1>
        <p class="meta">Gerado em ${new Date().toLocaleString('pt-BR')}</p>

        <div class="highlight">
          <div class="label">Colaborador</div>
          <div class="value" style="font-size:18px;">${escapeHtml(profile.nome)}</div>
        </div>

        <h2>Dados cadastrais</h2>
        <div class="grid">
          <div><div class="label">Departamento</div><div class="value">${escapeHtml(profile.departamento ?? '—')}</div></div>
          <div><div class="label">Função</div><div class="value">${escapeHtml(profile.funcao ?? '—')}</div></div>
          <div><div class="label">Data de admissão</div><div class="value">${escapeHtml(profile.data_admissao ?? '—')}</div></div>
          <div><div class="label">Status</div><div class="value">${escapeHtml(profile.status ?? '—')}</div></div>
          <div><div class="label">Classificação</div><div class="value">${escapeHtml(profile.classificacao ?? '—')}</div></div>
          <div><div class="label">Nível IRATA</div><div class="value">${escapeHtml(profile.nivel_irata ?? '—')}</div></div>
        </div>

        <h2>Desempenho</h2>
        <div class="grid">
          <div><div class="label">Média geral</div><div class="value">${mediaGeral !== null ? mediaGeral.toFixed(1) : '—'}</div></div>
          <div><div class="label">Total de respostas</div><div class="value">${totalRespostas}</div></div>
        </div>

        <h2>Histórico de avaliações</h2>
        <ul>${avaliacaoItems}</ul>

        <h2>Feedbacks recebidos</h2>
        <ul>${feedbackItems}</ul>
      </body>
    </html>
  `;
}

export async function exportColaboradorFichaPdf(ficha: ColaboradorFichaData) {
  const html = buildFichaHtml(ficha);
  const { uri } = await Print.printToFileAsync({ html });

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Ficha — ${ficha.profile.nome}`,
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  return uri;
}
