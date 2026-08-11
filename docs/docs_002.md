Yes bro. Based on everything we've established **and the UNICEF workshop/concept note**, I would now freeze the MVP around one engineering idea:

> **MamaLink records the care journey, detects care/risk signals, and converts them into a prioritized action list for the CHPS worker.**

The hackathon materials explicitly emphasize a specific frontline user and moment, a ranked visit list, offline operation, explainability, and keeping the health worker in control.  

The concept note also specifically identifies **early risk detection, last-mile follow-up, voice-first caregiver support, and smarter CHPS workflows** as challenge areas. 

So here is the **final MVP engineering plan** I would build.

---

# 1. MVP PRODUCT DEFINITION

## MamaLink Care Radar

### Primary user

**CHPS worker / midwife**

### Primary moment

**Before and during the worker's community follow-up round.**

### Core question

> **"Who needs my attention first, and why?"**

### MVP solution

```text
Routine CHPS data
       ↓
Care Journey
       ↓
Appointments + Visits + Referrals
       ↓
Clinical + Care Signals
       ↓
Care Radar
       ↓
Prioritized households
       ↓
Health worker reviews
       ↓
AI explanation/recommendation
       ↓
Caregiver guidance
       ↓
Khaya local-language voice
```

This directly follows the workshop's strong example of a CHPS worker with many households but no way to rank them, where the intervention is a ranked visit list generated from information already recorded. 

---

# 2. MVP FEATURES

I would divide them into **8 features**.

| # | Feature                                | Priority |
| - | -------------------------------------- | -------- |
| 1 | Household & Person Registration        | 🔥 Must  |
| 2 | Pregnancy Care Journey                 | 🔥 Must  |
| 3 | Appointment & Follow-up Tracking       | 🔥 Must  |
| 4 | Clinical Assessment & Risk Signals     | 🔥 Must  |
| 5 | Care Radar / Priority List             | 🔥 Must  |
| 6 | Delivery → Mother + Newborn Continuity | 🔥 Must  |
| 7 | AI Explanation + Recommendation        | 🔥 Must  |
| 8 | Local-language Voice + Offline Sync    | 🔥 Must  |

We should **not** build family tree, full under-5 journey, full nutrition engine, WhatsApp, USSD, hospital EHR, etc. in this MVP.

The hackathon explicitly warns against ambitious but unbuildable solutions and recommends the smallest intervention that changes the outcome. 

---

# 3. FEATURE 1 — HOUSEHOLD & PERSON REGISTRATION

## Purpose

Create the basic community record.

### Flow

```text
CHPS Worker
    ↓
Select Community
    ↓
Create Household
    ↓
Register Woman
    ↓
Create Person
```

### Data

```text
Community
  ↓
Household
  ↓
Person
```

Example:

```text
Community: Kumbungu

Household: HH-00124

Person:
Mary Abdulai
Female
Phone
Preferred language
```

### Why household matters

Because our eventual output isn't just:

> "Patient #123."

It should be:

> **"This household needs attention."**

That's much closer to community-level CHPS work.

---

# 4. FEATURE 2 — PREGNANCY CARE JOURNEY

When the worker registers a pregnant woman:

```text
Mary
 ↓
Pregnancy Episode
 ↓
Active
```

The episode contains:

* start date
* expected delivery date
* status
* responsible worker

### Important

**Do not create ANC1, ANC2, ANC3 as fixed database records.**

Instead:

```text
Pregnancy Episode
       ↓
Appointment
       ↓
Visit
       ↓
Next Appointment
```

The midwife decides the next appointment.

This preserves the real workflow you discovered.

---

# 5. FEATURE 3 — APPOINTMENT + FOLLOW-UP

This is one of the most important features.

## Scheduling

After completing a visit:

```text
Visit completed
      ↓
Midwife chooses next date
      ↓
Appointment created
```

Example:

```text
Mary

Next visit:
15 Aug 2026

Reason:
ANC follow-up

Scheduled by:
Midwife
```

---

## Appointment monitoring

Every day:

```text
Appointment
     ↓
Is date today?
     │
     ├── YES → DUE TODAY
     │
     └── NO
          ↓
       Is date passed?
          │
          ├── YES → OVERDUE
          └── NO → UPCOMING
```

If overdue:

```text
OVERDUE
   ↓
Care Signal
   ↓
Priority Engine
```

This is the beginning of our proactive system.

---

# 6. FEATURE 4 — CLINICAL ASSESSMENT

When the woman comes for a visit:

```text
Appointment
     ↓
Start Visit
     ↓
Clinical Assessment
```

For pregnancy MVP, record only the **minimum fields required for the validated workflow**.

For example, the schema can accommodate:

```text
Blood pressure
Weight
Symptoms
Danger signs
Clinical notes
```

I would **not hard-code clinical thresholds from our own assumptions**. Those rules should be reviewed/approved by your medical/clinical advisor before deployment.

