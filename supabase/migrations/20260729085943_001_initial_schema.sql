-- =========================================================
-- MAMALINK MVP DATABASE
-- Supabase / PostgreSQL
-- =========================================================

create extension if not exists "pgcrypto";


-- =========================================================
-- 1. ENUMS
-- =========================================================

create type gender_enum as enum (
  'MALE',
  'FEMALE'
);

create type person_role_enum as enum (
  'MOTHER',
  'CHILD',
  'CAREGIVER',
  'CHPS_WORKER',
  'SUPERVISOR',
  'ADMIN'
);

create type episode_type_enum as enum (
  'PREGNANCY',
  'POSTNATAL',
  'NEWBORN'
);

create type episode_status_enum as enum (
  'ACTIVE',
  'COMPLETED',
  'CANCELLED'
);

create type appointment_status_enum as enum (
  'SCHEDULED',
  'COMPLETED',
  'MISSED',
  'CANCELLED'
);

create type visit_status_enum as enum (
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

create type risk_level_enum as enum (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

create type signal_source_enum as enum (
  'RULE_ENGINE',
  'CARE_WORKFLOW',
  'HEALTH_WORKER'
);

create type priority_status_enum as enum (
  'OPEN',
  'REVIEWED',
  'RESOLVED'
);

create type referral_status_enum as enum (
  'PENDING',
  'COMPLETED',
  'CANCELLED'
);

create type ai_review_status_enum as enum (
  'PENDING_REVIEW',
  'ACCEPTED',
  'REJECTED',
  'MODIFIED'
);

create type relationship_type_enum as enum (
  'MOTHER_OF',
  'CAREGIVER_OF'
);

-- =========================================================
-- 2. LOCATIONS (defined before PROFILES for FK ordering)
-- =========================================================

create table regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table districts (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id),
  name text not null,
  created_at timestamptz not null default now(),

  unique(region_id, name)
);

create table communities (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts(id),
  name text not null,
  created_at timestamptz not null default now(),

  unique(district_id, name)
);

-- =========================================================
-- PROFILES — bridges Supabase auth.users to app identity
-- =========================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  email text,
  phone text,

  role person_role_enum not null
    check (role in ('CAREGIVER', 'CHPS_WORKER')),

  -- Assignment scope — only meaningful for CHPS_WORKER
  assigned_community_id uuid references communities(id),
  assigned_district_id uuid references districts(id),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users read their own profile"
on profiles for select
using (auth.uid() = id);

create policy "users update their own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "allow insert on profile creation"
on profiles for insert
with check (auth.uid() = id);

create trigger profiles_updated_at
before update on profiles
for each row execute function update_updated_at();


-- =========================================================
-- WORKER ASSIGNMENTS — for CHPS_WORKERs covering multiple communities
-- (skip this table entirely if assigned_community_id on profiles is enough for MVP)
-- =========================================================

create table worker_assignments (
  id uuid primary key default gen_random_uuid(),
  worker_profile_id uuid not null references profiles(id),
  community_id uuid not null references communities(id),
  created_at timestamptz not null default now(),
  unique(worker_profile_id, community_id)
);

alter table worker_assignments enable row level security;

create policy "workers read their own assignments"
on worker_assignments for select
using (worker_profile_id = auth.uid());


-- =========================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- =========================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::person_role_enum, 'CHPS_WORKER')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =========================================================
-- 2. LOCATIONS (moved up before profiles)
-- =========================================================


-- =========================================================
-- 3. HOUSEHOLDS
-- =========================================================

create table households (
  id uuid primary key default gen_random_uuid(),

  household_code text not null unique,

  community_id uuid not null
    references communities(id),

  address_description text,

  latitude numeric,
  longitude numeric,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deleted_at timestamptz
);


-- =========================================================
-- 4. PERSONS
-- =========================================================

create table persons (
  id uuid primary key default gen_random_uuid(),

  household_id uuid
    references households(id),

  first_name text not null,
  last_name text,

  date_of_birth date,

  gender gender_enum,

  phone text,

  preferred_language text,

  role person_role_enum not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deleted_at timestamptz
);


-- =========================================================
-- 5. PERSON RELATIONSHIPS
-- =========================================================

create table person_relationships (
  id uuid primary key default gen_random_uuid(),

  person_id uuid not null
    references persons(id),

  related_person_id uuid not null
    references persons(id),

  relationship_type relationship_type_enum not null,

  created_at timestamptz not null default now(),

  unique (
    person_id,
    related_person_id,
    relationship_type
  )
);


-- =========================================================
-- 6. CARE EPISODES
-- =========================================================

