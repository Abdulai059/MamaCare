 Model it around the **real care process** and then let the Care Radar derive priorities from that data.

The core data model should be:

```text
LOCATION
   ↓
HOUSEHOLD
   ↓
PERSON
   ↓
CARE EPISODE
   ↓
APPOINTMENT
   ↓
VISIT
   ↓
ASSESSMENT
   ↓
CLINICAL SIGNALS
   ↓
CARE PRIORITY
   ↓
AI RECOMMENDATION
```

And after delivery:

```text
                    PREGNANCY EPISODE
                           │
                        DELIVERY
                       /        \
                      ↓          ↓
             MOTHER PNC      NEWBORN
                EPISODE       EPISODE
```

That's the model I would build.

---

# 1. Start with the real-world entities

Don't start with `ANC`.

Start with:

### Person

A person can be:

* Mother
* Child
* Caregiver
* CHPS worker
* Supervisor
* Admin

```text
persons
---------
id
first_name
last_name
date_of_birth
gender
phone
preferred_language
role
household_id
```

The important thing is that **mother and newborn are both persons**.

---

# 2. Household

A CHPS worker is working with households/community members, so:

```text
households
-----------
id
household_code
community_id
location
created_at
```

Then:

```text
Household
   │
   ├── Mother
   ├── Caregiver
   └── Child
```

Don't build a complicated "family tree."

For the MVP, the household relationship is enough.

---

# 3. Person relationships

We do need **one small relationship table**.

Because after delivery we need to say:

> This baby belongs to this mother.

So:

```text
person_relationships
--------------------
id
person_id
related_person_id
relationship_type
created_at
```

Example:

```text
Mary
  │
  └── MOTHER_OF
          │
          ↓
        Baby
```

Possible relationships:

```text
MOTHER_OF
CAREGIVER_OF
```

Don't build grandparents, cousins, uncles, etc. yet.

---

# 4. Care Episode — the heart of MamaLink

This is probably the **most important table**.

```text
care_episodes
-------------
id
person_id
episode_type
status
start_date
expected_end_date
actual_end_date
created_at
```

Episode types:

```text
PREGNANCY
POSTNATAL
NEWBORN
```

Example:

```text
Mary
 │
 └── Pregnancy Episode
       status = ACTIVE
```

After delivery:

```text
Mary
 ├── Pregnancy Episode → COMPLETED
 │
 └── Postnatal Episode → ACTIVE
```

Baby:

```text
Baby
 └── Newborn Episode → ACTIVE
```

---

# 5. Delivery should be an EVENT

This is important.

Don't make delivery just another appointment.

It's a **transition event**.

```text
delivery_events
---------------
id
pregnancy_episode_id
delivery_date
delivery_location
delivery_mode
complications
mother_outcome
created_by
created_at
```

When delivery is recorded:

```text
Pregnancy
    ↓
Delivery Event
    ↓
Close Pregnancy Episode
    ↓
Create Postnatal Episode
    ↓
Create Newborn Person
    ↓
Create Newborn Episode
```

That is a very clean architecture.

---

# 6. Appointment

This is where we incorporate the feedback from the midwife.

**MamaLink does not dictate the next appointment date.**

The health worker schedules it.

```text
appointments
------------
id
episode_id
appointment_type
scheduled_date
scheduled_by
status
reason
created_at
completed_at
```

Statuses:

```text
SCHEDULED
COMPLETED
MISSED
CANCELLED
```

Example:

```text
Mary Pregnancy Episode

        ↓

Appointment

scheduled_date:
2026-08-15

scheduled_by:
Midwife

status:
SCHEDULED
```

---

# 7. Visit

An appointment and a visit are **not the same thing**.

This distinction is extremely important.

An appointment means:

> "Come on this date."

A visit means:

> "The woman actually received care."

So:

```text
appointments
     │
     │ 1
     ▼
   visit
```

Table:

```text
visits
------
id
appointment_id
episode_id
person_id
performed_by
visit_date
visit_type
notes
created_at
```

Example:

```text
Appointment
Aug 15

       ↓

Visit
Aug 15
Completed by Midwife
```

If Mary doesn't come:

```text
Appointment
Aug 15

       ↓

No Visit

       ↓

MISSED
```

This distinction is what allows the Care Radar to detect people falling through the cracks.

---

# 8. Clinical Assessment

