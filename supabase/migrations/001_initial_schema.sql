-- ============================================================
-- SalesTrack Pro — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- Enums
-- ──────────────────────────────────────────────────────────────
create type user_role    as enum ('admin', 'leader', 'agent');
create type lead_status  as enum ('new', 'contacted', 'qualified', 'unqualified');
create type deal_stage   as enum ('prospecting','qualification','proposal','negotiation','closed_won','closed_lost');
create type activity_type as enum ('call','email','meeting','note','deal_stage_change');
create type entity_type  as enum ('lead','deal','contact');

-- ──────────────────────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        user_role not null default 'agent',
  avatar_url  text,
  team_id     uuid,
  created_at  timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- Teams
-- ──────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  leader_id   uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_team_id_fk
  foreign key (team_id) references public.teams(id);

-- ──────────────────────────────────────────────────────────────
-- Leads
-- ──────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  email        text not null,
  phone        text,
  company      text,
  status       lead_status not null default 'new',
  source       text,
  notes        text,
  assigned_to  uuid references public.profiles(id),
  created_by   uuid not null references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Contacts
-- ──────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  email        text not null,
  phone        text,
  company      text,
  position     text,
  notes        text,
  assigned_to  uuid not null references public.profiles(id),
  created_by   uuid not null references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Deals
-- ──────────────────────────────────────────────────────────────
create table if not exists public.deals (
  id                   uuid primary key default uuid_generate_v4(),
  title                text not null,
  value                numeric(12,2) not null default 0,
  stage                deal_stage not null default 'prospecting',
  contact_id           uuid references public.contacts(id),
  lead_id              uuid references public.leads(id),
  assigned_to          uuid not null references public.profiles(id),
  expected_close_date  date,
  notes                text,
  created_by           uuid not null references public.profiles(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Activities
-- ──────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id            uuid primary key default uuid_generate_v4(),
  type          activity_type not null,
  description   text not null,
  entity_type   entity_type not null,
  entity_id     uuid not null,
  performed_by  uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- updated_at triggers
-- ──────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at    before update on public.leads    for each row execute procedure public.set_updated_at();
create trigger contacts_updated_at before update on public.contacts for each row execute procedure public.set_updated_at();
create trigger deals_updated_at    before update on public.deals    for each row execute procedure public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.teams     enable row level security;
alter table public.leads     enable row level security;
alter table public.contacts  enable row level security;
alter table public.deals     enable row level security;
alter table public.activities enable row level security;

-- Helper: get current user's role
create or replace function public.current_role()
returns user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── Profiles ──
create policy "profiles: own read"       on public.profiles for select using (id = auth.uid());
create policy "profiles: leader/admin read" on public.profiles for select using (public.current_role() in ('leader','admin'));
create policy "profiles: own update"     on public.profiles for update using (id = auth.uid());

-- ── Teams ──
create policy "teams: authenticated read" on public.teams for select using (auth.role() = 'authenticated');
create policy "teams: admin all"          on public.teams for all    using (public.current_role() = 'admin');

-- ── Leads ──
create policy "leads: agent own"       on public.leads for all    using (assigned_to = auth.uid() or created_by = auth.uid());
create policy "leads: leader/admin all" on public.leads for all   using (public.current_role() in ('leader','admin'));

-- ── Contacts ──
create policy "contacts: agent own"        on public.contacts for all using (assigned_to = auth.uid() or created_by = auth.uid());
create policy "contacts: leader/admin all" on public.contacts for all using (public.current_role() in ('leader','admin'));

-- ── Deals ──
create policy "deals: agent own"        on public.deals for all using (assigned_to = auth.uid() or created_by = auth.uid());
create policy "deals: leader/admin all" on public.deals for all using (public.current_role() in ('leader','admin'));

-- ── Activities ──
create policy "activities: authenticated read" on public.activities for select using (auth.role() = 'authenticated');
create policy "activities: insert own"         on public.activities for insert with check (performed_by = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────
create index leads_assigned_to_idx   on public.leads(assigned_to);
create index leads_status_idx        on public.leads(status);
create index deals_assigned_to_idx   on public.deals(assigned_to);
create index deals_stage_idx         on public.deals(stage);
create index activities_entity_idx   on public.activities(entity_type, entity_id);
create index activities_created_idx  on public.activities(created_at desc);
