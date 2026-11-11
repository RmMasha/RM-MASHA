const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
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

const email = process.argv[2];
const role = process.argv[3] || 'programador';

if (!email) {
  console.log('Uso: node set-role.js <correo> [rol]');
  console.log('Roles válidos: cliente, cliente_especial, revendedor, revendedor_especial, admin, programador');
  process.exit(1);
}

async function setRole() {
  const sql = `
    UPDATE public.users
    SET rol = '${role}'::user_role
    WHERE email = '${email}';
    
    SELECT id, nombre, email, rol, saldo_actual FROM public.users WHERE email = '${email}';
  `;

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    if (Array.isArray(data) && data.length > 0) {
      console.log('✓ Rol actualizado con éxito:');
      console.log(data);
    } else {
      console.log(`✖ No se encontró ningún usuario registrado con el correo: ${email}`);
      console.log('Regístrate primero en la web (http://localhost:3000/registro) y luego ejecuta este comando.');
    }
  } catch (err) {
    console.error('Error al actualizar rol:', err.message);
  }
}

setRole();

