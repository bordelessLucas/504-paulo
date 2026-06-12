import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const conn = process.env.SUPABASE_CONNECTION_STRING;

if (!conn) {
  console.error('SUPABASE_CONNECTION_STRING ausente');
  process.exit(1);
}

const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();

const triggers = await client.query(`
  SELECT c.relname AS table_name, t.tgname AS trigger_name
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE NOT t.tgisinternal
    AND n.nspname = 'public'
    AND c.relname IN ('avaliacoes', 'melhorias_salariais', 'incidentes', 'decisoes_anuais_estrategicas')
  ORDER BY c.relname, t.tgname
`);

console.log('Triggers:', triggers.rows);

const publication = await client.query(`
  SELECT schemaname, tablename
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
    AND tablename = 'notificacoes'
`);

console.log('Realtime publication:', publication.rows);

await client.end();
