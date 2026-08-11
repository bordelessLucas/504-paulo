import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function buildCorsHeaders(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin') ?? '';
  const allowOrigin =
    ALLOWED_ORIGINS.length === 0
      ? 'null'
      : ALLOWED_ORIGINS.includes(requestOrigin)
        ? requestOrigin
        : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

type NotifyBody = {
  incidenteId?: string;
  colaboradorId?: string;
  tipoIncidente?: string;
  dataOcorrencia?: string;
  descricao?: string;
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido.' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('INCIDENTE_EMAIL_FROM') ?? 'Vertek Avalia <onboarding@resend.dev>';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY ausentes.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as NotifyBody;
    if (!body.colaboradorId || !body.tipoIncidente) {
      return new Response(JSON.stringify({ error: 'Payload incompleto.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('id, role, organizacao_id')
      .eq('id', user.id)
      .maybeSingle();

    const allowedRoles = new Set(['rh', 'ceo', 'admin', 'gerente', 'gestor', 'supervisor']);
    if (!callerProfile?.role || !allowedRoles.has(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Sem permissão para notificar incidente.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [{ data: colaborador }, { data: destinatarios }] = await Promise.all([
      admin.from('profiles').select('id, nome, email, funcao, departamento, organizacao_id').eq('id', body.colaboradorId).maybeSingle(),
      admin
        .from('profiles')
        .select('email, nome, role, organizacao_id')
        .in('role', ['rh', 'ceo', 'admin'])
        .eq('status', 'ativo'),
    ]);

    if (
      callerProfile.organizacao_id &&
      colaborador?.organizacao_id &&
      callerProfile.organizacao_id !== colaborador.organizacao_id
    ) {
      return new Response(JSON.stringify({ error: 'Colaborador fora da organização.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orgScoped = callerProfile.organizacao_id
      ? (destinatarios ?? []).filter(
          (row) => !row.organizacao_id || row.organizacao_id === callerProfile.organizacao_id,
        )
      : (destinatarios ?? []);

    const emails = orgScoped
      .map((row) => row.email)
      .filter((email): email is string => Boolean(email && email.includes('@')));

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: 'Nenhum destinatário RH/CEO/Admin.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const tipo = escapeHtml(String(body.tipoIncidente).slice(0, 120));
    const descricao = escapeHtml(String(body.descricao ?? '—').slice(0, 4000));
    const dataOcorrencia = escapeHtml(String(body.dataOcorrencia ?? '—').slice(0, 40));
    const colabNome = escapeHtml(String(colaborador?.nome ?? '—'));
    const colabEmail = escapeHtml(String(colaborador?.email ?? '—'));
    const colabFuncao = escapeHtml(String(colaborador?.funcao ?? '—'));
    const colabDepto = escapeHtml(String(colaborador?.departamento ?? '—'));

    const subject = `[Incidente grave] ${tipo} — ${colabNome}`;
    const html = `
      <h2>Incidente grave registrado</h2>
      <p><strong>Colaborador:</strong> ${colabNome} (${colabEmail})</p>
      <p><strong>Função / Depto:</strong> ${colabFuncao} / ${colabDepto}</p>
      <p><strong>Tipo:</strong> ${tipo}</p>
      <p><strong>Data:</strong> ${dataOcorrencia}</p>
      <p><strong>Descrição:</strong> ${descricao}</p>
      <p>Este alerta foi gerado automaticamente pelo Vertek Avalia.</p>
    `;

    if (!resendApiKey) {
      console.log('notify-incidente-grave sem RESEND_API_KEY', {
        subject,
        recipientCount: emails.length,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          simulated: true,
          reason: 'RESEND_API_KEY não configurada. E-mail não enviado.',
          recipientCount: emails.length,
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

    return new Response(
      JSON.stringify({ ok: true, recipientCount: emails.length, resendId: resendJson?.id ?? null }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
