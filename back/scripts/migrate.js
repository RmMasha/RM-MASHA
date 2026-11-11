const fs = require('fs');
const path = require('path');

// Cargar variables de entorno si existe .env local
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) {
      process.env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'xvwcmcrfgrclhebbcrze';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: La variable de entorno SUPABASE_ACCESS_TOKEN es requerida.');
  process.exit(1);
}

async function executeSql(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en API Supabase (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function runMigrations() {
  console.log('===============================================================');
  console.log('  Ejecución de Migraciones de Base de Datos - RM & Masha');
  console.log(`  Proyecto: ${PROJECT_REF}`);
  console.log('===============================================================\n');

  // Asegurar tabla de control de versiones
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public._schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);

  // Obtener migraciones ya aplicadas
  const appliedResult = await executeSql('SELECT version FROM public._schema_migrations;');
  const appliedSet = new Set(appliedResult.map(r => r.version));

  // Migraciones iniciales que ya crearon tablas y funciones previas
  if (!appliedSet.has('20261111120000_create_enums_and_tables.sql')) {
    await executeSql(`INSERT INTO public._schema_migrations (version) VALUES 
      ('20261111120000_create_enums_and_tables.sql'),
      ('20261111120100_create_functions_and_rpc.sql'),
      ('20261111120200_create_rls_policies.sql'),
      ('20261111120300_create_storage_buckets.sql')
      ON CONFLICT DO NOTHING;`);
    appliedSet.add('20261111120000_create_enums_and_tables.sql');
    appliedSet.add('20261111120100_create_functions_and_rpc.sql');
    appliedSet.add('20261111120200_create_rls_policies.sql');
    appliedSet.add('20261111120300_create_storage_buckets.sql');
  }

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`- ${file} (ya aplicada previamente)`);
      continue;
    }

    console.log(`> Aplicando nueva migración: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const start = Date.now();
    try {
      await executeSql(sql);
      await executeSql(`INSERT INTO public._schema_migrations (version) VALUES ('${file}');`);
      const duration = Date.now() - start;
      console.log(`  ✓ ${file} completada con éxito en ${duration}ms.\n`);
    } catch (error) {
      console.error(`\n✖ Fallo al ejecutar migración ${file}:`);
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log('===============================================================');
  console.log('  ✓ TODAS LAS MIGRACIONES FUERON APLICADAS CON ÉXITO');
  console.log('===============================================================\n');
}

runMigrations();
