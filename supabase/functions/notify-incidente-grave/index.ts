import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotifyBody = {
  incidenteId?: string;
  colaboradorId?: string;
  tipoIncidente?: string;
  dataOcorrencia?: string;
  descricao?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('INCIDENTE_EMAIL_FROM') ?? 'Vertek Avalia <onboarding@resend.dev>';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes.');
    }

    const body = (await req.json()) as NotifyBody;
    if (!body.colaboradorId || !body.tipoIncidente) {
      return new Response(JSON.stringify({ error: 'Payload incompleto.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const [{ data: colaborador }, { data: destinatarios }] = await Promise.all([
      admin.from('profiles').select('id, nome, email, funcao, departamento').eq('id', body.colaboradorId).maybeSingle(),
      admin
        .from('profiles')
        .select('email, nome, role')
        .in('role', ['rh', 'ceo', 'admin'])
        .eq('status', 'ativo'),
    ]);

    const emails = (destinatarios ?? [])
      .map((row) => row.email)
      .filter((email): email is string => Boolean(email && email.includes('@')));

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: 'Nenhum destinatário RH/CEO/Admin.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const subject = `[Incidente grave] ${body.tipoIncidente} — ${colaborador?.nome ?? body.colaboradorId}`;
    const html = `
      <h2>Incidente grave registrado</h2>
      <p><strong>Colaborador:</strong> ${colaborador?.nome ?? '—'} (${colaborador?.email ?? '—'})</p>
      <p><strong>Função / Depto:</strong> ${colaborador?.funcao ?? '—'} / ${colaborador?.departamento ?? '—'}</p>
      <p><strong>Tipo:</strong> ${body.tipoIncidente}</p>
      <p><strong>Data:</strong> ${body.dataOcorrencia ?? '—'}</p>
      <p><strong>Descrição:</strong> ${body.descricao ?? '—'}</p>
      <p>Este alerta foi gerado automaticamente pelo Vertek Avalia.</p>
    `;

    if (!resendApiKey) {
      console.log('notify-incidente-grave sem RESEND_API_KEY', { subject, emails });
      return new Response(
        JSON.stringify({
          ok: true,
          simulated: true,
          reason: 'RESEND_API_KEY não configurada. E-mail não enviado.',
          recipients: emails,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: emails,
        subject,
        html,
      }),
    });

    const resendJson = await resendRes.json();
    if (!resendRes.ok) {
      throw new Error(
        typeof resendJson?.message === 'string'
          ? resendJson.message
          : 'Falha ao enviar e-mail via Resend.',
      );
    }

    return new Response(JSON.stringify({ ok: true, recipients: emails, resend: resendJson }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
