import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_ROLES = new Set([
  'colaborador',
  'supervisor',
  'gestor',
  'gerente',
  'rh',
  'ceo',
  'admin',
]);

const DEFAULT_PASSWORD = '12345678';

type CreateColaboradorBody = {
  email?: string;
  nome?: string;
  funcao?: string;
  departamento?: string;
  data_admissao?: string;
  senha_temporaria?: string;
  role?: string;
  status?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function findUserIdByEmailViaRpc(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const { data, error } = await admin.rpc('get_user_id_by_email', {
    p_email: email,
  });

  if (error) {
    const message = error.message ?? '';
    if (
      message.includes('Could not find the function') ||
      message.includes('does not exist')
    ) {
      return null;
    }
    throw new Error(error.message);
  }

  return data ?? null;
}

/** Fallback quando a RPC ainda não foi criada no banco. */
async function findUserIdByEmailViaListUsers(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(error.message);
    }

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );

    if (match?.id) {
      return match.id;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const viaRpc = await findUserIdByEmailViaRpc(admin, email);
  if (viaRpc) {
    return viaRpc;
  }

  return findUserIdByEmailViaListUsers(admin, email);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'Configuração do servidor incompleta.' }, 500);
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Não autorizado.' }, 401);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse({ error: 'Sessão inválida.' }, 401);
    }

    const { data: callerProfile, error: profileError } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (profileError) {
      return jsonResponse({ error: profileError.message }, 403);
    }

    const callerRole = callerProfile?.role;
    if (!callerRole || !['rh', 'ceo', 'admin'].includes(callerRole)) {
      return jsonResponse({ error: 'Sem permissão para cadastrar colaboradores.' }, 403);
    }

    const body = (await request.json()) as CreateColaboradorBody;
    const email = body.email?.trim().toLowerCase();
    const nome = body.nome?.trim();

    if (!email || !nome) {
      return jsonResponse({ error: 'E-mail e nome são obrigatórios.' }, 400);
    }

    const role = body.role?.trim() && VALID_ROLES.has(body.role.trim())
      ? body.role.trim()
      : 'colaborador';

    const status = body.status?.trim() || 'ativo';
    const password = body.senha_temporaria?.trim() || DEFAULT_PASSWORD;

    if (password.length < 6) {
      return jsonResponse({ error: 'A senha deve ter pelo menos 6 caracteres.' }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    let userId = await findUserIdByEmail(admin, email);
    let authCreated = false;

    if (!userId) {
      const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome },
      });

      if (createError) {
        return jsonResponse({ error: createError.message }, 400);
      }

      userId = createdUser.user?.id ?? null;
      authCreated = true;

      if (!userId) {
        return jsonResponse({ error: 'Não foi possível obter o ID do usuário criado.' }, 500);
      }
    }

    const { error: upsertError } = await admin.from('profiles').upsert(
      {
        id: userId,
        nome,
        funcao: body.funcao?.trim() || null,
        departamento: body.departamento?.trim() || null,
        data_admissao: body.data_admissao?.trim() || null,
        status,
        role,
      },
      { onConflict: 'id' },
    );

    if (upsertError) {
      return jsonResponse({ error: upsertError.message }, 400);
    }

    return jsonResponse({ id: userId, authCreated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.';
    return jsonResponse({ error: message }, 500);
  }
});
