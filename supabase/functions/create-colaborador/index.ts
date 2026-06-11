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

const CEO_ADMIN_ASSIGNABLE_ROLES = new Set([
  'colaborador',
  'supervisor',
  'gestor',
  'gerente',
  'rh',
  'admin',
]);

const RH_ASSIGNABLE_ROLES = new Set(['colaborador', 'supervisor', 'gestor', 'gerente']);

function canAssignRole(callerRole: string, targetRole: string): boolean {
  if (callerRole === 'ceo' || callerRole === 'admin') {
    return CEO_ADMIN_ASSIGNABLE_ROLES.has(targetRole);
  }

  if (callerRole === 'rh') {
    return RH_ASSIGNABLE_ROLES.has(targetRole);
  }

  return false;
}

const DEFAULT_PASSWORD = '12345678';

const NIVEL_IRATA_VALUES = new Set(['N1', 'N2', 'N3', 'N/A']);
const PROFILE_STATUS_VALUES = new Set(['ativo', 'inativo', 'ferias', 'afastado']);

type CreateColaboradorBody = {
  email?: string;
  nome?: string;
  funcao?: string;
  departamento?: string;
  classificacao?: string;
  nivel_irata?: string;
  data_nascimento?: string;
  data_admissao?: string;
  ddd?: string;
  telefone?: string;
  expertise?: string;
  formacao_tecnica?: string;
  certificacao_edn?: boolean;
  senha_temporaria?: string;
  role?: string;
  status?: string;
};

function normalizeNivelIrata(value?: string): string | null {
  if (!value?.trim()) {
    return null;
  }

  const upper = value.trim().toUpperCase();
  if (upper === 'NA' || upper === 'N-A') {
    return 'N/A';
  }

  return NIVEL_IRATA_VALUES.has(upper) ? upper : null;
}

function normalizeStatus(value?: string): string {
  if (!value?.trim()) {
    return 'ativo';
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return PROFILE_STATUS_VALUES.has(normalized) ? normalized : 'ativo';
}

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

    if (role === 'ceo') {
      return jsonResponse({ error: 'Não é permitido criar acessos com papel CEO.' }, 403);
    }

    if (!canAssignRole(callerRole, role)) {
      return jsonResponse({ error: 'Sem permissão para atribuir este papel.' }, 403);
    }

    const status = normalizeStatus(body.status);
    const nivelIrata = normalizeNivelIrata(body.nivel_irata);
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
        classificacao: body.classificacao?.trim() || null,
        nivel_irata: nivelIrata,
        data_nascimento: body.data_nascimento?.trim() || null,
        data_admissao: body.data_admissao?.trim() || null,
        ddd: body.ddd?.trim() || null,
        telefone: body.telefone?.trim() || null,
        expertise: body.expertise?.trim() || null,
        formacao_tecnica: body.formacao_tecnica?.trim() || null,
        certificacao_edn: body.certificacao_edn ?? false,
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
