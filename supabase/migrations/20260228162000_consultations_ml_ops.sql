do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
  ) then
    alter table public.profiles
      add column role text not null default 'patient'
      check (role in ('patient', 'doctor', 'admin'));
  end if;
end
$$;

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references auth.users(id) on delete set null,
  triage_session_id uuid references public.triage_sessions(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'normal' check (priority in ('normal', 'urgent', 'critical')),
  chief_complaint text not null,
  clinical_summary text,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultations_patient_id_created_at_idx
on public.consultations(patient_id, created_at desc);

create index if not exists consultations_doctor_id_status_idx
on public.consultations(doctor_id, status, updated_at desc);

create table if not exists public.consultation_messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('patient', 'doctor', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists consultation_messages_consultation_id_created_at_idx
on public.consultation_messages(consultation_id, created_at asc);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  medication text not null,
  dosage text not null,
  instructions text not null,
  status text not null default 'issued' check (status in ('issued', 'voided')),
  created_at timestamptz not null default now()
);

create index if not exists prescriptions_patient_id_created_at_idx
on public.prescriptions(patient_id, created_at desc);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_actor_user_id_created_at_idx
on public.audit_events(actor_user_id, created_at desc);

create trigger consultations_updated_at
before update on public.consultations
for each row execute function public.set_updated_at();

alter table public.consultations enable row level security;
alter table public.consultation_messages enable row level security;
alter table public.prescriptions enable row level security;
alter table public.audit_events enable row level security;

create policy "consultations_patient_select_own"
on public.consultations
for select
using (auth.uid() = patient_id);

create policy "consultations_patient_insert_own"
on public.consultations
for insert
with check (auth.uid() = patient_id);

create policy "consultations_patient_update_own"
on public.consultations
for update
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

create policy "consultations_doctor_queue_select"
on public.consultations
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('doctor', 'admin')
  )
  and (
    consultations.doctor_id = auth.uid()
    or consultations.doctor_id is null
  )
);

create policy "consultations_doctor_queue_update"
on public.consultations
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('doctor', 'admin')
  )
  and (
    consultations.doctor_id = auth.uid()
    or consultations.doctor_id is null
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('doctor', 'admin')
  )
  and consultations.doctor_id = auth.uid()
);

create policy "consultation_messages_patient_read"
on public.consultation_messages
for select
using (
  exists (
    select 1
    from public.consultations c
    where c.id = consultation_messages.consultation_id
      and c.patient_id = auth.uid()
  )
);

create policy "consultation_messages_patient_insert"
on public.consultation_messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.consultations c
    where c.id = consultation_messages.consultation_id
      and c.patient_id = auth.uid()
  )
);

create policy "consultation_messages_doctor_read"
on public.consultation_messages
for select
using (
  exists (
    select 1
    from public.consultations c
    where c.id = consultation_messages.consultation_id
      and c.doctor_id = auth.uid()
  )
);

create policy "consultation_messages_doctor_insert"
on public.consultation_messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.consultations c
    where c.id = consultation_messages.consultation_id
      and c.doctor_id = auth.uid()
  )
);

create policy "prescriptions_patient_select"
on public.prescriptions
for select
using (patient_id = auth.uid());

create policy "prescriptions_doctor_manage"
on public.prescriptions
for all
using (doctor_id = auth.uid())
with check (doctor_id = auth.uid());

create policy "audit_events_insert_own"
on public.audit_events
for insert
with check (actor_user_id = auth.uid());

create policy "audit_events_read_own"
on public.audit_events
for select
using (actor_user_id = auth.uid());
