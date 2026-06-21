-- ============================================================
-- SalesTrack Pro — Daily Management Checks
-- ============================================================

create table if not exists public.daily_checks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  check_date  date not null default current_date,
  task_type   text not null,
  quantity    integer not null default 1,
  notes       text,
  created_at  timestamptz not null default now(),

  unique(user_id, check_date, task_type)
);

create index if not exists daily_checks_user_date
  on public.daily_checks(user_id, check_date desc);

alter table public.daily_checks enable row level security;

-- Agents manage their own daily checks
create policy "Users manage own checks"
  on public.daily_checks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Leaders and admins can read all checks
create policy "Leaders read all checks"
  on public.daily_checks for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'leader')
    )
  );
