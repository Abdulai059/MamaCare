---

I honestly think this is the most important document we'll write before the database.

> **Care Journey Templates**
> 

Think of them as **blueprints**.

When a new pregnancy is registered, the system doesn't ask:

> "What should happen next?"
> 

Instead, it loads the **Pregnancy Care Journey Template**.

The template automatically generates all expected milestones.

---

# MamaLink Care Journey Templates

I think our MVP only needs **three templates**.

```
1. Pregnancy Journey
2. Newborn Journey
3. Child Journey (0–5 years)
```

That's enough to demonstrate continuity of care.

---

# Template 1 — Pregnancy Care Journey ⭐ (MVP Priority)

This is our hero template.

Everything begins here.

## Trigger

```
Pregnancy Registered
```

Immediately the system creates a **Care Episode**.

```
Pregnancy Episode

↓

Generate Care Journey

↓

Generate Milestones
```

---

# Pregnancy Journey

```
Pregnancy Registered
        │
        ▼
Initial Risk Assessment
        │
        ▼
ANC Visit 1
        │
        ▼
ANC Visit 2
        │
        ▼
ANC Visit 3
        │
        ▼
ANC Visit 4
        │
        ▼
ANC Visit 5+
        │
        ▼
Birth Preparedness Review
        │
        ▼
Expected Delivery Window
        │
        ▼
Delivery
        │
        ▼
PNC Day 1
        │
        ▼
PNC Day 7
        │
        ▼
PNC Week 6
```

---

# Every Milestone Has the Same Structure

Example

## ANC Visit

```
Milestone Type

ANC Visit

Expected Date

12 Aug

Window

±7 Days

Priority

Medium

Required

YES

Completion Event

ANC Visit Completed
```

---

# Birth Preparedness

This is often overlooked.

The system asks:

- Has transport been arranged?
- Has a delivery facility been chosen?
- Is emergency contact available?
- Does the caregiver know danger signs?

If not,

AI raises

Preparation Risk.

---

# Delivery Window

Instead of one date

Use

```
EDD

↓

Delivery Window

37–42 Weeks
```

If no delivery is recorded after the expected window:

```
Possible Missed Delivery

↓

Immediate Follow-up
```

Exactly what we discussed.

---

# Template 2 — Newborn Journey

Trigger

```
Delivery Recorded

↓

Automatically Create Child

↓

Generate Newborn Journey
```

---

Newborn Timeline

```
Birth
      │
      ▼
Birth Assessment
      │
      ▼
BCG
      │
      ▼
OPV
      │
      ▼
Postnatal Home Visit
      │
      ▼
Weight Check
      │
      ▼
Exclusive Breastfeeding Review
```

---

AI Watches

```
Birth

↓

No Weight Check

↓

Priority Increased
```

---

# Template 3 — Child Journey

Automatically starts after newborn care.

```
Birth
      │
      ▼
6 Weeks
      │
      ▼
10 Weeks
      │
      ▼
14 Weeks
      │
      ▼
6 Months
      │
      ▼
9 Months
      │
      ▼
12 Months
      │
      ▼
18 Months
      │
      ▼
24 Months
```

---

Each milestone may include

- Growth Monitoring
- Nutrition Assessment
- Immunization Check
- Development Check
- Caregiver Education

---

# Here's Where We Can Be Smart

Instead of separate schedules

Create

## Milestone Bundles

Example

At

6 Weeks

The nurse does

```
Growth

+

Nutrition

+

Vaccination

+

Development

+

Education
```

One visit.

Five outcomes.

---

# The Care Timeline Engine

Now let's define its job.

Input

```
Pregnancy Registered
```

↓

Output

```
20 Expected Milestones
```

Example

| Milestone | Status |
| --- | --- |
| ANC 1 | Pending |
| ANC 2 | Pending |
| ANC 3 | Pending |
| Delivery | Pending |
| PNC Day 1 | Pending |
| PNC Week 6 | Pending |

Nothing has happened yet.

---

# Then Reality Begins

Example

```
ANC 1

Completed
```

Timeline becomes

```
ANC 1

Completed

↓

ANC 2

Pending

↓

Delivery

Pending
```

---

Then

ANC 2

Never happens.

Timeline

```
ANC 2

Overdue

↓

Priority Increased
```

No AI prompt needed.

---

# This Is What the Scheduler Does

Every morning.

```
For every milestone

↓

Expected Date Passed?

↓

YES

↓

Completed?

↓

NO

↓

Mark Overdue

↓

Notify Care Coordination Engine
```

Beautiful.

---

# Then the AI Joins

Not immediately.

Only after

Overdue.

Example

```
ANC Overdue

↓

Rules

↓

Second Missed Visit?

↓

YES

↓

High Priority

↓

Generate Visit Recommendation

↓

Translate

↓

Voice
```

Now the AI is supporting decisions.

---

# Every Template Produces the Same Object

Instead of different logic

Everything becomes

```
Care Milestone
```

Example

```
Milestone

ID

Episode

Type

Expected Date

Status

Priority

Completion Event
```

ANC

is a milestone.

Delivery

is a milestone.

Immunization

is a milestone.

Growth Visit

is a milestone.

Now our database becomes incredibly simple.

---

# I Think We Need One More Template

This one wasn't in our original design.

## Community Outreach Journey ⭐⭐⭐⭐⭐

Remember the organizers:

> Last-mile follow-up.
> 

Suppose

Mary

Missed ANC twice.

System creates

```
Community Outreach Episode

↓

Home Visit Scheduled

↓

Home Visit Completed

↓

Barrier Recorded

↓

Education Delivered

↓

Follow-up Planned
```

This is no longer facility care.

This is community care.

Exactly what CHPS does.

---

# Final Care Journey Templates (MVP)

```
Template 1

Pregnancy Journey

↓

Creates

ANC

Delivery

PNC

--------------------------------

Template 2

Newborn Journey

↓

Creates

Birth Assessment

Early Home Visits

--------------------------------

Template 3

Child Journey

↓

Creates

Growth

Nutrition

Development

Immunization

--------------------------------

Template 4

Community Outreach Journey

↓

Creates

Home Visit

Barrier Assessment

Education

Follow-up
```

---

# 🏆 MamaLink's real innovation.

Most digital health systems create **forms**.

MamaLink creates **care journeys**.

Instead of storing isolated visits, it manages a living timeline of expected care, compares that timeline with real-world events, and proactively identifies people at risk of being left behind.

That gives us a clean architecture:

```
Community Registry
        │
        ▼
Care Episodes
        │
        ▼
Care Journey Templates
        │
        ▼
Care Milestones
        │
        ▼
Events (Completed, Missed, Overdue)
        │
        ▼
Care Coordination Engine
        │
        ▼
Clinical Intelligence (Rules + LLM)
        │
        ▼
Khaya AI Communication
```

## 💡 Before we design the ERD, there's one document I want us to create.

Not the database.

Not the API.

A **Clinical Care Journey Specification**.

For each template, we'll define:

| Field | Example |
| --- | --- |
| Journey Name | Pregnancy Journey |
| Trigger Event | Pregnancy Registered |
| Target Population | Pregnant Woman |
| Milestones | ANC, Delivery, PNC |
| Rules | Overdue after X days, escalate after Y missed visits |
| AI Triggers | Generate priority, explain risk, create follow-up |
| Completion Criteria | Mother discharged into Child Journey |

That specification becomes the source of truth for engineering, AI, and product. Once it's complete, designing the ERD, Supabase schema, backend services, and React Native screens will be straightforward because every component will implement the same care journey model. I genuinely think this is the strongest foundation we could build for the MVP and for a production-ready platform afterward.