The hackathon asks for responsible AI and simple explanation of recommendations. 

---

# 7. FEATURE 5 — SIGNAL ENGINE

This is where MamaLink becomes different from a normal health-record app.

We have two types of signals.

## A. Clinical signal

Comes from clinical assessment.

Example:

```text
Assessment
    ↓
Rule Engine
    ↓
Clinical Signal

HIGH_BLOOD_PRESSURE_SIGNAL
```

## B. Care signal

Comes from the care journey.

Example:

```text
Appointment
   ↓
Missed
   ↓
CARE_SIGNAL:
APPOINTMENT_OVERDUE
```

Or:

```text
Referral
   ↓
Not completed
   ↓
CARE_SIGNAL:
REFERRAL_PENDING
```

The concept note explicitly identifies missed visits, danger signs, pregnancy history, poor feeding, weak growth and household vulnerability as useful information for identifying who needs attention. 

---

# 8. FEATURE 6 — CARE RADAR

This is **the hero feature**.

The system collects:

```text
Clinical Signals
        +
Care Signals
        +
Appointment Status
        +
Referral Status
```

Then:

```text
Priority Engine
       ↓
Rank cases
       ↓
Care Radar
```

Example:

```text
━━━━━━━━━━━━━━━━━━━━
      CARE RADAR
━━━━━━━━━━━━━━━━━━━━

🔴 ACT NOW

Mary A.
3 signals

• Appointment overdue
• Previous clinical risk signal
• Referral pending


🟠 FOLLOW UP

Amina B.
2 signals

• Missed appointment
• Follow-up due


🟡 DUE TODAY

Fatima C.

• Scheduled visit today


🟢 ON TRACK

12 households
```

This is the screen I would spend the most design effort on.

---

# 9. HOW PRIORITY WORKS

Don't make this:

```text
AI Score = 87
```

with no explanation.

Instead:

```text
Priority
   ↓
Reasons
```

For example:

```text
HIGH PRIORITY

Reasons:

1. Appointment overdue
2. Previous clinical signal
3. Referral pending
```

The workshop specifically says the AI role should show the top reasons behind the score and remain under the health worker's decision. 

---

# 10. FEATURE 7 — DELIVERY CONTINUITY

When delivery is recorded:

```text
Pregnancy Episode
        ↓
Delivery Event
        ↓
       ┌┴────────────┐
       ↓             ↓
Mother PNC       Newborn
Episode          Episode
```

So we don't lose the care history.

### Mother

```text
Pregnancy
    ↓
Delivery
    ↓
Postnatal
```

### Baby

```text
Birth
 ↓
Newborn Episode
```

For the MVP, **don't build the entire under-5 journey**.

We prove continuity through:

> Pregnancy → Delivery → Mother + Newborn.

---

# 11. FEATURE 8 — AI

This is where we need discipline.

## AI does NOT:

* diagnose
* automatically prescribe
* override the midwife
* automatically make a referral

## AI DOES:

* summarize the case
* explain priority signals
* generate a recommendation for worker review
* generate caregiver education

Architecture:

```text
Structured Data
       ↓
Rules
       ↓
Signals
       ↓
Priority
       ↓
LLM
       ↓
Explanation
+
Recommendation
       ↓
Health Worker
```

Then:

```text
ACCEPT
REJECT
MODIFY
```

The concept note explicitly says solutions should support rather than replace healthcare professionals. 

---

# 12. FEATURE 9 — KHAYA VOICE

After the worker reviews caregiver guidance:

```text
AI
 ↓
Caregiver Guidance
 ↓
Khaya AI
 ↓
Translation
 ↓
Text-to-Speech
 ↓
Caregiver listens
```

This directly aligns with the voice-first challenge area. 

**Khaya should be a communication service, not the clinical decision engine.**

---

# 13. FEATURE 10 — OFFLINE

React Native:

```text
              React Native
                   │
             Local SQLite
                   │
           ┌───────┴───────┐
           │               │
        OFFLINE          ONLINE
           │               │
           │            Supabase
           │               │
           └──── Sync ─────┘
```

Offline operations:

* register household
* register mother
* create episode
* schedule appointment
* record visit
* record assessment
* calculate local signals
* view Care Radar

When connection returns:

```text
Local Changes
      ↓
Sync Queue
      ↓
Supabase
```

Offline-first is not optional—the workshop explicitly treats low connectivity as a design constraint. 

---

# 14. FINAL ENGINEERING FLOW

This is the flow your developers should follow.

