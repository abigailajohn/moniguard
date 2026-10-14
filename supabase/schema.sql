-- MoniGuard database setup.
-- Paste this whole file into Supabase: SQL Editor -> New query -> Run.
-- Safe to run more than once.

-- 1. Business profile, one row per user ------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  role text,
  business text,
  industry text,
  about text,
  location text,
  business_email text,
  phone text,
  bank text,
  staff text,
  language text not null default 'en',
  settings jsonb not null default '{}'::jsonb,
  read_alerts text[] not null default '{}',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Checks (history), trusted records and reports -------------------------
create table if not exists public.checks (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create table if not exists public.records (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create table if not exists public.reports (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- 3. Row level security: every user can only see and change their own rows --
alter table public.profiles enable row level security;
alter table public.checks enable row level security;
alter table public.records enable row level security;
alter table public.reports enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "own checks" on public.checks;
create policy "own checks" on public.checks for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "own records" on public.records;
create policy "own records" on public.records for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "own reports" on public.reports;
create policy "own reports" on public.reports for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 4. Create the profile row automatically when someone signs up ------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, business, language)
  values (
    new.id,
    left(new.raw_user_meta_data ->> 'name', 80),
    left(new.raw_user_meta_data ->> 'business', 80),
    coalesce(nullif(new.raw_user_meta_data ->> 'language', ''), 'en')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Let a signed-in user delete their own account (and all their data) ----
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end; $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
