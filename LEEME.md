# Web de SDV Servicios Inmobiliarios

Corredora inmobiliaria Soledad Degiorgi Valestra · Cjón. Fernandez 672, San Martín, Mendoza · WhatsApp 2634 221899.

Es una web estática (un solo `index.html` + `config.js`). No hay que compilar nada.

## 1. Publicar en Vercel
1. En Vercel: **Add New > Project** e importá el repositorio de GitHub.
2. En **Root Directory** elegí `sdv-inmobiliaria`. Framework: **Other**. No hace falta Build Command.
3. **Deploy**. Después se puede conectar el dominio propio en *Settings > Domains*.

Cada vez que se haga un cambio en la rama conectada, Vercel vuelve a publicar solo.

## 2. Conectar la base de datos (necesario para que los clientes vean las propiedades)
Sin este paso la web está en **modo demostración**: lo que cargues se guarda solo en tu navegador y nadie más lo ve.

1. Creá una cuenta y un proyecto gratis en https://supabase.com.
2. **SQL Editor > New query**: pegá el contenido de `supabase.sql` y ejecutalo (crea la tabla, la seguridad y el bucket de fotos).
3. **Authentication > Users > Add user**: creá tu usuario con email y contraseña (marcá *Auto Confirm User*). Esa es tu clave de acceso privada.
4. **Project Settings > API**: copiá *Project URL* y la clave *anon public*.
5. Abrí `config.js` y completá `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `ADMIN_EMAIL` (tu email). Guardá y publicá el cambio.

La clave *anon* es pública por diseño. La seguridad la dan las políticas del SQL: solo tu usuario puede crear, editar o borrar.

## 3. Cómo cargar propiedades
1. En el pie de la web tocá el **candado** (o presioná Alt+Shift+A) e ingresá tu contraseña.
2. Aparece la barra "Modo edición". Tocá **Nueva propiedad**.
3. Completá el formulario. Obligatorios: título y precio. Subí fotos desde el celular o la computadora, o pegá la URL de una imagen. La primera foto es la principal y se puede cambiar con "Hacer principal".
4. **Guardar propiedad**. Se publica al instante.

Con la sesión iniciada, cada tarjeta muestra:
- **Editar**: abre el formulario con los datos actuales.
- **Cambiar estado**: Disponible, Reservado (muestra la etiqueta "Reservada") o Pausado (se oculta al público, solo la ves vos).
- **Eliminar**: pide una segunda confirmación.

Para salir, **Cerrar sesión** en la barra de edición.

## Datos de contacto
Se cambian en `config.js` (`WA_NUMBER`, `PHONE_LABEL`, `ADDRESS`). El número de WhatsApp va sin `+` ni espacios: `54` + `9` + código de área + número.

## Dominio propio
1. Comprá el dominio (por ejemplo `sdvinmobiliaria.com`, en Namecheap, GoDaddy o Cloudflare). Para `.com.ar` se gestiona en nic.ar.
2. En Vercel: **Settings > Domains > Add**, escribí el dominio y seguí las indicaciones. Vercel muestra los registros DNS exactos que hay que cargar en el sitio donde lo compraste (un registro A y un CNAME para `www`).
3. Pasados unos minutos (a veces hasta unas horas) el dominio queda activo y Vercel agrega el certificado HTTPS solo.

## Antes de entregar
- Cambiar `ADMIN_PIN` es innecesario con Supabase conectado: el candado pide email y contraseña reales.
- Probar desde el celular: filtros, WhatsApp, cargar una propiedad con fotos, editarla, pausarla y borrarla.
