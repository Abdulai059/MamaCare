---

Instead of this:

```
Patient
    ↓
Form
    ↓
Database
    ↓
AI
```

We build this:

```
Patient
     │
     ▼
Care Journey
     │
     ▼
Expected Timeline
     │
     ▼
Care Coordination Engine
     │
     ▼
AI Copilot
     │
     ▼
CHPS Worker
```

Everything starts with **the care journey**.

---

# Layer 1 — Community Registry

This layer answers:

> **Who are we responsible for?**
> 

```
Community

↓

Household

↓

Family

↓

Mother

↓

Child
```

Nothing intelligent happens here.

This is simply the source of truth.

---

# Layer 2 — Care Journey Engine ⭐

This is the heart of MamaLink.

Every registered pregnancy automatically creates a care journey.

Example

```
Pregnancy Registered

↓

Week 12 ANC

↓

Week 20 ANC

↓

Week 26 ANC

↓

Week 30 ANC

↓

Week 34 ANC

↓

Week 36 ANC

↓

Expected Delivery

↓

PNC Day 1

↓

PNC Day 7

↓

PNC Week 6

↓

Child Birth Registration

↓

BCG

↓

OPV

↓

Growth Monitoring
```

Nobody manually creates these tasks.

The engine does.

---

## What does the Care Journey Engine produce?

Not AI.

It produces **Expected Milestones**.

Example

| Milestone | Due Date | Status |
| --- | --- | --- |
| ANC Visit 1 | Aug 15 | Pending |
| ANC Visit 2 | Sep 12 | Pending |
| Delivery | Dec 5 | Pending |

This becomes the patient's roadmap.

---

# Layer 3 — Event Engine

Reality happens.

Every action becomes an event.

Examples

```
ANC Completed

↓

Referral Created

↓

Delivery Recorded

↓

Immunization Completed
```

Notice

Reality updates the journey.

---

# Layer 4 — Care Coordination Engine ⭐⭐⭐⭐⭐

Now comes the intelligence.

Every morning

It compares

```
Expected Timeline

VS

Actual Events
```

Example

```
Expected ANC

↓

Missing

↓

Overdue 10 Days

↓

Increase Priority
```

No AI prompt needed.

Pure logic.

---

Example 2

```
Referral

↓

Expected Completion

↓

14 Days

↓

No Event

↓

Escalate
```

---

Example 3

```
Delivery Expected

↓

EDD Passed

↓

No Delivery Recorded

↓

Flag Immediate Follow-up
```

---

This is predictive care.

---

# Layer 5 — Clinical Intelligence Engine

This is where ChatGPT or Claude comes in.

It only activates after a clinical assessment.

Input

```
Symptoms

Vitals

History

Gestational Age

Clinical Findings
```

↓

Clinical Rules

↓

LLM

↓

Recommendation

↓

Explanation

↓

Care Plan

Important:

The LLM does **not** decide who to visit.

The Care Coordination Engine does.

---

# Layer 6 — Khaya AI Communication

Now we help the caregiver.

```
Recommendation

↓

Translate

↓

Dagbani

↓

Generate Speech

↓

Play Audio
```

This solves the literacy problem.

---

# Layer 7 — Community Intelligence

Now we zoom out.

Instead of looking at one patient...

We look at the whole CHPS zone.

AI asks

```
Which communities

Have

More missed ANC?
```

or

```
Which barrier

Appears most?
```

Example

```
Community A

↓

Transport

↓

52%
```

Supervisor now knows where outreach is needed.

---

# The Complete Architecture

```
                    MamaLink AI Care Platform
────────────────────────────────────────────────────────────

Community Registry
        │
        ▼
Care Journey Engine
(Create expected milestones)
        │
        ▼
Event Engine
(Real-world events)
        │
        ▼
Care Coordination Engine
(Expected vs Actual)
        │
        ├───────────────┐
        ▼               ▼
Priority Queue     Community Insights
        │
        ▼
CHPS Worker Dashboard
        │
        ▼
Clinical Assessment
        │
        ▼
Clinical Intelligence Engine
(Rules + LLM)
        │
        ▼
Care Recommendation
        │
        ▼
Khaya AI
(Translation + TTS)
        │
        ▼
Caregiver
```

---

# Now Let's Design the Timeline Properly

This is the part that will drive our database.

## Stage 1 — Pregnancy Registered

System creates

```
Pregnancy

↓

Expected ANC Schedule

↓

Expected Delivery

↓

Expected PNC
```

---

## Stage 2 — ANC

Every completed ANC

Updates

```
Timeline

↓

Risk

↓

Next Expected Visit
```

---

## Stage 3 — Delivery

Delivery automatically creates

```
Child

↓

Immunization Timeline

↓

Growth Timeline

↓

Nutrition Timeline

↓

Development Timeline
```

No manual setup.

---

# Every Timeline Item Should Have the Same Structure

Instead of creating separate logic for ANC, PNC, vaccines, etc., I recommend a generic **Care Milestone** model.

Each milestone contains:

| Field | Example |
| --- | --- |
| Milestone ID | CM-001 |
| Episode | Pregnancy |
| Type | ANC Visit |
| Sequence | ANC 2 |
| Expected Date | 2026-09-15 |
| Status | Pending / Completed / Overdue / Missed |
| Actual Date | 2026-09-17 |
| Assigned CHPS Worker | Sarah |
| Priority | Low / Medium / High |
| Trigger | Gestational Age, Birth Date, Referral, etc. |

Now the engine doesn't care whether it's ANC, immunization, or postnatal care—it processes all milestones the same way.

---

# The Predictive Care Engine (The "Secret Sauce")

This is the innovation I think we should highlight in the PRD and demo.

```
             CARE MILESTONES
                    │
                    ▼
         Daily Monitoring Scheduler
                    │
                    ▼
     Compare Expected vs Actual Status
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
  On Time       Overdue       Missed
      │             │             │
      ▼             ▼             ▼
   Complete   Raise Priority   Create Follow-up
                    │
                    ▼
      Apply Clinical & Care Rules
                    │
                    ▼
      Update Today's Priority Queue
                    │
                    ▼
          Notify CHPS Worker
```

Notice something important:

The engine **doesn't predict diseases out of thin air**. It predicts **care risks** by detecting deviations from the expected care journey.

That is explainable, practical, and exactly aligned with the hackathon's emphasis on **predicting risk before crisis**, **last-mile follow-up**, and **supporting—not replacing—health workers**.

---

## 🚀 Before We Touch the Database

I think we should spend one more session defining the **Care Journey Templates**.

For example:

- Pregnancy Care Journey (registration → ANC → delivery → PNC)
- Newborn Care Journey (birth → immunizations → growth)
- Child Care Journey (growth, nutrition, development)

Each template defines **what milestones should exist and when**. The Care Journey Engine simply instantiates the appropriate template for each patient.

Once those templates are finalized, designing the ERD and Supabase schema will be straightforward because every table will support a well-defined clinical workflow rather than a collection of disconnected forms. I believe this is the strongest engineering foundation for the MVP.