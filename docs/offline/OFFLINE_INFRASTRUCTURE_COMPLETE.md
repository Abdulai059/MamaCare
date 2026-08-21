# Offline-First Infrastructure - Complete ✅

## What Was Set Up

Your MamaLink app now has a complete **offline-first architecture** ready for Phase 3 (first offline table).

### The Stack

```
┌─────────────────────────────────────────────┐
│   React Native (Expo) App                   │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴───────────┐
        │                      │
    ┌───▼──────────────┐  ┌───▼────────────────┐
    │  Legend State    │  │  TanStack Query    │
    │  (Offline)       │  │  (Server-only)     │
    └───┬──────────────┘  └────────────────────┘
        │
    ┌───▼────────────────────┐
    │  MMKV Storage Layer    │
    │  - app-local-db        │
    │  - auth-storage        │
    └───┬────────────────────┘
        │
    ┌───▼────────────────────┐
    │  Supabase Backend      │
    │  - Auth                │
    │  - Sync                │
    │  - RLS                 │
    └────────────────────────┘
```

---

## Files Created

### 1. **src/lib/supabase.ts** (Modified)
- ✅ Supabase client with MMKV auth storage
- ✅ Session tokens persisted to device
- ✅ Auto-refresh enabled
- ✅ Foreground/background state detection

### 2. **src/state/setup.ts** (NEW)
- ✅ Legend State + Supabase sync configuration
- ✅ MMKV persistence configured
- ✅ Client-side UUID generation
- ✅ Change tracking with created_at/updated_at/deleted_at
- ✅ Infinite retry on sync failure
- ✅ Last-sync incremental sync mode

### 3. **src/state/auth.ts** (NEW)
- ✅ `currentProfile$` observable - Current user
- ✅ `assignedCommunityIds$` observable - User's communities
- ✅ `initializeAuth()` function - Runs on app startup
- ✅ `signOut()` function - Clears auth state
- ✅ Auto-loads profile on login
- ✅ Merges primary + worker_assignments communities

### 4. **src/app/_layout.tsx** (Modified)
- ✅ Added `initializeAuth()` call on startup
- ✅ Auth observable subscriptions ready

---

## How It Works

### App Startup
```
1. App opens
2. _layout.tsx calls initializeAuth()
3. Check for existing Supabase session
4. If logged in:
   - Load profile from Supabase
   - Fetch assigned communities
   - Update currentProfile$ and assignedCommunityIds$
5. Listen for auth changes (login/logout)
```

### User Login
```
1. User enters email/password
2. Supabase.auth.signInWithPassword()
3. Auth observables detect change
4. Load profile and communities
5. Route to home screen
6. Session token saved to MMKV
```

### Offline Table Sync (Phase 3+)
```
1. User creates record (e.g., household) offline
2. Legend State saves to MMKV immediately
3. User sees data instantly
4. When network returns:
   - Legend State detects connection
   - Syncs all changes to Supabase
   - Updates local copies with server IDs
5. Data persists across restarts
```

---

## Architecture Decisions

### Why MMKV for Auth?
- ✅ Persists across app restarts
- ✅ Works offline (no network needed)
- ✅ Faster than AsyncStorage
- ✅ Supports complex types
- ✅ Zero setup

### Why Legend State?
- ✅ Built for offline-first
- ✅ Handles conflict resolution
- ✅ Queues changes when offline
- ✅ Auto-syncs when online
- ✅ Observable pattern (reactive)
- ✅ MMKV persistence built-in

### Why TanStack Query for some things?
- ✅ Server-only reads don't need offline sync
- ✅ Dashboard aggregates (expensive queries)
- ✅ Search results (temporary)
- ✅ AI recommendations (generated server-side)
- ✅ Keeps cache management simple

### Why Supabase?
- ✅ Realtime sync for multiple devices
- ✅ RLS for user isolation
- ✅ PostgreSQL for complex queries
- ✅ Auth built-in
- ✅ Works with Legend State sync plugin

---

## Data Flow Examples

### Create Household Offline
```typescript
import { households$ } from "@/state/households"; // Phase 3

const newId = uuidv4();
households$[newId].set({
  id: newId,
  community_id: assignedCommunityIds$.get()[0],
  household_code: "HH-001",
  address_description: "Near the clinic",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
// ✅ Saved to MMKV immediately
// ✅ Queued for sync when online
```

### Query Profile Across App
```typescript
import { currentProfile$ } from "@/state/auth";

// In any component:
const profile = currentProfile$.get();
console.log(profile?.full_name); // "John Smith"
console.log(profile?.role); // "CHPS_WORKER"
```

### Check What Communities User Can Access
```typescript
import { assignedCommunityIds$ } from "@/state/auth";

const myCommunitiesIds = assignedCommunityIds$.get();
// ["uuid-1", "uuid-2"] - User can create data in these
```

---

## Testing Checklist

- [ ] Dependencies installed: `npm list react-native-mmkv`
- [ ] Start app: `npm run dev`
- [ ] Create test user in Supabase
- [ ] Login works
- [ ] Profile shows in `currentProfile$.get()`
- [ ] Communities show in `assignedCommunityIds$.get()`
- [ ] Kill app and restart → still logged in
- [ ] Logout works → observables clear

---

## Next: Phase 3

When ready to implement the first offline table (**households**):

```typescript
// Will look like this:
import { customSynced } from "@/state/setup";
import { assignedCommunityIds$ } from "@/state/auth";

export const households$ = customSynced(
  "households",
  [customSynced("households")],
  {
    waitFor: () => !!assignedCommunityIds$.get()?.length,
    filter: {
      community_id: {
        in: assignedCommunityIds$,
      },
    },
    realtime: true,
    actions: {
      create: true,
      update: true,
      delete: true,
    },
  }
);
```

This will:
- ✅ Persist households to MMKV
- ✅ Sync to Supabase when online
- ✅ Filter by user's assigned communities
- ✅ Support create/update/delete offline
- ✅ Auto-queue changes
- ✅ Realtime updates from Supabase

---

## Commands Reference

```bash
# Start app with offline support
npm run dev

# Verify dependencies
npm list react-native-mmkv
npm list @legendapp/state

# Rebuild native modules (if issues)
npm run ios    # iOS
npm run android # Android

# Check Supabase connection
# Try login - profile should load

# Clear local data (nuclear option)
# Delete MMKV keys via code or native tools
```

---

## Ready?

✅ **Phase 1-2 Complete:** Auth + Scope Resolution
⏭️ **Phase 3 Next:** First Offline Table (Households)

Reply when you've tested the checklist and you're ready for Phase 3! 🚀
