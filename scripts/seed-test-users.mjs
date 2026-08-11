/**
 * Cria/atualiza usuários de teste no Supabase Auth + profiles.
 *
 * Uso (raiz do repo):
 *   1. No .env: EXPO_PUBLIC_SUPABASE_URL=...
 *               SUPABASE_SERVICE_ROLE_KEY=...   (Dashboard → Settings → API)
 *   2. node scripts/seed-test-users.mjs
 *
 * Senha padrão: senha123
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filePath) {
  try {
    const text = readFileSync(filePath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional
  }
}

loadEnvFile(resolve(process.cwd(), '.env'));
loadEnvFile(resolve(process.cwd(), '.env.local'));

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PASSWORD = 'senha123';

const USERS = [
  { email: 'admin@teste.com', nome: 'Admin Teste', role: 'admin' },
  { email: 'ceo@teste.com', nome: 'CEO Teste', role: 'ceo' },
  { email: 'rh@teste.com', nome: 'RH Teste', role: 'rh' },
  { email: 'gerente@teste.com', nome: 'Gerente Teste', role: 'gerente' },
  { email: 'gestor@teste.com', nome: 'Gestor Teste', role: 'gestor' },
  { email: 'supervisor@teste.com', nome: 'Supervisor Teste', role: 'supervisor' },
  {
    email: 'colaborador1@teste.com',
    nome: 'Ana Silva',
    role: 'colaborador',
    data_admissao: '2023-06-15',
  },
  {
    email: 'colaborador2@teste.com',
    nome: 'Bruno Costa',
    role: 'colaborador',
    data_admissao: '2024-01-10',
  },
  {
    email: 'colaborador3@teste.com',
    nome: 'Carla Mendes',
    role: 'colaborador',
    data_admissao: '2022-11-20',
  },
];

if (!url || !serviceKey) {
  console.error(
    'Defina EXPO_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env da raiz.',
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`Projeto: ${url}`);
console.log(`Criando/atualizando ${USERS.length} usuários (senha: ${PASSWORD})\n`);

async function findUserIdByEmail(email) {
  // Paginate lightly — projects de teste costumam ter poucos users.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function upsertUser(user) {
  const existingId = await findUserIdByEmail(user.email);
  let userId = existingId;

  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nome: user.nome, role: user.role },
    });
    if (error) throw error;
    console.log(`↻ senha resetada  ${user.email} (${user.role})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nome: user.nome, role: user.role },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`+ criado         ${user.email} (${user.role})`);
  }

  const profile = {
    id: userId,
    nome: user.nome,
    role: user.role,
    status: 'ativo',
    ...(user.data_admissao ? { data_admissao: user.data_admissao } : {}),
  };

  const { error: profileError } = await admin.from('profiles').upsert(profile, {
    onConflict: 'id',
  });
  if (profileError) throw profileError;
}

for (const user of USERS) {
  try {
    await upsertUser(user);
  } catch (err) {
    console.error(`✕ falhou ${user.email}:`, err.message ?? err);
  }
}

console.log('\nPronto. Use a senha senha123 em todos.');
