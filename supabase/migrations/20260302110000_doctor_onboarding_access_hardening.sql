-- Doctor onboarding + strict doctor assignment access

-- Doctors: add onboarding/profile and availability fields.
alter table public.doctors
  add column if not exists specialization text,
  add column if not exists languages text[] not null default '{}'::text[],
  add column if not exists years_experience integer,
  add column if not exists city text,
  add column if not exists registration_number text,
  add column if not exists registration_council text,
  add column if not exists availability_enabled boolean not null default true,
  add column if not exists availability_days text[] not null default array['mon','tue','wed','thu','fri','sat','sun'],
  add column if not exists availability_start_time time not null default time '19:00',
  add column if not exists availability_end_time time not null default time '22:00';

create index if not exists doctors_active_availability_idx
  on public.doctors(active, availability_enabled);

-- Doctor applications table for approval workflow.
create table if not exists public.doctor_applications (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text not null,
  specialization text not null,
  languages text[] not null default '{}'::text[],
  registration_number text not null,
  registration_council text not null,
  years_experience integer not null check (years_experience >= 0 and years_experience <= 80),
  city text not null,
  phone text not null,
  whatsapp text,
  quickcheck_opt_in boolean not null default true,
  availability_days text[] not null default array['mon','tue','wed','thu','fri','sat','sun'],
  availability_window text not null default '19:00-22:00',
  terms_accepted boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'disabled')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists doctor_applications_status_created_at_idx
  on public.doctor_applications(status, created_at desc);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS doctor_applications_updated_at on public.doctor_applications;
    CREATE TRIGGER doctor_applications_updated_at
      before update on public.doctor_applications
      for each row execute function public.set_updated_at();
  END IF;
END
$$;

alter table public.doctor_applications enable row level security;

-- Applicant can read/write their own pending application.
DROP POLICY IF EXISTS doctor_applications_select_own ON public.doctor_applications;
CREATE POLICY doctor_applications_select_own
ON public.doctor_applications
FOR SELECT
USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS doctor_applications_insert_own ON public.doctor_applications;
CREATE POLICY doctor_applications_insert_own
ON public.doctor_applications
FOR INSERT
WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS doctor_applications_update_own_pending ON public.doctor_applications;
CREATE POLICY doctor_applications_update_own_pending
ON public.doctor_applications
FOR UPDATE
USING (auth_user_id = auth.uid() and status = 'pending')
WITH CHECK (auth_user_id = auth.uid() and status = 'pending');

-- Admin policies for onboarding review and global visibility.
DROP POLICY IF EXISTS doctor_applications_admin_all ON public.doctor_applications;
CREATE POLICY doctor_applications_admin_all
ON public.doctor_applications
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

-- Strict doctor visibility: only explicitly assigned bookings (no unassigned visibility).
DROP POLICY IF EXISTS quickcheck_bookings_select_doctor ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_select_doctor
ON public.quickcheck_bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.auth_user_id = auth.uid()
      AND d.active = true
      AND quickcheck_bookings.doctor_id = d.id
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
      AND quickcheck_bookings.doctor_id = d.id
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

-- Strict doctor visibility for consultation queue: assigned-only.
DROP POLICY IF EXISTS consultations_doctor_queue_select ON public.consultations;
CREATE POLICY consultations_doctor_queue_select
ON public.consultations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role in ('doctor', 'admin')
  )
  AND consultations.doctor_id = auth.uid()
);

DROP POLICY IF EXISTS consultations_doctor_queue_update ON public.consultations;
CREATE POLICY consultations_doctor_queue_update
ON public.consultations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role in ('doctor', 'admin')
  )
  AND consultations.doctor_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role in ('doctor', 'admin')
  )
  AND consultations.doctor_id = auth.uid()
);

-- Admin can view/manage everything for operations.
DROP POLICY IF EXISTS briefs_admin_all ON public.briefs;
CREATE POLICY briefs_admin_all
ON public.briefs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS uploads_admin_all ON public.uploads;
CREATE POLICY uploads_admin_all
ON public.uploads
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS doctors_admin_all ON public.doctors;
CREATE POLICY doctors_admin_all
ON public.doctors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS quickcheck_slots_admin_all ON public.quickcheck_slots;
CREATE POLICY quickcheck_slots_admin_all
ON public.quickcheck_slots
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS quickcheck_bookings_admin_all ON public.quickcheck_bookings;
CREATE POLICY quickcheck_bookings_admin_all
ON public.quickcheck_bookings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS doctor_access_log_admin_all ON public.doctor_access_log;
CREATE POLICY doctor_access_log_admin_all
ON public.doctor_access_log
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS consultations_admin_all ON public.consultations;
CREATE POLICY consultations_admin_all
ON public.consultations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS consultation_messages_admin_all ON public.consultation_messages;
CREATE POLICY consultation_messages_admin_all
ON public.consultation_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS prescriptions_admin_all ON public.prescriptions;
CREATE POLICY prescriptions_admin_all
ON public.prescriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