Don't put every clinical field inside `visits`.

Keep the assessment separate.

```text
clinical_assessments
--------------------
id
visit_id
assessment_type
created_by
created_at
```

Then specific assessment data can be attached.

For the MVP, you can have:

```text
pregnancy_assessments
---------------------
id
clinical_assessment_id
systolic_bp
diastolic_bp
weight
temperature
pulse
fundal_height
fetal_heart_rate
symptoms
danger_signs
notes
```

And:

```text
newborn_assessments
-------------------
id
clinical_assessment_id
weight
temperature
feeding_status
breathing_status
jaundice
cord_status
danger_signs
notes
```

And:

```text
postnatal_assessments
---------------------
id
clinical_assessment_id
systolic_bp
diastolic_bp
temperature
bleeding
breastfeeding
pain
danger_signs
notes
```

This gives us a clean structure without putting 50 columns into one table.

---

# 9. Clinical Signals

This is where the system starts becoming intelligent.

Suppose the nurse records:

```text
BP = 160/100
```

The rules engine may produce:

```text
clinical_signals

signal:
ELEVATED_BLOOD_PRESSURE

severity:
HIGH

source:
RULE_ENGINE
```

Table:

```text
clinical_signals
----------------
id
assessment_id
signal_type
severity
description
source
created_at
```

Important:

**A signal is not necessarily a diagnosis.**

It's a piece of evidence the system wants the health worker to notice.

---

# 10. Care Signals

We also need non-clinical signals.

For example:

```text
Appointment overdue
Referral not completed
No recent contact
Recently delivered
High-risk follow-up due
```

These are different from clinical signals.

So:

```text
care_signals
-----------
id
episode_id
appointment_id
signal_type
severity
description
created_at
```

Example:

```text
signal_type:
APPOINTMENT_OVERDUE

severity:
HIGH

days_overdue:
6
```

Now MamaLink has two types of intelligence:

```text
Clinical Signals
       +
Care Signals
       ↓
Priority Engine
```

That's powerful.

---

# 11. Care Priority

Don't store a mysterious:

```text
ai_score = 87
```

Instead, create an explainable priority record.

```text
care_priorities
---------------
id
episode_id
priority_level
priority_score
reason_summary
generated_at
status
```

Example:

```text
Mary

Priority:
HIGH

Reasons:

• Appointment overdue
• Previous high-risk signal
• Referral incomplete
```

The score can be internal, but the **reasons must be visible**.

---

# 12. AI Recommendation

Then AI sits on top of the structured information.

```text
ai_recommendations
------------------
id
episode_id
assessment_id
priority_id
recommendation
explanation
model
status
reviewed_by
reviewed_at
created_at
```

Status:

```text
PENDING_REVIEW
ACCEPTED
REJECTED
```

This gives us our human-in-the-loop architecture.

```text
AI recommendation

        ↓

Health worker reviews

        ↓

Accept / Reject / Modify
```

AI never silently makes the clinical decision.

---

# 13. Caregiver Guidance

This should be separate from the clinical recommendation.

Why?

Because this:

> "Consider reviewing the patient's previous assessment."

is for the **health worker**.

While:

> "Please return to the health facility if you experience..."

is for the **caregiver**.

So:

```text
caregiver_guidance
------------------
id
episode_id
source_recommendation_id
language
text
audio_url
created_at
```

Then:

```text
AI
 ↓
Caregiver guidance
 ↓
Khaya AI
 ↓
Local language
 ↓
Voice
```

---

# 14. Referral

I would definitely include a small referral model because it fits the **last-mile follow-up** problem.

```text
referrals
---------
id
episode_id
person_id
referred_by
referred_to
reason
referral_date
status
completed_date
notes
```

Status:

```text
PENDING
COMPLETED
CANCELLED
```

Then the Care Radar can detect:

```text
Referral = PENDING
+
too much time has passed

↓

CARE SIGNAL

"Referral follow-up required"
```

This is much more interesting than simply tracking appointments.

---

# 15. The complete model

Now put everything together:

