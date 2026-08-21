# Mamalink — Implementation Prompt Plan
### Legend State + MMKV + Supabase + TanStack Query

Use these prompts in order, one at a time, with Claude Code (or here). Each is scoped to be verifiable before moving to the next. Assumes your Supabase schema, RLS, and `profiles` table are already live.

---

## Role split (read once before starting)

| Tool | Handles |
|---|---|
| **MMKV** | Raw on-device storage |
| **Legend State** | Offline-first tables: `households`, `persons`, `care_episodes`, `visits`, assessments, `appointments`, `referrals` — anything a CHPS worker creates/edits offline |
| **TanStack Query** | One-off/non-persisted server calls: dashboards, search, `ai_recommendations` reads, supervisor-side aggregate views, anything that doesn't need to work offline |
| **Supabase** | Backend + auth + realtime + RLS |

Don't build the same table into both Legend State and TanStack Query — pick one per table based on whether it needs offline write support.

---

## Phase 1 — Dependencies & core clients

**Prompt 1.1**
> Install and configure the offline-first stack in this Expo React Native project: `react-native-mmkv@3.1.0`, `@legendapp/state@beta`, `@supabase/supabase-js`, `@tanstack/react-query`, `uuid`, `react-native-get-random-values`. Run pod install after. Show me the installed versions when done.

**Prompt 1.2**
> Create `src/lib/supabase.ts`: a Supabase client using MMKV as the auth storage adapter (wrap MMKV's sync get/set/delete in Promises to match the AsyncStorage-like interface Supabase expects). Read the URL and anon key from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars. Confirm these exist in my `.env` — if not, tell me what to add.

**Prompt 1.3**
> Create `src/state/setup.ts`: instantiate a named MMKV instance for app data (id: "app-local-db"), configure `@legendapp/state`'s `configureSyncedSupabase` with client-side uuid generation, and export a `customSynced` factory via `configureSynced(syncedSupabase, ...)` with MMKV persistence, `retrySync: true`, `changesSince: 'last-sync'`, `fieldCreatedAt: 'created_at'`, `fieldUpdatedAt: 'updated_at'`, `fieldDeleted: 'deleted_at'`, and `retry: { infinite: true }`.

**Prompt 1.4**
> Set up a `QueryClient` for TanStack Query in `src/lib/queryClient.ts` and wrap the app root in `QueryClientProvider`. Configure a reasonable default `staleTime` and disable `refetchOnWindowFocus` for mobile.

---

## Phase 2 — Auth & scope resolution

**Prompt 2.1**
> Create `src/state/auth.ts` with two Legend State observables: `currentProfile$` and `assignedCommunityIds$`. On Supabase auth state change, fetch the user's row from `profiles` (role, assigned_community_id) and any rows from `worker_assignments`, merge into `assignedCommunityIds$`. Clear both observables on sign-out.

**Prompt 2.2**
> Build a sign-in screen using `supabase.auth.signInWithPassword`. Show a loading state while `assignedCommunityIds$` resolves after login, since data sync depends on it. Handle and display auth errors clearly.

**Prompt 2.3**
> Test: log in as a CHPS_WORKER test account and console.log `assignedCommunityIds$.get()` after a few seconds. Confirm it resolves to the correct community ID(s) before moving on.

---

## Phase 3 — First offline-first table (prove the pattern)

**Prompt 3.1**
> Create `src/state/households.ts`: a Legend State observable using `customSynced`, collection `households`, filtered by `community_id in assignedCommunityIds$`, gated with `waitFor` until that list is non-empty, `realtime: true`, actions read/create/update/delete, persisted to MMKV under key name `households`.

**Prompt 3.2**
> Build a simple households list screen using `observer()` from `@legendapp/state/react`, reading `households$.get()`. Add a create-household form that calls `.set()` on a new UUID key.

**Prompt 3.3**
> Test the full offline cycle: turn on airplane mode, create 2 households, kill and reopen the app, confirm they persisted locally. Turn network back on, confirm they appear in Supabase's table editor within a few seconds. Report back what you observe at each step.

---

## Phase 4 — Expand to the rest of the offline-first tables

**Prompt 4.1**
> Following the exact pattern in `src/state/households.ts`, create equivalent files for `persons`, `care_episodes`, `visits`, `appointments`, `referrals` — filtering each by `community_id` (already denormalized onto these tables). Use `waitFor: () => !!assignedCommunityIds$.get()?.length` on all of them.

**Prompt 4.2**
> Create `src/state/clinicalAssessments.ts`, `pregnancyAssessments.ts`, `postnatalAssessments.ts`, `newbornAssessments.ts` as Legend State observables. These don't need direct community filtering — they're scoped through their parent `visit_id`'s RLS policy — but still need MMKV persistence and offline queueing.

**Prompt 4.3**
> Create `src/state/assessments.ts` with a `recordPregnancyAssessment(visitId, assessedBy, data)` function (and equivalents for postnatal/newborn) that generates two client-side UUIDs and writes both the parent `clinical_assessments` row and the type-specific row in one call, so a completed offline assessment form creates both rows atomically from the UI's perspective.

**Prompt 4.4**
> Create read-only reference data observables for `regions`, `districts`, `communities` — unfiltered, `actions: ['read']` only, `realtime: false`, since these rarely change and every device needs the full set for dropdowns.

---

## Phase 5 — TanStack Query for non-offline data

**Prompt 5.1**
> Create a TanStack Query hook `useAiRecommendations(episodeId)` that fetches from the `ai_recommendations` table via Supabase, read-only, with a sensible `staleTime`. This is server-generated content the device never writes, so it doesn't need Legend State's offline queue.

**Prompt 5.2**
> Build a supervisor dashboard screen using TanStack Query to fetch aggregate `care_priorities` across a district (not scoped to a single community like the CHPS worker views), with pull-to-refresh via `refetch()`. This view is online-only by design — supervisors reviewing dashboards need a network connection, unlike field data entry.

---

## Phase 6 — Media (do later, once core sync is stable)

**Prompt 6.1**
> Design an upload queue for `caregiver_guidance.audio_url`: a small MMKV-backed list of `{ localPath, remotePath, status }`, flushed via Supabase Storage on reconnect, updating the parent row's URL through its Legend State observable only after both the storage upload and DB write succeed.

---

## Phase 7 — Hardening

**Prompt 7.1**
> Add a global sync status indicator (e.g. "X changes pending sync") using Legend State's `syncState()` helper on the key observables, so CHPS workers can see when local data hasn't synced yet before leaving an area with no signal.

**Prompt 7.2**
> Write a test plan (manual or automated) that: (a) confirms a CHPS worker only ever sees data from their assigned community, never another worker's, and (b) confirms an offline-created record survives an app kill/relaunch and syncs correctly once reconnected.

---

## Notes while running this plan

- After each phase, actually test on airplane mode before moving to the next — offline bugs are much cheaper to catch one table at a time than after wiring all 15.
- If a prompt's output doesn't match what's described, paste the error back before continuing — don't stack Phase 4 on top of a broken Phase 3.