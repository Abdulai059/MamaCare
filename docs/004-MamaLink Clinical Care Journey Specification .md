---

## Purpose

The Clinical Care Journey Specification defines the standardized care pathways that MamaLink manages for every registered mother and child.

Rather than treating healthcare as isolated visits, MamaLink models healthcare as a **continuous journey** composed of expected milestones, completed events, risk assessments, follow-up actions, and AI-assisted decision support.

This specification serves as the foundation for:

- Care Journey Engine
- Care Coordination Engine
- Clinical Intelligence Engine
- React Native workflows
- Backend services
- Database schema

---

# Clinical Journey Lifecycle

Every care journey follows the same lifecycle.

```
Journey Created
        │
        ▼
Expected Milestones Generated
        │
        ▼
Milestone Due
        │
        ▼
Completed?
   │             │
 YES            NO
 │              │
 ▼              ▼
Next         Overdue
Milestone       │
                ▼
      Care Coordination Engine
                │
                ▼
         Priority Updated
                │
                ▼
      CHPS Worker Intervention
                │
                ▼
          Journey Continues
```

This lifecycle is universal.

Whether it is:

- Pregnancy
- Child
- Nutrition
- Referral

the system behaves exactly the same.

---

# Standard Journey Structure

Every journey must define these components.

| Field | Description |
| --- | --- |
| Journey Name | Name of the clinical journey |
| Trigger Event | Event that starts the journey |
| Target Person | Mother, Child, Household |
| Objectives | Desired healthcare outcomes |
| Expected Milestones | Planned care activities |
| Clinical Rules | Rule-based validation and alerts |
| AI Triggers | When the AI should run |
| Completion Criteria | When the journey ends |
| Next Journey | Which journey starts next |

This standard makes every journey consistent.

---

# Journey 1 — Pregnancy Care Journey ⭐

## Objective

Provide continuous antenatal care from pregnancy registration through safe delivery and transition into postnatal care.

---

## Trigger Event

```
Pregnancy Registered
```

---

## Target

Pregnant Woman

---

## Objectives

- Detect pregnancy risks early.
- Ensure ANC attendance.
- Improve birth preparedness.
- Reduce missed follow-up.
- Enable timely referral.
- Prepare for safe delivery.

---

## Generated Milestones

| Order | Milestone | Trigger |
| --- | --- | --- |
| 1 | Initial Assessment | Registration |
| 2 | ANC Visit 1 | Gestational Age |
| 3 | ANC Visit 2 | Timeline |
| 4 | ANC Visit 3 | Timeline |
| 5 | ANC Visit 4 | Timeline |
| 6 | ANC Visit 5+ | Timeline |
| 7 | Birth Preparedness Review | Third Trimester |
| 8 | Expected Delivery Window | EDD |
| 9 | Delivery | Birth Recorded |
| 10 | Postnatal Day 1 | Delivery |
| 11 | Postnatal Day 7 | Delivery |
| 12 | Postnatal Week 6 | Delivery |

---

# Each Milestone Has Four Parts

Example

## ANC Visit

### Clinical Data

Collect:

- Blood Pressure
- Weight
- Temperature
- Fetal Heart Rate
- Fundal Height
- Symptoms
- Danger Signs
- Medications
- Laboratory Results (where available)

---

### Care Coordination Data

Collect:

- Visit completed?
- Next visit date
- Referral required?
- Missed appointment?
- Barrier identified?

---

### AI Trigger

When visit completes:

```
Assessment

↓

Clinical Rules

↓

Risk Score

↓

LLM Recommendation

↓

Caregiver Education

↓

Khaya Translation

↓

Voice Message
```

---

### Completion Event

```
ANC Visit Completed
```

---

# Clinical Rules

The Clinical Rules Engine evaluates structured clinical data before the LLM is used.

Examples:

| Rule | Action |
| --- | --- |
| BP above threshold | High-risk pregnancy |
| Vaginal bleeding | Immediate referral |
| Severe headache + swelling | Possible pre-eclampsia |
| Fever | Urgent assessment |
| Missed ANC | Increase follow-up priority |

The exact thresholds should come from Ghana Health Service/WHO guidelines rather than being invented by us. That keeps recommendations evidence-based.

---

# Care Coordination Rules

This is our innovation.

Examples:

| Condition | Action |
| --- | --- |
| ANC overdue | Create follow-up task |
| Two missed ANC visits | Escalate priority |
| Referral overdue | Home visit required |
| Delivery overdue beyond expected window | Immediate investigation |
| High-risk pregnancy | Daily priority list |

Notice...

These are **care rules**, not medical diagnosis.

---

# AI Responsibilities

The LLM should **not diagnose**.

It should support the worker by:

### Explain

Explain why the patient is high priority.

---

### Recommend

Suggest next steps based on clinical rules.

---

### Educate

Generate caregiver education.

---

### Summarize

Produce a short visit summary.

---

# Completion Criteria

The Pregnancy Journey completes when:

- Delivery has been recorded.
- Immediate postnatal care has been completed (through the defined PNC milestone for the MVP).

---

# Next Journey

```
Pregnancy Journey

↓

Newborn Journey
```

The transition happens automatically.

---

# AI Decision Flow

This is the most important page.

```
Pregnancy Registered
        │
        ▼
Generate Care Journey
        │
        ▼
Generate Milestones
        │
        ▼
Daily Scheduler Checks Timeline
        │
        ▼
Milestone Due?
        │
        ▼
Completed?
   │           │
 YES          NO
 │            │
 ▼            ▼
Next       Overdue
Milestone     │
              ▼
Care Coordination Engine
              │
              ▼
Priority Queue Updated
              │
              ▼
CHPS Worker Visits Mother
              │
              ▼
Clinical Assessment
              │
              ▼
Clinical Rules Engine
              │
              ▼
LLM Generates Explanation & Care Plan
              │
              ▼
Khaya AI Translation & Voice
              │
              ▼
Caregiver Education Delivered
```

---

# Engineering Notes (Important)

I want us to make one design decision now that will save us months later.

## Separate **Clinical Data** from **Care Coordination**

Instead of mixing everything into one ANC record, split responsibilities:

### Clinical Module

Owns:

- Blood pressure
- Weight
- Symptoms
- Diagnosis support
- Clinical findings

### Care Coordination Module

Owns:

- Due dates
- Milestones
- Follow-up tasks
- Referrals
- Priority queue
- Missed visits
- Barriers to care

Why?

Because they answer different questions:

- **Clinical Module:** *"What is the mother's health status today?"*
- **Care Coordination Module:** *"What needs to happen next, and who is at risk of being left behind?"*

This separation is what allows the **Care Coordination Engine** to monitor timelines continuously while the **Clinical Intelligence Engine** focuses on evidence-based decision support.

---

# 🚀 Before the ERD

I think the next document should be **Clinical Care Journey 2: Newborn & Child Care Journey**, following this exact template.