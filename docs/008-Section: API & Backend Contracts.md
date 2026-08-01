This document answers one question:

> **"How do all the pieces communicate?"**
> 

---

# MamaLink Backend Services

Instead of one backend, let's define clear service boundaries.

```
                 MamaLink Backend

 ┌───────────────────────────────────────────────┐
 │               API Gateway / BFF               │
 └───────────────────────────────────────────────┘
              │
 ┌────────────┼────────────────────────────────────────────┐
 │            │            │            │                  │
 ▼            ▼            ▼            ▼                  ▼
Registry   Journey      Clinical    Care Coord.      AI Service
Service    Service      Service      Service
 │            │            │            │                  │
 └────────────┴────────────┴────────────┴──────────────────┘
                     │
                Supabase
```

Each service has one responsibility.

---

# Service 1 — Registry Service

Purpose

Manage people and households.

Endpoints

```
POST   /households

POST   /persons

GET    /persons/{id}

GET    /households/{id}

PATCH  /persons/{id}
```

Notice

This service never knows anything about AI.

---

# Service 2 — Care Journey Service

Purpose

Generate care journeys automatically.

When this endpoint is called

```
POST /episodes
```

Request

```json
{
  "personId":"mother-001",
  "episodeType":"PREGNANCY",
  "estimatedDeliveryDate":"2026-12-18"
}
```

Response

```json
{
  "episodeId":"ep_001",
  "journeyGenerated":true,
  "milestonesCreated":12
}
```

Immediately after creation

The Journey Engine generates

- ANC milestones
- Delivery milestone
- PNC milestones

Automatically.

---

# Service 3 — Timeline Service ⭐

This is new.

It owns

Expected milestones.

Endpoints

```
GET /episodes/{id}/timeline

PATCH /milestones/{id}

GET /today
```

Example response

```json
[
 {
   "milestone":"ANC 1",
   "status":"Completed"
 },
 {
   "milestone":"ANC 2",
   "status":"Pending"
 }
]
```

---

# Service 4 — Clinical Service

Purpose

Save assessments.

```
POST /assessments
```

Example

```json
{
 "milestoneId":"ms_22",
 "bloodPressure":"150/100",
 "weight":72,
 "symptoms":[
   "Headache"
 ]
}
```

The endpoint

ONLY saves data.

Nothing else.

---

# What Happens Next?

Immediately

An event is published.

```
Assessment Completed
```

Then

Clinical Rules Engine starts.

---

# Clinical Rules Engine

Input

```
Assessment
```

↓

Output

```
Risk

Clinical Flags
```

Example

```json
{
 "risk":"HIGH",
 "reason":[
   "High BP",
   "Headache"
 ]
}
```

Notice

Still no LLM.

---

# AI Service

Now

Only now

The LLM is called.

Request

```json
{
 "risk":"HIGH",
 "gestationalAge":34,
 "findings":[
   "BP 150/100",
   "Headache"
 ]
}
```

Output

```json
{
 "summary":"Mother requires urgent review.",
 "recommendation":"Refer to higher-level facility.",
 "education":"Seek immediate medical attention if severe headache or visual changes occur."
}
```

This keeps AI explainable.

---

# Khaya AI Service

The AI recommendation now becomes communication.

Request

```json
{
 "language":"Dagbani",
 "text":"Refer to higher-level facility."
}
```

Khaya returns

```json
{
 "translatedText":"......",
 "audioUrl":"voice.mp3"
}
```

React Native simply plays the audio.

---

# Care Coordination Service ⭐⭐⭐⭐⭐

This is our innovation.

Every morning

The scheduler calls

```
POST /care-coordination/run
```

Workflow

```
Load all active milestones

↓

Expected Date Passed?

↓

Completed?

↓

No

↓

Mark Overdue

↓

Increase Priority

↓

Create Follow-up Task

↓

Assign CHPS Worker

↓

Update Dashboard
```

No AI required.

---

# Follow-up Service

Endpoints

```
GET /followups/today

POST /followups

PATCH /followups/{id}
```

Example

```json
{
 "priority":"HIGH",
 "reason":"ANC overdue",
 "assignedWorker":"worker_001"
}
```

---

# Dashboard Service

Instead of fetching everything

The app asks

```
GET /dashboard
```

Response

```json
{
 "today": {
   "highPriority":5,
   "mediumPriority":11,
   "lowPriority":18
 },
 "tasks":[
   ...
 ]
}
```

One API.

Fast.

---

# Community Health Radar Service

This powers supervisors.

```
GET /analytics/community
```

Returns

```json
{
 "community":"Lamashegu",
 "overdueANC":8,
 "missedImmunization":3,
 "topBarrier":"Transport"
}
```

Beautiful.

---

# Authentication

I think we should keep it simple for the MVP.

Users

```
CHPS Worker

Supervisor

Administrator
```

Login

↓

Supabase Auth

↓

JWT

↓

Every request carries

Authorization Token.

---

# Event Flow

This is the entire backend.

```
Pregnancy Registered

↓

Journey Service

↓

Generate Milestones

↓

Daily Scheduler

↓

Overdue?

↓

Follow-up Service

↓

Worker Visits

↓

Clinical Service

↓

Clinical Rules

↓

AI

↓

Khaya

↓

Voice Guidance
```

This is the story of MamaLink.

---

# Now Let's Think Like a React Native Developer

The frontend should never call 20 APIs.

Instead, every screen talks to a **Backend-for-Frontend (BFF)** layer that aggregates data.

Example:

```
Dashboard Screen

↓

GET /dashboard

↓

Returns

Today's tasks
Priority queue
Notifications
Journey summaries
```

The frontend remains simple while the backend orchestrates multiple services.

---

# I Want to Make One More Improvement Before We Write Code

Bro... after all our discussions, I think our architecture should explicitly separate **Commands** from **Queries**.

This is inspired by the CQRS (Command Query Responsibility Segregation) pattern, but we'll use a lightweight version suitable for a hackathon.

## Commands (They change data)

Examples:

```
POST /persons
POST /episodes
POST /assessments
POST /followups
PATCH /milestones/{id}
```

These create or update records and may trigger events.

## Queries (They only read data)

Examples:

```
GET /dashboard
GET /timeline/{episodeId}
GET /community-radar
GET /followups/today
GET /person/{id}
```

These never modify data.

### Why this matters

Imagine a nurse completes an ANC visit.

She sends **one command**:

```
POST /assessments
```

Behind the scenes the platform automatically:

1. Stores the assessment.
2. Runs the Clinical Rules Engine.
3. Updates the Care Timeline.
4. Recalculates care risk.
5. Generates an AI recommendation.
6. Creates follow-up tasks if needed.
7. Updates the dashboard.

The mobile app doesn't need to know any of this. It simply refreshes the dashboard with a query.

---

# 🚀 I think we're now ready for the final engineering blueprint before coding:

## **React Native Application Architecture**

We'll design:

- Folder structure.
- Navigation.
- Offline SQLite strategy.
- State management.
- Sync engine.
- Screen flow.
- Component hierarchy.
- API integration.
- AI integration.

Once that's complete, we'll be able to divide work among team members confidently:

- **Frontend Team** → React Native.
- **Backend Team** → Supabase + Edge Functions.
- **AI Team** → Clinical Rules + ChatGPT/Claude + Khaya AI.
- **Integration Team** → Sync, testing, and demo.

At that point, implementation becomes a matter of execution rather than figuring out what to build. I think that's exactly where we want to be before the hackathon starts.