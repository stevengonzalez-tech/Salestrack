-- ============================================================
-- SalesTrack Pro — Seed Data (development only)
-- Run after 001_initial_schema.sql
-- ============================================================

-- Create demo users via auth.users (Supabase admin API recommended for production)
-- These UUIDs are fixed so foreign keys stay consistent

do $$
declare
  admin_id  uuid := 'a0000000-0000-0000-0000-000000000001';
  leader_id uuid := 'a0000000-0000-0000-0000-000000000002';
  agent1_id uuid := 'a0000000-0000-0000-0000-000000000003';
  agent2_id uuid := 'a0000000-0000-0000-0000-000000000004';
  team_id   uuid := 'b0000000-0000-0000-0000-000000000001';
  c1_id     uuid := uuid_generate_v4();
  c2_id     uuid := uuid_generate_v4();
begin

-- Profiles
insert into public.profiles (id, email, full_name, role) values
  (admin_id,  'admin@salestrack.dev',   'Alex Admin',    'admin'),
  (leader_id, 'leader@salestrack.dev',  'Laura Leader',  'leader'),
  (agent1_id, 'agent1@salestrack.dev',  'Carlos Agent',  'agent'),
  (agent2_id, 'agent2@salestrack.dev',  'Diana Agent',   'agent')
on conflict (id) do nothing;

-- Team
insert into public.teams (id, name, leader_id) values
  (team_id, 'Alpha Squad', leader_id)
on conflict (id) do nothing;

update public.profiles set team_id = team_id
  where id in (leader_id, agent1_id, agent2_id);

-- Leads
insert into public.leads (full_name, email, phone, company, status, source, assigned_to, created_by) values
  ('John Smith',     'john@acme.com',     '+1 555-0101', 'Acme Corp',     'qualified',   'LinkedIn',    agent1_id, agent1_id),
  ('Sara Connor',    'sara@techco.io',    '+1 555-0102', 'TechCo',        'contacted',   'Cold call',   agent1_id, agent1_id),
  ('Mike Johnson',   'mike@startup.dev',  null,          'Startup Dev',   'new',         'Website',     agent2_id, agent2_id),
  ('Anna Williams',  'anna@bigfirm.com',  '+1 555-0104', 'Big Firm LLC',  'unqualified', 'Referral',    agent2_id, agent2_id),
  ('Robert Chen',    'rchen@globalco.net','+1 555-0105', 'GlobalCo',      'qualified',   'Trade show',  agent1_id, leader_id);

-- Contacts
insert into public.contacts (id, full_name, email, phone, company, position, assigned_to, created_by) values
  (c1_id, 'John Smith',   'john@acme.com',    '+1 555-0101', 'Acme Corp', 'VP Sales',      agent1_id, agent1_id),
  (c2_id, 'Sara Connor',  'sara@techco.io',   '+1 555-0102', 'TechCo',   'CTO',            agent1_id, agent1_id);

-- Deals
insert into public.deals (title, value, stage, contact_id, assigned_to, expected_close_date, created_by) values
  ('Acme Corp — Enterprise License',   85000, 'proposal',      c1_id, agent1_id, '2026-07-30', agent1_id),
  ('TechCo — SaaS Annual',             42000, 'negotiation',   c2_id, agent1_id, '2026-07-15', agent1_id),
  ('GlobalCo — Starter Pack',          12000, 'qualification', null,  agent2_id, '2026-08-01', agent2_id),
  ('Big Firm — Premium Deal',         120000, 'closed_won',    null,  agent1_id, '2026-06-10', leader_id),
  ('Startup Dev — Pilot',               8500, 'prospecting',   null,  agent2_id, '2026-08-15', agent2_id);

-- Activities
insert into public.activities (type, description, entity_type, entity_id, performed_by) values
  ('call',              'Initial discovery call with John Smith — positive response',   'contact', c1_id, agent1_id),
  ('email',             'Sent proposal PDF to Sara Connor at TechCo',                   'contact', c2_id, agent1_id),
  ('deal_stage_change', 'Big Firm deal moved to Closed Won — $120k revenue',            'deal',    (select id from public.deals where title like 'Big Firm%' limit 1), leader_id),
  ('meeting',           'Product demo scheduled with GlobalCo next week',               'contact', c1_id, agent2_id),
  ('note',              'Acme Corp interested in Q3 expansion — follow up in 2 weeks',  'contact', c1_id, agent1_id);

end $$;
