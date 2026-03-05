create extension if not exists citext;

create table if not exists public.waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  full_name text,
  city text,
  preferred_language text,
  biggest_healthcare_headache text,
  source text not null default 'landing_page_waitlist',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists waitlist_leads_created_at_idx
on public.waitlist_leads(created_at desc);

drop trigger if exists waitlist_leads_updated_at on public.waitlist_leads;
create trigger waitlist_leads_updated_at
before update on public.waitlist_leads
for each row execute function public.set_updated_at();

alter table public.waitlist_leads enable row level security;
