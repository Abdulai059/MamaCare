---

## Design Philosophy

The mobile app should **not be a form-filling application**.

It should feel like an intelligent assistant for CHPS workers.

Every screen should answer one question:

> **"What should I do next?"**
> 

Not

> "What data should I enter?"
> 

That mindset alone will impress judges.

---

# High-Level Mobile Architecture

```
                    React Native App

──────────────────────────────────────────────

Presentation Layer (Screens)

↓

Application Layer (State & Business Logic)

↓

Offline Layer (SQLite)

↓

Sync Engine

↓

API Layer

↓

MamaLink Backend

↓

Supabase
```

Notice the order.

The app always works **offline first**.

Internet is optional.

---

# Folder Structure

I recommend a feature-based architecture instead of grouping files by type.

```
src/

├── app/
│   ├── navigation/
│   ├── providers/
│   └── theme/
│
├── features/
│
│   ├── auth/
│   ├── dashboard/
│   ├── households/
│   ├── pregnancy/
│   ├── child/
│   ├── followup/
│   ├── referrals/
│   ├── assessments/
│   ├── community/
│   ├── ai/
│   └── settings/
│
├── services/
│
│   ├── api/
│   ├── database/
│   ├── sync/
│   ├── khaya/
│   ├── ai/
│   └── notifications/
│
├── shared/
│
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── models/
│
└── assets/
```

This scales much better than having folders like `screens`, `components`, and `utils` all mixed together.

---

# Navigation Structure

The navigation should follow the CHPS worker's workflow.

```
Login

↓

Today's Dashboard

↓

Priority Queue

↓

Mother Profile

↓

Care Journey Timeline

↓

Assessment

↓

Recommendation

↓

Follow-up

↓

Back to Dashboard
```

Notice...

Everything starts from **Today's Dashboard**.

Not from searching for patients.

---

# Main Navigation

```
Bottom Navigation

🏠 Dashboard

👩 Mothers

👶 Children

📋 Tasks

👤 Profile
```

Very simple.

Hackathon judges hate complex navigation.

---

# Dashboard (The Hero Screen)

When Sarah logs in, she should immediately see:

```
Good Morning Sarah

Today's Priorities

🔴 High Risk Mothers (3)

🟠 Follow-up Visits (6)

🟡 Immunizations Due (5)

────────────────────────

Today's Route

1. Mary
2. Amina
3. Baby Yakubu
```

No searching.

The system guides her.

---

# Mother Profile

Instead of dozens of tabs:

```
Mother

↓

Current Pregnancy

↓

Journey Timeline

↓

Clinical History

↓

Referrals

↓

Follow-ups
```

Everything revolves around the journey.

---

# Care Journey Screen ⭐

I think this will become our best screen.

Imagine this.

```
Pregnancy Journey

✔ Registration

✔ ANC 1

✔ ANC 2

🟠 ANC 3 (Due Tomorrow)

⚪ ANC 4

⚪ Birth Preparedness

⚪ Delivery

⚪ Postnatal
```

Like a progress tracker.

Judges will instantly understand the concept.

---

# Assessment Screen

Instead of a long form...

Break it into cards.

```
Vitals

↓

Symptoms

↓

Danger Signs

↓

Clinical Notes

↓

Save Assessment
```

Short.

Fast.

Offline.

---

# After Save

The nurse should not press

"Generate AI."

Instead

```
Assessment Saved

↓

Clinical Rules Run

↓

AI Recommendation Appears

↓

Khaya Voice Ready
```

Feels magical.

---

# Follow-up Screen

Simple list.

```
Today's Tasks

🟥 Mary

Missed ANC

Visit Today

──────────────

🟧 Baby Yakubu

Growth Visit

Due Today

──────────────

🟨 Amina

Referral Follow-up
```

---

# Community Radar

Supervisor only.

```
Communities

🟥 Lamashegu

8 overdue ANC

────────────

🟧 Zogbeli

Transport barrier

────────────

🟩 Vittin

Healthy
```

Very visual.

---

# Offline Architecture

This is where many teams lose points.

Our app should behave like this:

```
Fill Assessment

↓

Saved to SQLite

↓

Queue Created

↓

Internet?

↓

NO

↓

Continue Working

↓

Later

↓

Sync

↓

Supabase Updated
```

The user never loses work.

---

# Sync Engine

The Sync Engine has one responsibility.

```
Upload Pending Changes

↓

Download Latest Updates

↓

Resolve Conflicts

↓

Mark Synced
```

Simple.

---

# State Management

I recommend using:

- **React Query (TanStack Query)** → Server state, caching, background refetching when online.
- **Zustand** → UI state (selected patient, filters, current journey).
- **SQLite** → Offline local data.
- **Supabase** → Remote source of truth.

Avoid Redux for the MVP unless someone on the team is already very comfortable with it.

---

# AI Integration

React Native never calls OpenAI or Khaya directly.

```
React Native

↓

Backend

↓

Clinical Intelligence

↓

Khaya

↓

Result

↓

React Native
```

Much safer.

---

# Screen Flow

```
Dashboard

↓

Priority Queue

↓

Mother

↓

Journey

↓

Assessment

↓

Recommendation

↓

Voice Guidance

↓

Complete Visit

↓

Dashboard Updated
```

That's the demo.

---

# Team Division

Now we can divide work cleanly.

### 👨‍💻 Frontend Team

- Authentication
- Dashboard
- Journey Timeline
- Assessment Screens
- Follow-up Screens
- Offline storage

---

### ⚙ Backend Team

- Supabase
- Edge Functions
- Journey Engine
- Care Coordination Engine
- Sync APIs

---

### 🤖 AI Team

- Clinical Rules Engine
- ChatGPT/Claude integration
- Khaya AI integration
- Recommendation templates

---

### 🧪 QA & Demo Team

- Test offline mode
- Test sync
- Prepare demo data
- Demo script
- Judge Q&A

---

# 🏆 Bro... Before We Write a Single Line of Code

I think there's **one final artifact** that will dramatically reduce development mistakes.

Not the UI.

Not the database.

Not the APIs.

## **The User Story & Screen Flow Specification**

For every screen, we'll document:

| Screen | User Goal | Inputs | Backend Calls | Events Triggered | Next Screen |
| --- | --- | --- | --- | --- | --- |
| Dashboard | See today's priorities | None | `GET /dashboard` | None | Mother Profile |
| Assessment | Record ANC visit | Vitals, symptoms | `POST /assessments` | `AssessmentCompleted` | Recommendation |
| Journey Timeline | View care progress | None | `GET /timeline` | None | Assessment |

This becomes the contract between design, frontend, backend, and AI. Everyone builds from the same blueprint.

---

## 🌟 One Last Recommendation

Bro, after months of discussion, I think **MamaLink should be presented to the judges with one sentence**:

> **"MamaLink is an AI-powered Predictive Care Coordination Platform that helps CHPS workers identify who needs care before they are lost to follow-up, using proactive care journeys, explainable clinical intelligence, and local-language voice support."**
> 

Notice what we **don't** say:

- We don't say "health app."
- We don't say "electronic medical record."
- We don't say "AI chatbot."

We define MamaLink by the problem it solves: **keeping mothers and children connected to care before crises happen**. That positioning, combined with the architecture we've designed, gives your team a compelling story that is technically credible, clinically aligned, and memorable for judges. 🚀