create table care_episodes (
  id uuid primary key default gen_random_uuid(),

  person_id uuid not null
    references persons(id),

  episode_type episode_type_enum not null,

  status episode_status_enum not null
    default 'ACTIVE',

  start_date date not null,

  expected_end_date date,

  actual_end_date date,

  parent_episode_id uuid
    references care_episodes(id),

  created_by uuid
    references persons(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deleted_at timestamptz
);


-- =========================================================
-- 7. APPOINTMENTS
-- =========================================================

create table appointments (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  scheduled_date date not null,

  appointment_type text not null,

  reason text,

  status appointment_status_enum not null
    default 'SCHEDULED',

  scheduled_by uuid
    references persons(id),

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deleted_at timestamptz
);


-- =========================================================
-- 8. VISITS
-- =========================================================

create table visits (
  id uuid primary key default gen_random_uuid(),

  appointment_id uuid
    references appointments(id),

  episode_id uuid not null
    references care_episodes(id),

  person_id uuid not null
    references persons(id),

  performed_by uuid
    references persons(id),

  visit_date timestamptz not null default now(),

  visit_type text not null,

  status visit_status_enum not null
    default 'IN_PROGRESS',

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deleted_at timestamptz
);


-- =========================================================
-- 9. CLINICAL ASSESSMENTS
-- =========================================================

create table clinical_assessments (
  id uuid primary key default gen_random_uuid(),

  visit_id uuid not null
    references visits(id),

  assessment_type text not null,

  assessed_by uuid
    references persons(id),

  created_at timestamptz not null default now()
);


-- =========================================================
-- 10. PREGNANCY ASSESSMENTS
-- =========================================================

create table pregnancy_assessments (
  id uuid primary key default gen_random_uuid(),

  clinical_assessment_id uuid not null unique
    references clinical_assessments(id),

  systolic_bp integer,
  diastolic_bp integer,

  weight_kg numeric,

  temperature_c numeric,

  pulse_rate integer,

  gestational_age_weeks numeric,

  symptoms text,

  danger_signs text,

  notes text,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 11. POSTNATAL ASSESSMENTS
-- =========================================================

create table postnatal_assessments (
  id uuid primary key default gen_random_uuid(),

  clinical_assessment_id uuid not null unique
    references clinical_assessments(id),

  systolic_bp integer,
  diastolic_bp integer,

  temperature_c numeric,

  bleeding text,

  pain text,

  breastfeeding_status text,

  danger_signs text,

  notes text,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 12. NEWBORN ASSESSMENTS
-- =========================================================

create table newborn_assessments (
  id uuid primary key default gen_random_uuid(),

  clinical_assessment_id uuid not null unique
    references clinical_assessments(id),

  weight_kg numeric,

  temperature_c numeric,

  feeding_status text,

  breathing_status text,

  jaundice text,

  cord_status text,

  danger_signs text,

  notes text,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 13. DELIVERY EVENTS
-- =========================================================

create table delivery_events (
  id uuid primary key default gen_random_uuid(),

  pregnancy_episode_id uuid not null unique
    references care_episodes(id),

  mother_id uuid not null
    references persons(id),

  newborn_id uuid
    references persons(id),

  delivery_date timestamptz not null,

  delivery_location text,

  delivery_mode text,

  complications text,

  notes text,

  recorded_by uuid
    references persons(id),

  created_at timestamptz not null default now()
);


-- =========================================================
-- 14. REFERRALS
-- =========================================================

create table referrals (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  person_id uuid not null
    references persons(id),

  referred_by uuid
    references persons(id),

  referred_to text not null,

  reason text not null,

  referral_date date not null,

  status referral_status_enum not null
    default 'PENDING',

  completed_date date,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- 15. CLINICAL SIGNALS
-- =========================================================

create table clinical_signals (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  assessment_id uuid
    references clinical_assessments(id),

  signal_type text not null,

  severity risk_level_enum not null,

  description text not null,

  source signal_source_enum not null
    default 'RULE_ENGINE',

  detected_at timestamptz not null default now(),

  resolved_at timestamptz,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 16. CARE SIGNALS
-- =========================================================

create table care_signals (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  appointment_id uuid
    references appointments(id),

  referral_id uuid
    references referrals(id),

  signal_type text not null,

  severity risk_level_enum not null,

  description text not null,

  detected_at timestamptz not null default now(),

  resolved_at timestamptz,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 17. CARE PRIORITIES
-- =========================================================

create table care_priorities (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  priority_level risk_level_enum not null,

  priority_score numeric,

  status priority_status_enum not null
    default 'OPEN',

  generated_at timestamptz not null default now(),

  reviewed_by uuid
    references persons(id),

  reviewed_at timestamptz
);


-- =========================================================
-- 18. CARE PRIORITY REASONS
-- =========================================================

create table care_priority_reasons (
  id uuid primary key default gen_random_uuid(),

  priority_id uuid not null
    references care_priorities(id)
    on delete cascade,

  reason_type text not null,

  description text not null,

  severity risk_level_enum,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 19. AI RECOMMENDATIONS
-- =========================================================

create table ai_recommendations (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  priority_id uuid
    references care_priorities(id),

  recommendation text not null,

  explanation text,

  model_name text,

  review_status ai_review_status_enum not null
    default 'PENDING_REVIEW',

  reviewed_by uuid
    references persons(id),

  reviewed_at timestamptz,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 20. CAREGIVER GUIDANCE
-- =========================================================

create table caregiver_guidance (
  id uuid primary key default gen_random_uuid(),

  episode_id uuid not null
    references care_episodes(id),

  ai_recommendation_id uuid
    references ai_recommendations(id),

  language text not null,

  text_content text not null,

  audio_url text,

  created_at timestamptz not null default now()
);


-- =========================================================
-- 21. INDEXES
-- =========================================================

create index idx_households_community
  on households(community_id);

create index idx_persons_household
  on persons(household_id);

create index idx_episodes_person
  on care_episodes(person_id);

create index idx_episodes_status
  on care_episodes(status);

create index idx_appointments_episode
  on appointments(episode_id);

create index idx_appointments_date_status
  on appointments(scheduled_date, status);

create index idx_visits_episode
  on visits(episode_id);

create index idx_assessments_visit
  on clinical_assessments(visit_id);

create index idx_clinical_signals_episode
  on clinical_signals(episode_id);

create index idx_care_signals_episode
  on care_signals(episode_id);

create index idx_priorities_episode
  on care_priorities(episode_id);

create index idx_priorities_status_level
  on care_priorities(status, priority_level);

create index idx_referrals_episode
  on referrals(episode_id);

create index idx_referrals_status
  on referrals(status);


-- =========================================================
-- 22. UPDATED_AT TRIGGER
-- =========================================================

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger households_updated_at
before update on households
for each row
execute function update_updated_at();


create trigger persons_updated_at
before update on persons
for each row
execute function update_updated_at();


create trigger care_episodes_updated_at
before update on care_episodes
for each row
execute function update_updated_at();


create trigger appointments_updated_at
before update on appointments
for each row
execute function update_updated_at();


create trigger visits_updated_at
before update on visits
for each row
execute function update_updated_at();


create trigger referrals_updated_at
before update on referrals
for each row
execute function update_updated_at();



-- Add updated_at + trigger to every table missing it
alter table clinical_assessments add column if not exists updated_at timestamptz not null default now();
alter table pregnancy_assessments add column if not exists updated_at timestamptz not null default now();
alter table postnatal_assessments add column if not exists updated_at timestamptz not null default now();
alter table newborn_assessments add column if not exists updated_at timestamptz not null default now();
alter table delivery_events add column if not exists updated_at timestamptz not null default now();
alter table clinical_signals add column if not exists updated_at timestamptz not null default now();
alter table care_signals add column if not exists updated_at timestamptz not null default now();
alter table care_priorities add column if not exists updated_at timestamptz not null default now();
alter table care_priority_reasons add column if not exists updated_at timestamptz not null default now();
alter table ai_recommendations add column if not exists updated_at timestamptz not null default now();
alter table caregiver_guidance add column if not exists updated_at timestamptz not null default now();
alter table regions add column if not exists updated_at timestamptz not null default now();
alter table districts add column if not exists updated_at timestamptz not null default now();
alter table communities add column if not exists updated_at timestamptz not null default now();
alter table person_relationships add column if not exists updated_at timestamptz not null default now();

-- Attach the existing trigger to all of them
create trigger clinical_assessments_updated_at before update on clinical_assessments for each row execute function update_updated_at();
create trigger pregnancy_assessments_updated_at before update on pregnancy_assessments for each row execute function update_updated_at();
create trigger postnatal_assessments_updated_at before update on postnatal_assessments for each row execute function update_updated_at();
create trigger newborn_assessments_updated_at before update on newborn_assessments for each row execute function update_updated_at();
create trigger delivery_events_updated_at before update on delivery_events for each row execute function update_updated_at();
create trigger clinical_signals_updated_at before update on clinical_signals for each row execute function update_updated_at();
create trigger care_signals_updated_at before update on care_signals for each row execute function update_updated_at();
create trigger care_priorities_updated_at before update on care_priorities for each row execute function update_updated_at();
create trigger care_priority_reasons_updated_at before update on care_priority_reasons for each row execute function update_updated_at();
create trigger ai_recommendations_updated_at before update on ai_recommendations for each row execute function update_updated_at();
create trigger caregiver_guidance_updated_at before update on caregiver_guidance for each row execute function update_updated_at();
create trigger regions_updated_at before update on regions for each row execute function update_updated_at();
create trigger districts_updated_at before update on districts for each row execute function update_updated_at();
create trigger communities_updated_at before update on communities for each row execute function update_updated_at();
create trigger person_relationships_updated_at before update on person_relationships for each row execute function update_updated_at();