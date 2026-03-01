create extension if not exists pgcrypto;

-- Enum guards
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'care_setting') THEN
    CREATE TYPE public.care_setting AS ENUM ('self_care', 'opd_24_72h', 'urgent_today', 'er_now');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'department_bucket') THEN
    CREATE TYPE public.department_bucket AS ENUM (
      'general_medicine',
      'ent',
      'ortho',
      'derm',
      'gyn',
      'gastro',
      'neuro',
      'cardio',
      'pulmo',
      'pediatrics',
      'other'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'brief_actor_type') THEN
    CREATE TYPE public.brief_actor_type AS ENUM ('user', 'doctor', 'public_link', 'system');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quickcheck_language') THEN
    CREATE TYPE public.quickcheck_language AS ENUM ('english', 'hindi');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quickcheck_booking_status') THEN
    CREATE TYPE public.quickcheck_booking_status AS ENUM ('booked', 'completed', 'no_show', 'rescheduled', 'cancelled');
  END IF;
END
$$;

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anon_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (title in ('Doctor Brief', 'Emergency Brief')),
  care_setting public.care_setting not null,
  department_bucket public.department_bucket not null,
  summary_json jsonb not null default '{}'::jsonb,
  confidence_notes text,
  share_token text unique,
  share_pin_hash text,
  share_expires_at timestamptz,
  revoked_at timestamptz,
  attachment_count integer not null default 0,
  generated_by_model text
);

create index if not exists briefs_user_id_created_at_idx
  on public.briefs(user_id, created_at desc);

create index if not exists briefs_anon_session_id_created_at_idx
  on public.briefs(anon_session_id, created_at desc);

create index if not exists briefs_share_token_idx
  on public.briefs(share_token)
  where share_token is not null;

create index if not exists briefs_summary_json_gin_idx
  on public.briefs using gin (summary_json);

create table if not exists public.brief_events (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs(id) on delete cascade,
  actor_type public.brief_actor_type not null,
  actor_id uuid,
  event_type text not null,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists brief_events_brief_id_created_at_idx
  on public.brief_events(brief_id, created_at desc);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid references public.briefs(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  anon_session_id text,
  storage_path text not null unique,
  mime_type text not null,
  original_filename text,
  created_at timestamptz not null default now(),
  ocr_text text,
  doc_summary text,
  extraction_confidence text
);

create index if not exists uploads_brief_id_created_at_idx
  on public.uploads(brief_id, created_at desc);

create index if not exists uploads_user_id_created_at_idx
  on public.uploads(user_id, created_at desc);

create index if not exists uploads_anon_session_id_created_at_idx
  on public.uploads(anon_session_id, created_at desc);

create index if not exists uploads_ocr_text_gin_idx
  on public.uploads using gin (to_tsvector('simple', coalesce(ocr_text, '')));

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade unique,
  name text not null,
  phone text,
  role text not null default 'doctor' check (role in ('doctor', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists doctors_auth_user_id_idx
  on public.doctors(auth_user_id);

create table if not exists public.quickcheck_slots (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null unique,
  end_time timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quickcheck_slots_start_time_idx
  on public.quickcheck_slots(start_time asc);

create table if not exists public.quickcheck_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.quickcheck_slots(id) on delete cascade,
  brief_id uuid not null references public.briefs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  anon_session_id text,
  phone text not null,
  language public.quickcheck_language not null default 'english',
  consent_to_call boolean not null default false,
  status public.quickcheck_booking_status not null default 'booked',
  doctor_id uuid references public.doctors(id) on delete set null,
  notes text,
  reschedule_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists quickcheck_bookings_slot_unique_active_idx
  on public.quickcheck_bookings(slot_id)
  where status = 'booked';

create index if not exists quickcheck_bookings_user_id_created_at_idx
  on public.quickcheck_bookings(user_id, created_at desc);

create index if not exists quickcheck_bookings_anon_session_id_created_at_idx
  on public.quickcheck_bookings(anon_session_id, created_at desc);

create index if not exists quickcheck_bookings_doctor_id_status_idx
  on public.quickcheck_bookings(doctor_id, status, created_at desc);

create table if not exists public.doctor_access_log (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  brief_id uuid not null references public.briefs(id) on delete cascade,
  timestamp timestamptz not null default now(),
  action text not null default 'viewed_brief'
);

create index if not exists doctor_access_log_doctor_idx
  on public.doctor_access_log(doctor_id, timestamp desc);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  brief_id uuid references public.briefs(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  anon_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_name_created_at_idx
  on public.analytics_events(event_name, created_at desc);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.quickcheck_bookings(id) on delete set null,
  ticket_type text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'closed')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_created_at_idx
  on public.support_tickets(created_at desc);

-- Keep timestamps fresh
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS briefs_updated_at on public.briefs;
    CREATE TRIGGER briefs_updated_at
      before update on public.briefs
      for each row execute function public.set_updated_at();

    DROP TRIGGER IF EXISTS doctors_updated_at on public.doctors;
    CREATE TRIGGER doctors_updated_at
      before update on public.doctors
      for each row execute function public.set_updated_at();

    DROP TRIGGER IF EXISTS quickcheck_bookings_updated_at on public.quickcheck_bookings;
    CREATE TRIGGER quickcheck_bookings_updated_at
      before update on public.quickcheck_bookings
      for each row execute function public.set_updated_at();
  END IF;
END
$$;

alter table public.briefs enable row level security;
alter table public.brief_events enable row level security;
alter table public.uploads enable row level security;
alter table public.doctors enable row level security;
alter table public.quickcheck_slots enable row level security;
alter table public.quickcheck_bookings enable row level security;
alter table public.doctor_access_log enable row level security;
alter table public.analytics_events enable row level security;
alter table public.support_tickets enable row level security;

-- briefs
DROP POLICY IF EXISTS briefs_select_owner ON public.briefs;
CREATE POLICY briefs_select_owner
ON public.briefs
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS briefs_insert_owner ON public.briefs;
CREATE POLICY briefs_insert_owner
ON public.briefs
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS briefs_update_owner ON public.briefs;
CREATE POLICY briefs_update_owner
ON public.briefs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS briefs_delete_owner ON public.briefs;
CREATE POLICY briefs_delete_owner
ON public.briefs
FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS briefs_select_assigned_doctor ON public.briefs;
CREATE POLICY briefs_select_assigned_doctor
ON public.briefs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.quickcheck_bookings qb
    JOIN public.doctors d ON d.id = qb.doctor_id
    WHERE qb.brief_id = briefs.id
      AND d.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS briefs_update_assigned_doctor ON public.briefs;
CREATE POLICY briefs_update_assigned_doctor
ON public.briefs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.quickcheck_bookings qb
    JOIN public.doctors d ON d.id = qb.doctor_id
    WHERE qb.brief_id = briefs.id
      AND d.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quickcheck_bookings qb
    JOIN public.doctors d ON d.id = qb.doctor_id
    WHERE qb.brief_id = briefs.id
      AND d.auth_user_id = auth.uid()
  )
);

-- uploads
DROP POLICY IF EXISTS uploads_select_owner ON public.uploads;
CREATE POLICY uploads_select_owner
ON public.uploads
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS uploads_insert_owner ON public.uploads;
CREATE POLICY uploads_insert_owner
ON public.uploads
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS uploads_update_owner ON public.uploads;
CREATE POLICY uploads_update_owner
ON public.uploads
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS uploads_select_assigned_doctor ON public.uploads;
CREATE POLICY uploads_select_assigned_doctor
ON public.uploads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.quickcheck_bookings qb
    JOIN public.doctors d ON d.id = qb.doctor_id
    WHERE qb.brief_id = uploads.brief_id
      AND d.auth_user_id = auth.uid()
  )
);

