import { getDataLimiteIncidentes } from '@/features/colaborador/eligibility';
import {
  normalizeDataOcorrencia,
  validateCreateIncidente,
  type CreateIncidenteInput,
} from '@/features/incidentes/validation';
import { supabase } from '@/lib/supabase';
import type { TipoIncidente } from '@/types/supabase';

export async function hasIncidentesRecentes(
  colaboradorId: string,
  referenceDate = new Date(),
): Promise<boolean> {
  const dataLimite = getDataLimiteIncidentes(referenceDate);

  const { data, error } = await supabase
    .from('incidentes')
    .select('id')
    .eq('colaborador_id', colaboradorId)
    .gte('data_ocorrencia', dataLimite)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).length > 0;
}

export async function createIncidente(
  registradoPorId: string,
  input: CreateIncidenteInput,
): Promise<void> {
  const validationError = validateCreateIncidente(input);

  if (validationError) {
    throw new Error(validationError.message);
  }

  const dataOcorrencia = normalizeDataOcorrencia(input.dataOcorrencia);

  if (!dataOcorrencia) {
    throw new Error('Data da ocorrência inválida.');
  }

  const { data, error } = await supabase
    .from('incidentes')
    .insert({
      colaborador_id: input.colaboradorId,
      registrado_por_id: registradoPorId,
      tipo_incidente: input.tipoIncidente,
      data_ocorrencia: dataOcorrencia,
      descricao: input.descricao.trim(),
      horario_aproximado: input.horarioAproximado?.trim() || null,
      reincidencia: input.reincidencia ?? null,
      on_offshore: input.onOffshore?.trim() || null,
      dias_embarcados: input.diasEmbarcados?.trim()
        ? Number(input.diasEmbarcados)
        : null,
      prev_mob: input.prevMob ? normalizeDataOcorrencia(input.prevMob) : null,
      prev_demob: input.prevDemob ? normalizeDataOcorrencia(input.prevDemob) : null,
      plataforma_texto: input.plataformaTexto?.trim() || null,
      relatante_nome: input.relatanteNome?.trim() || null,
      acao_tomada: input.acaoTomada?.trim() || null,
      comentario_cliente: input.comentarioCliente?.trim() || null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (isIncidenteGrave(input.tipoIncidente)) {
    const { error: notifyError } = await supabase.functions.invoke('notify-incidente-grave', {
      body: {
        incidenteId: data.id,
        colaboradorId: input.colaboradorId,
        tipoIncidente: input.tipoIncidente,
        dataOcorrencia,
        descricao: input.descricao.trim(),
      },
    });

    if (notifyError) {
      console.warn('[incidentes] Falha ao notificar incidente grave:', notifyError.message);
    }
  }
}

export function isIncidenteGrave(tipo: TipoIncidente): boolean {
  return tipo === 'acidente_sms' || tipo === 'no_show';
}