```text
COMMUNITY
    │
    ▼
HOUSEHOLD
    │
    ▼
PERSON
    │
    ├───────────────┐
    │               │
    ▼               ▼
RELATIONSHIP     CARE EPISODE
                    │
        ┌───────────┼────────────┐
        │           │            │
        ▼           ▼            ▼
   APPOINTMENT    REFERRAL    DELIVERY
        │                         │
        ▼                         ├────→ POSTNATAL EPISODE
      VISIT                       │
        │                         └────→ NEWBORN EPISODE
        ▼
   ASSESSMENT
        │
        ▼
 CLINICAL SIGNAL
        │
        └──────────────┐
                       │
CARE SIGNAL ───────────┤
                       ▼
                PRIORITY ENGINE
                       │
                       ▼
                 CARE PRIORITY
                       │
                       ▼
                AI RECOMMENDATION
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       HEALTH WORKER       CAREGIVER GUIDANCE
                                  │
                                  ▼
                              KHAYA AI
```

---

# 16. The really important relationship

This is the one I want you to understand before writing SQL.

### We are NOT doing:

```text
Mother
 ↓
ANC1
 ↓
ANC2
 ↓
ANC3
```

We are doing:

```text
Mother
 ↓
Pregnancy Episode
 ↓
Appointment
 ↓
Visit
 ↓
Assessment
 ↓
Signals
 ↓
Priority
 ↓
Next Appointment
```

Then the loop continues.

That means the system can adapt to the actual midwife workflow.

---

# 17. How Care Radar gets its data

The Care Radar shouldn't have its own giant table containing everything.

It **derives** its view from the underlying data.

For example:

```text
Appointment:
OVERDUE

+

Clinical Signal:
HIGH

+

Referral:
PENDING

        ↓

Care Priority:
HIGH
```

So when the worker opens:

## Care Radar

MamaLink can calculate:

```text
🔴 Mary
3 signals

🟠 Amina
2 signals

🟡 Sarah
1 signal
```

This is much more maintainable than manually storing everything in one dashboard table.

---

# 18. One thing I would change from our earlier SQL

Earlier we had:

```text
care_plan_milestones
```

I would **not make that the center of the system anymore**.

We can still have a milestone concept, but the operational object should be:

> **Appointment**

Because your domain expert told us that midwives schedule the next visit based on the woman's situation.

So the model becomes:

```text
Care Episode
     ↓
Appointment
     ↓
Visit
     ↓
Next Appointment
```

A **milestone** can represent a clinically meaningful expected point in the journey, but it shouldn't force the actual appointment date.

For example:

```text
Milestone:
Postnatal follow-up

Expected window:
early postpartum period

Actual appointment:
chosen by midwife
```

That distinction will save us a lot of trouble later.

---

# 19. MVP database

For the three-week hackathon, I would start with these **15 core tables**, but implement them in phases:

### Foundation

```text
communities
households
persons
person_relationships
```

### Care

```text
care_episodes
appointments
visits
```

### Clinical

```text
clinical_assessments
pregnancy_assessments
postnatal_assessments
newborn_assessments
```

### Intelligence

```text
clinical_signals
care_signals
care_priorities
ai_recommendations
```

### Coordination

```text
referrals
caregiver_guidance
delivery_events
```

That's actually **18**, but don't let that scare you. Many are small, focused tables.

---

# 20. The build order I recommend

Don't create all of them and then start coding.

### Phase 1

```text
communities
households
persons
person_relationships
```

Get registration working.

### Phase 2

```text
care_episodes
appointments
visits
```

Get the care journey working.

### Phase 3

```text
clinical_assessments
pregnancy_assessments
```

Get one pregnancy workflow working.

### Phase 4

```text
clinical_signals
care_signals
care_priorities
```

Build the **Care Radar**.

### Phase 5

```text
ai_recommendations
caregiver_guidance
```

Add AI.

### Phase 6

```text
delivery_events
postnatal_assessments
newborn_assessments
referrals
```

Add continuity of care.

---

## 🔥 The key architectural idea

If you remember only one thing, remember this:

> **MamaLink's database should record what happened in the patient's care journey. The Care Radar should interpret that history to determine who needs attention next.**

That gives us a clean separation:

**Database = truth**

**Rules = signals**

**Priority engine = prioritization**

**LLM = explanation/recommendation**

**Health worker = decision**

**Khaya = communication**

**Sync engine = offline/online continuity**

That is the data architecture I would take forward. And **before we write the final SQL**, I'd next turn this model into an ER diagram and define the exact columns, foreign keys, enums, indexes, and offline-sync fields—because those decisions will affect almost everything we build in React Native.