```text
                    LOGIN
                      │
                      ▼
                 DASHBOARD
                      │
              ┌───────┴───────┐
              ▼               ▼
         CARE RADAR       HOUSEHOLDS
              │               │
              │               ▼
              │            PERSON
              │               │
              │               ▼
              │          CARE EPISODE
              │               │
              │        ┌──────┴──────┐
              │        ▼             ▼
              │   APPOINTMENT     REFERRAL
              │        │
              │        ▼
              │       VISIT
              │        │
              │        ▼
              │    ASSESSMENT
              │        │
              │        ▼
              │      RULES
              │        │
              │        ▼
              │     SIGNALS
              │        │
              └────────┬┘
                       ▼
                 PRIORITY ENGINE
                       │
                       ▼
                  CARE RADAR
                       │
                       ▼
                  AI REVIEW
                       │
              ┌────────┴────────┐
              ▼                 ▼
          Health Worker     Caregiver
                              │
                              ▼
                           KHAYA
```

---

# 15. FINAL DATA MODEL

Now let's turn that into the actual database.

I recommend **Supabase/PostgreSQL** for the backend.

## Core tables

```text
locations
households
persons
person_relationships

care_episodes
appointments
visits

clinical_assessments
pregnancy_assessments
postnatal_assessments
newborn_assessments

delivery_events
referrals

clinical_signals
care_signals
care_priorities
care_priority_reasons

ai_recommendations
caregiver_guidance
```

That's the complete logical model.

---

# 16. SQL SCHEMA

Below is the schema I'd use as our **MVP baseline**.

```sql
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
-- 2. LOCATIONS
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
```

---

# 17. One important correction: don't put the AI rules in SQL yet

I **would not create a giant `ai_rules` table yet**.

For a three-week MVP:

```text
Clinical Data
     ↓
Rule Engine
```

can initially live in the backend as version-controlled code.

For example conceptually:

```ts
evaluatePregnancySignals(assessment)
evaluateAppointmentSignals(appointment)
evaluateReferralSignals(referral)
calculatePriority(signals)
```

The clinical thresholds and decision rules must be validated by your clinical advisor before being used in a real deployment.

This keeps the engineering manageable.

---

# 18. How one woman travels through this database

This is the most important part for your developers.

### Registration

```text
regions
   ↓
districts
   ↓
communities
   ↓
households
   ↓
persons
```

Then:

```text
persons
   ↓
care_episodes

episode_type = PREGNANCY
status = ACTIVE
```

---

### First visit

```text
care_episode
     ↓
appointment
     ↓
visit
     ↓
clinical_assessment
     ↓
pregnancy_assessment
```

---

### Risk detected

```text
pregnancy_assessment
        ↓
Rule Engine
        ↓
clinical_signal
```

---

### Midwife schedules next visit

```text
visit
  ↓
appointment
scheduled_date = chosen by midwife
```

---

### Woman doesn't show

```text
appointment
status = MISSED

       ↓

care_signal
APPOINTMENT_OVERDUE
```

---

### Care Radar

```text
clinical_signals
        +
care_signals
        +
referrals
        ↓
priority engine
        ↓
care_priorities
        ↓
care_priority_reasons
```

---

### AI

```text
care_priority
      ↓
LLM
      ↓
ai_recommendation
      ↓
health worker review
```

---

### Delivery

```text
pregnancy_episode
       ↓
delivery_event
       ↓
       ├──────────────┐
       ↓              ↓
postnatal_episode  newborn_episode
```

That's the complete loop.

---

# 19. What the React Native screens become

Now the database maps cleanly into the UI.

```text
1. Login
      ↓
2. Care Radar
      ↓
3. Households
      ↓
4. Household Details
      ↓
5. Person Details
      ↓
6. Care Journey
      ↓
7. Appointment
      ↓
8. Visit / Assessment
      ↓
9. Signals
      ↓
10. Priority Explanation
      ↓
11. AI Recommendation
      ↓
12. Caregiver Voice
```

You don't need 50 screens.

---

# 20. The actual MVP demo

If I were your lead engineer, I'd make the team build this **one vertical slice first**:

```text
Mary registered
      ↓
Pregnancy episode
      ↓
Visit recorded
      ↓
Next appointment scheduled
      ↓
Appointment missed
      ↓
Care signal generated
      ↓
Previous clinical signal exists
      ↓
Care Radar moves Mary to HIGH
      ↓
Worker taps "Why?"
      ↓
Reasons displayed
      ↓
AI generates explanation
      ↓
Worker reviews
      ↓
Caregiver guidance generated
      ↓
Khaya converts to local-language voice
```

Then:

```text
Mary delivers
      ↓
Pregnancy closes
      ↓
Mother PNC created
      ↓
Newborn created
      ↓
Newborn episode created
```

**If that entire flow works offline, syncs when connectivity returns, and is polished, you have a serious hackathon MVP.**

The concept note says the aim is not to replace professionals but to equip them to **detect risks early, prioritize households, support referrals and improve follow-up**.  Your database and MVP should therefore be judged by whether this loop works—not by how many tables or AI features we can add.

### The engineering principle I want the whole team to follow

> **Store facts. Derive signals. Rank care. Explain the ranking. Let the health worker decide.**

That should be the backbone of MamaLink.
