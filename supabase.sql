-- Ejecutar completo en Supabase > SQL Editor > New query > Run.
-- Se puede volver a ejecutar sin problema: actualiza lo que ya existe.
--
-- IMPORTANTE: si tu email de administrador NO es admin@sdvinmobiliaria.com,
-- cambialo en la función is_admin() de abajo antes de ejecutar.

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text not null,
  operation text not null check (operation in ('venta','alquiler')),
  type text not null,
  currency text not null default 'USD',
  price numeric not null default 0,
  expenses numeric,
  address text,
  neighborhood text,
  city text,
  total_area numeric,
  covered_area numeric,
  age numeric,
  rooms int,
  bedrooms int,
  bathrooms int,
  garages int,
  services jsonb not null default '{}',
  credit_eligible boolean default false,
  pet_friendly boolean default false,
  featured boolean default false,
  status text not null default 'disponible' check (status in ('disponible','reservado','pausado')),
  images text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);

-- Para bases creadas antes de agregar "Ambientes":
alter table public.properties add column if not exists rooms int;

-- Solo esta cuenta puede editar. Cualquier otra cuenta, aunque exista, queda sin permisos.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() ->> 'email') = 'admin@sdvinmobiliaria.com', false)
$$;

alter table public.properties enable row level security;

drop policy if exists "lectura publica" on public.properties;
drop policy if exists "escritura admin" on public.properties;

create policy "lectura publica" on public.properties for select
  using (status <> 'pausado' or public.is_admin());

create policy "escritura admin" on public.properties for all
  using (public.is_admin()) with check (public.is_admin());

-- Bucket público para las fotos
insert into storage.buckets (id, name, public) values ('propiedades', 'propiedades', true)
  on conflict (id) do nothing;

drop policy if exists "fotos lectura publica" on storage.objects;
drop policy if exists "fotos subida admin" on storage.objects;
drop policy if exists "fotos borrado admin" on storage.objects;

create policy "fotos lectura publica" on storage.objects for select
  using (bucket_id = 'propiedades');
create policy "fotos subida admin" on storage.objects for insert
  with check (bucket_id = 'propiedades' and public.is_admin());
create policy "fotos borrado admin" on storage.objects for delete
  using (bucket_id = 'propiedades' and public.is_admin());
