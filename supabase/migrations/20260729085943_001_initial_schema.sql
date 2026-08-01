create extension if not exists "pgcrypto";

-- enums
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
    'NEWBORN'
);

create type episode_status_enum as enum (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);

create type milestone_status_enum as enum (
    'PENDING',
    'COMPLETED',
    'MISSED'
);

create type risk_level_enum as enum (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

create type user_role_enum as enum (
    'CHPS_WORKER',
    'CAREGIVER',
    'SUPERVISOR',
    'ADMIN'
);

-- geography hierarchy
create table regions (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    created_at timestamptz default now()
);

create table districts (
    id uuid primary key default gen_random_uuid(),
    region_id uuid references regions(id),
    name text not null,
    created_at timestamptz default now()
);

create table communities (
    id uuid primary key default gen_random_uuid(),
    district_id uuid references districts(id),
    name text not null,
    created_at timestamptz default now()
);

create table chps_compounds (
    id uuid primary key default gen_random_uuid(),
    community_id uuid references communities(id),
    name text not null,
    created_at timestamptz default now()
);

-- households and people
create table households (
    id uuid primary key default gen_random_uuid(),
    community_id uuid references communities(id),
    chps_compound_id uuid references chps_compounds(id),
    household_code text unique,
    house_number text,
    gps_location text,
    created_at timestamptz default now()
);

create table persons (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references households(id),
    first_name text not null,
    last_name text,
    gender gender_enum,
    date_of_birth date,
    phone text,
    preferred_language text,
    role person_role_enum,
    is_pregnant boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- staff accounts (tied to Supabase auth users)
create table profiles (
    id uuid primary key references auth.users(id),
    full_name text not null,
    role user_role_enum not null,
    district_id uuid references districts(id),
    chps_compound_id uuid references chps_compounds(id),
    phone text,
    created_at timestamptz default now()
);

-- care flow
create table care_episodes (
    id uuid primary key default gen_random_uuid(),
    person_id uuid references persons(id),
    episode_type episode_type_enum,
    start_date date,
    expected_end_date date,
    actual_end_date date,
    status episode_status_enum default 'ACTIVE',
    created_at timestamptz default now()
);

create table care_plan_milestones (
    id uuid primary key default gen_random_uuid(),
    episode_id uuid references care_episodes(id),
    title text,
    due_date date,
    completed_date date,
    status milestone_status_enum default 'PENDING',
    priority integer default 1
);

create table clinical_assessments (
    id uuid primary key default gen_random_uuid(),
    milestone_id uuid references care_plan_milestones(id),
    assessed_by uuid references profiles(id),
    blood_pressure text,
    weight numeric,
    temperature numeric,
    symptoms text,
    notes text,
    created_at timestamptz default now()
);

create table risk_assessments (
    id uuid primary key default gen_random_uuid(),
    assessment_id uuid references clinical_assessments(id),
    risk_level risk_level_enum,
    reason text,
    created_at timestamptz default now()
);

create table ai_recommendations (
    id uuid primary key default gen_random_uuid(),
    assessment_id uuid references clinical_assessments(id),
    summary text,
    recommendation text,
    translated_text text,
    audio_url text,
    created_at timestamptz default now()
);