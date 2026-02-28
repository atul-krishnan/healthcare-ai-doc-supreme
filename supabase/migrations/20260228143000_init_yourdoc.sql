create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  country text default 'India',
  timezone text default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  daily_summary boolean not null default true,
  consultation_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.triage_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_text text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  recommendation text not null,
  red_flags text[] not null default '{}',
  ai_model text,
  created_at timestamptz not null default now()
);

create index if not exists triage_sessions_user_id_created_at_idx
on public.triage_sessions(user_id, created_at desc);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_threads_user_id_updated_at_idx
on public.chat_threads(user_id, updated_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'doctor', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_id_created_at_idx
on public.chat_messages(thread_id, created_at asc);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null,
  source text not null default 'manual_upload',
  title text not null,
  observed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists health_records_user_id_created_at_idx
on public.health_records(user_id, created_at desc);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  provider text not null default 'stripe',
  status text not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

create trigger chat_threads_updated_at
before update on public.chat_threads
for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.triage_sessions enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.health_records enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_select_own"
on public.profiles
for select using (auth.uid() = id);

create policy "profiles_upsert_own"
on public.profiles
for all using (auth.uid() = id)
with check (auth.uid() = id);

create policy "notification_preferences_select_own"
on public.notification_preferences
for select using (auth.uid() = user_id);

create policy "notification_preferences_write_own"
on public.notification_preferences
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "triage_sessions_read_own"
on public.triage_sessions
for select using (auth.uid() = user_id);

create policy "triage_sessions_insert_own"
on public.triage_sessions
for insert with check (auth.uid() = user_id);

create policy "chat_threads_manage_own"
on public.chat_threads
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "chat_messages_read_own"
on public.chat_messages
for select using (auth.uid() = user_id);

create policy "chat_messages_insert_own"
on public.chat_messages
for insert with check (auth.uid() = user_id);

create policy "health_records_manage_own"
on public.health_records
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "subscriptions_manage_own"
on public.subscriptions
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