-- brief events
DROP POLICY IF EXISTS brief_events_select_owner ON public.brief_events;
CREATE POLICY brief_events_select_owner
ON public.brief_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.briefs b
    WHERE b.id = brief_events.brief_id
      AND b.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS brief_events_insert_actor ON public.brief_events;
CREATE POLICY brief_events_insert_actor
ON public.brief_events
FOR INSERT
WITH CHECK (
  actor_id IS NULL OR actor_id = auth.uid()
);

-- doctors
DROP POLICY IF EXISTS doctors_select_self ON public.doctors;
CREATE POLICY doctors_select_self
ON public.doctors
FOR SELECT
USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS doctors_update_self ON public.doctors;
CREATE POLICY doctors_update_self
ON public.doctors
FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- quickcheck slots
DROP POLICY IF EXISTS quickcheck_slots_select_authenticated ON public.quickcheck_slots;
CREATE POLICY quickcheck_slots_select_authenticated
ON public.quickcheck_slots
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS quickcheck_slots_update_doctor ON public.quickcheck_slots;
CREATE POLICY quickcheck_slots_update_doctor
ON public.quickcheck_slots
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
      AND d.active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
      AND d.active = true
  )
);

-- quickcheck bookings
DROP POLICY IF EXISTS quickcheck_bookings_select_owner ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_select_owner
ON public.quickcheck_bookings
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS quickcheck_bookings_insert_owner ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_insert_owner
ON public.quickcheck_bookings
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS quickcheck_bookings_update_owner ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_update_owner
ON public.quickcheck_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS quickcheck_bookings_select_doctor ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_select_doctor
ON public.quickcheck_bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
      AND d.active = true
      AND (quickcheck_bookings.doctor_id IS NULL OR quickcheck_bookings.doctor_id = d.id)
  )
);

DROP POLICY IF EXISTS quickcheck_bookings_update_doctor ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_update_doctor
ON public.quickcheck_bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
      AND d.active = true
      AND (quickcheck_bookings.doctor_id IS NULL OR quickcheck_bookings.doctor_id = d.id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
      AND d.active = true
      AND quickcheck_bookings.doctor_id = d.id
  )
);

-- doctor access log
DROP POLICY IF EXISTS doctor_access_log_select_doctor ON public.doctor_access_log;
CREATE POLICY doctor_access_log_select_doctor
ON public.doctor_access_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = doctor_access_log.doctor_id
      AND d.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS doctor_access_log_insert_doctor ON public.doctor_access_log;
CREATE POLICY doctor_access_log_insert_doctor
ON public.doctor_access_log
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = doctor_access_log.doctor_id
      AND d.auth_user_id = auth.uid()
  )
);

-- analytics
DROP POLICY IF EXISTS analytics_events_select_owner ON public.analytics_events;
CREATE POLICY analytics_events_select_owner
ON public.analytics_events
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS analytics_events_insert_owner ON public.analytics_events;
CREATE POLICY analytics_events_insert_owner
ON public.analytics_events
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- support tickets
DROP POLICY IF EXISTS support_tickets_select_doctor ON public.support_tickets;
CREATE POLICY support_tickets_select_doctor
ON public.support_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.quickcheck_bookings qb
    JOIN public.doctors d ON d.id = qb.doctor_id
    WHERE qb.id = support_tickets.booking_id
      AND d.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS support_tickets_insert_doctor ON public.support_tickets;
CREATE POLICY support_tickets_insert_doctor
ON public.support_tickets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
  )
);

-- Private PHI bucket for brief documents/photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brief-files',
  'brief-files',
  false,
  20971520,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
