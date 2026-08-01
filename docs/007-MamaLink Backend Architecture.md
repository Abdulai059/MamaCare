---

I don't want MamaLink to be a monolith.

Instead, think of it as several engines working together.

```
                    MamaLink Platform

                React Native App
                       │
───────────────────────┼────────────────────────
                       │
                API Gateway / BFF
                       │
───────────────────────┼────────────────────────
 │          │            │           │
 ▼          ▼            ▼           ▼
Registry  Journey     Clinical    Communication
Service   Service      Service       Service
 │          │            │           │
 └──────┬───┴────────────┴───────────┘
        ▼
 Care Coordination Engine
        │
        ▼
Clinical Intelligence Engine
(Rules + LLM)
        │
        ▼
Khaya AI Service
        │
        ▼
Supabase
```

Notice...

Everything is separated by responsibility.

---

# Service 1 — Registry Service

Owns only registration.

Responsible for:

- Communities
- Households
- Persons
- CHPS Workers

Nothing else.

It never calculates risk.

---

# Service 2 — Care Journey Service ⭐

This service is unique.

Its only job is

Generate journeys.

Example

```
Pregnancy Registered

↓

Generate Pregnancy Journey

↓

Generate Care Milestones

↓

Store Timeline
```

No AI.

No diagnosis.

Just planning.

---

# Service 3 — Clinical Service

Owns

- Assessments
- Vitals
- Symptoms
- Clinical Notes

Nothing else.

---

# Service 4 — Care Coordination Engine ⭐⭐⭐⭐⭐

This is MamaLink's brain.

Every morning

(or every sync)

It asks

```
Which milestones are overdue?

↓

Which referrals are pending?

↓

Which mothers disappeared?

↓

Which children missed immunization?
```

Then

Updates

Priority Queue.

---

# Service 5 — Clinical Intelligence Engine

This service starts only after an assessment.

Workflow

```
Assessment

↓

Clinical Rules

↓

Risk Level

↓

ChatGPT / Claude

↓

Recommendation

↓

Explanation
```

Remember

LLM never diagnoses.

It explains.

---

# Service 6 — Khaya AI Service

Input

```
Recommendation
```

↓

Translation

↓

Speech

↓

Audio

↓

Return URL

---

# Service 7 — Notification Service

Future

Responsible for

- SMS
- WhatsApp
- Voice Calls
- Push Notifications

For MVP

We'll only use

Voice.

---

# Why We Need Engines Instead of APIs

Here's the biggest mindset shift.

Most apps do this:

```
Button

↓

API

↓

Database
```

MamaLink should work like this:

```
Event

↓

Engine

↓

Decision

↓

Action
```

That is Event-Driven Architecture.

---

# The Daily Scheduler

This service runs every morning.

Example

```
06:00 AM

↓

Load Today's Milestones

↓

Check Overdue

↓

Update Priorities

↓

Generate CHPS Work Queue
```

Now Sarah opens the app.

She already knows

Who needs help today.

---

# CHPS Worker Dashboard

Instead of

Patients.

She sees

```
Today's Priority

🟥 Mary

Missed ANC

------------

🟧 Amina

Referral Pending

------------

🟨 Child Kofi

Growth Visit Due
```

She doesn't search.

The system guides her.

---

# Offline Sync Engine ⭐

This is critical for Ghana.

We should design it now.

```
React Native

↓

Local SQLite Database

↓

Offline Queue

↓

Network Available?

↓

YES

↓

Sync with Supabase

↓

Resolve Conflicts
```

Notice

Supabase is NOT the first database.

SQLite is.

This makes the app usable in villages with poor connectivity.

---

# Conflict Resolution

Suppose

Sarah visits Mary.

Meanwhile

Another nurse updates Mary.

How do we resolve it?

Simple MVP strategy:

```
Every record has

updated_at

updated_by

version
```

During sync:

- If versions match → update.
- If not → flag a conflict for review.

This is much simpler than trying to merge medical records automatically.

---

# AI Pipeline

Let's define it clearly.

```
Clinical Assessment

↓

Clinical Rules Engine

↓

Risk Level

↓

LLM

↓

Recommendation

↓

Khaya Translation

↓

Voice

↓

Caregiver
```

Notice

Rules always come before AI.

That's very important for explainability.

---

# Care Coordination Pipeline

This one is even more interesting.

```
Daily Scheduler

↓

Expected Milestones

↓

Compare with Actual Activities

↓

Missed?

↓

YES

↓

Priority Increased

↓

Create Follow-up

↓

Assign Worker

↓

Dashboard Updated
```

No LLM.

Pure business logic.

Fast.

Reliable.

---

# The Complete Backend Flow

```
Pregnancy Registered
        │
        ▼
Registry Service
        │
        ▼
Journey Service
        │
Generate Care Timeline
        │
        ▼
Daily Scheduler
        │
Compare Expected vs Actual
        │
        ▼
Care Coordination Engine
        │
Create Priority Queue
        │
        ▼
CHPS Worker Visits
        │
        ▼
Clinical Assessment Service
        │
        ▼
Clinical Rules Engine
        │
        ▼
LLM (ChatGPT / Claude)
        │
        ▼
Recommendation
        │
        ▼
Khaya AI
        │
        ▼
Local Language Voice
```

---

# 🏆 I think we have one more opportunity to make MamaLink stand out.

I propose introducing a component called the **Community Health Radar**.

This isn't another AI model. It's a visualization and analytics layer that continuously aggregates information from the Care Coordination Engine.

Instead of only showing **individual priorities**, it shows **community-level patterns**, such as:

- Communities with the highest percentage of overdue ANC milestones.
- Areas where referrals are frequently not completed.
- Commonly reported barriers (transport, cost, distance).
- Households with multiple active high-priority care episodes.

Imagine a CHPS supervisor opening the dashboard and immediately seeing:

```
Community Health Radar

🟥 Zogbeli
- 8 overdue ANC visits
- Transport is the top reported barrier

🟧 Lamashegu
- 5 overdue child immunizations

🟩 Vittin
- Care journeys mostly on track
```

This aligns directly with the hackathon themes of **detect earlier**, **prioritize better**, and **learn locally**, while also giving judges something visually compelling to remember.

---

## I recommend our next milestone be:

# **API & Backend Contracts**

Not just endpoint lists.

We'll define:

- Every service.
- Every API.
- Every request.
- Every response.
- Authentication.
- Supabase Edge Functions.
- Event flow between services.

Once that's done, we can start building React Native and Supabase with almost no guesswork. That's the same approach many production engineering teams use before implementation begins.