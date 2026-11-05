-- Ejecutar completo en Supabase > SQL Editor > New query > Run

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

alter table public.properties enable row level security;

-- Cualquiera ve las propiedades que no están pausadas; solo el administrador ve todas.
create policy "lectura publica" on public.properties for select
  using (status <> 'pausado' or auth.role() = 'authenticated');

-- Solo el administrador (usuario con sesión) puede crear, editar y borrar.
create policy "escritura admin" on public.properties for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Bucket público para las fotos
insert into storage.buckets (id, name, public) values ('propiedades', 'propiedades', true)
  on conflict (id) do nothing;

create policy "fotos lectura publica" on storage.objects for select
  using (bucket_id = 'propiedades');
create policy "fotos subida admin" on storage.objects for insert
  with check (bucket_id = 'propiedades' and auth.role() = 'authenticated');
create policy "fotos borrado admin" on storage.objects for delete
  using (bucket_id = 'propiedades' and auth.role() = 'authenticated');
