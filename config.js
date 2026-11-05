/* Configuración de la web de SDV Servicios Inmobiliarios.
   Editá solo este archivo. */
window.SDV_CONFIG = {
  AGENT: 'Soledad Degiorgi Valestra',
  WA_NUMBER: '5492634221899',            // 54 (país) + 9 + 2634 (área) + 221899
  PHONE_LABEL: '2634 221899',
  ADDRESS: 'Cjón. Fernandez 672, M5570 San Martín, Mendoza, Argentina',

  /* Base de datos (Supabase). Mientras estén vacíos, la web funciona en MODO DEMOSTRACIÓN:
     lo que se carga se guarda solo en ese navegador y los clientes no lo ven.
     Ver LEEME.md para completarlos. */
  SUPABASE_URL: 'https://ilvnfynqblgecnxopbdx.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_Lhy6Q_jLfKehxuQaGTmfTg_cal6WNpG',
  BUCKET: 'propiedades',
  ADMIN_EMAIL: 'admin@sdvinmobiliaria.com',                       // email del usuario administrador creado en Supabase

  ADMIN_PIN: '1234'                      // solo para el modo demostración
};
