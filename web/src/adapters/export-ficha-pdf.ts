import type { ColaboradorFichaData } from '../../../src/features/gerencial/ficha-colaborador-api';
import {
  buildFichaHtml,
  buildLoteHtml,
} from '../../../src/features/gerencial/export-ficha-pdf';

function openPrintWindow(html: string, title: string) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');

  if (!printWindow) {
    throw new Error('Pop-up bloqueado. Permita janelas pop-up para exportar a ficha.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.document.title = title;

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === 'complete') {
    setTimeout(triggerPrint, 250);
  } else {
    printWindow.addEventListener('load', () => setTimeout(triggerPrint, 250), { once: true });
  }
}

export async function exportColaboradorFichaPdf(ficha: ColaboradorFichaData) {
  openPrintWindow(buildFichaHtml(ficha), `Ficha — ${ficha.profile.nome}`);
}

export async function exportFichasLotePdf(params: {
  fichas: ColaboradorFichaData[];
  titulo: string;
  departamento?: string;
}) {
  if (params.fichas.length === 0) {
    throw new Error('Nenhuma ficha para exportar.');
  }

  const label = params.departamento
    ? `Fichas — ${params.departamento}`
    : `Fichas — ${params.titulo}`;

  openPrintWindow(buildLoteHtml(params.fichas, params.titulo, params.departamento), label);
}

export { buildFichaHtml, buildLoteHtml };
