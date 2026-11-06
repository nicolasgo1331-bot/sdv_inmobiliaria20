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

## Descripciones con IA
Al cargar o editar una propiedad, el botón **Redactar con IA** escribe la descripción con los datos del formulario (y las notas que hayas puesto en el cuadro). Siempre se puede editar el resultado.

Para activarlo:
1. Creá una cuenta en https://console.anthropic.com, cargá un crédito chico (USD 5 alcanzan para cientos de descripciones) y en **API Keys** creá una clave.
2. En Vercel: tu proyecto > **Settings > Environment Variables**. Nombre: `ANTHROPIC_API_KEY`. Valor: la clave. Marcá Production, Preview y Development, y guardá.
3. En **Deployments**, en el último deploy tocá **⋯ > Redeploy**.

Sin ese paso el botón igual funciona con un redactor básico, sin IA. Solo la cuenta de administrador puede usarlo.

## Seguridad (hacer una vez)
1. Volvé a ejecutar `supabase.sql` completo en el SQL Editor de Supabase. Ahora solo `admin@sdvinmobiliaria.com` puede crear, editar o borrar.
2. En Supabase: **Authentication > Sign In / Providers > Email** y desactivá **Allow new users to sign up**. Así nadie más puede crearse una cuenta.

## App en el celular
- **iPhone (Safari):** abrir la web, tocar Compartir y **Agregar a inicio**.
- **Android (Chrome):** menú ⋮ > **Instalar app**, o el botón **Instalar la app** que aparece en el menú y en el pie.

Queda con el logo de SDV, se abre a pantalla completa y sin zoom.
