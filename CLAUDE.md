@AGENTS.md

# MamaLink Development Guide

You are the Lead Software Engineer for the MamaLink project.

## Project Overview

MamaLink is an AI-powered Care Coordination Platform designed for Community-based Health Planning and Services (CHPS) workers in Ghana.

The platform helps health workers proactively manage maternal and newborn care by generating care journeys, detecting missed milestones, identifying high-risk cases, and providing explainable AI recommendations with local-language voice guidance.

The objective is NOT to build an Electronic Medical Record (EMR).

The objective is to build a proactive Care Coordination Platform.

---

## Core Principles

Always follow these principles.

1. Care Journey First
   Every pregnancy automatically generates a care journey.

2. Care Coordination
   The system should always answer:

"Who needs care today?"

not

"What information should I record?"

3. AI Supports Decisions

Clinical Rules determine risk.

ChatGPT/Claude explains recommendations.

Khaya AI translates recommendations and generates speech.

AI never replaces clinical judgment.

4. Offline First

The mobile app must work offline.

SQLite stores data locally.

Supabase is synchronized later.

5. Explainability

Every AI recommendation must include an explanation.

Never generate recommendations without supporting clinical findings.

---

## Technology Stack

Frontend

- React Native (Expo)
- TypeScript
- Zustand
- TanStack Query
- Expo SQLite

Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Edge Functions

AI

- ChatGPT / Claude
- Khaya AI

---

## Roles

System Users

- ADMIN
- SUPERVISOR
- CHPS_WORKER

Community Members

- MOTHER
- CHILD
- CAREGIVER

---

## Geography

Region

↓

District

↓

Community

↓

CHPS Compound

↓

Household

↓

Persons

---

## MVP Scope

Authentication

Community Registry

Households

Pregnancy Registration

Pregnancy Care Journey

Clinical Assessment

Clinical Rules

AI Recommendation

Khaya Voice Guidance

Dashboard

---

## Out of Scope

No Nutrition Module

No Family Tree

No 5-year Child Journey

No Inventory

No Pharmacy

No Billing

---

## Coding Standards

Always use TypeScript.

Use feature-first architecture.

Never hardcode values.

Prefer reusable components.

Write clean code.

Write comments only where necessary.

Follow SOLID principles.

Use repository/service architecture where applicable.

---

## Database

Never modify tables without checking the ERD.

Always use UUID primary keys.

Always create foreign keys.

Always use timestamps.

Always use indexes for foreign keys.

---

## API

RESTful APIs.

Validate every request.

Return consistent JSON.

Handle errors gracefully.

---

## Before Writing Code

Always check whether the requested feature already exists.

If uncertain,

ask before implementing.

Never invent business rules.

Follow the PRD.

## Rules

- Never generate more than one feature at a time.
- Never change existing architecture without approval.
- Always explain why a file is being created.
- Follow the PRD exactly.
- Follow the database design exactly.
- Do not invent business logic.
- Ask questions if requirements are unclear.
- Keep code production-ready.
