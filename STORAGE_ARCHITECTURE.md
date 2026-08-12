# Storage Architecture - AsyncStorage + MMKV

## Overview

Your app uses a **two-tier storage strategy** for simplicity and performance:

```
┌──────────────────────────────────────────────┐
│         React Native App                     │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼──────────────┐  ┌──▼───────────────┐
    │  AsyncStorage    │  │  MMKV            │
    │  (Auth)          │  │  (App Data)      │
    │  - Sessions      │  │  - Households    │
    │  - Tokens        │  │  - Persons       │
    │  - User prefs    │  │  - Episodes      │
    └──────────────────┘  │  - Visits        │
                          │  - Assessments   │
                          │  - etc.          │
                          └──────────────────┘
                                  │
                                  │ (Legend State syncs)
                                  ▼
                          ┌──────────────────┐
                          │  Supabase        │
                          │  PostgreSQL      │
                          └──────────────────┘
```

---

## Storage Layer Details

### AsyncStorage (Auth)
**File:** `src/lib/supabase.ts`

Used for:
- ✅ Supabase session tokens (JWT)
- ✅ User preferences (onboarding state, etc.)
- ✅ Non-critical state that doesn't need complex queries
- ✅ Small, simple key-value data

**Why AsyncStorage for auth?**
- ✅ Simpler than MMKV
- ✅ Battle-tested with Supabase
- ✅ No extra setup needed
- ✅ Sufficient for session persistence
- ✅ Survives app restart
- ✅ Works offline

**Lifespan:** Session token refreshes every ~1 hour, persists across restarts

---

### MMKV (App Data)
**File:** `src/state/setup.ts`

Used for:
- ✅ Offline-first tables (households, persons, episodes, etc.)
- ✅ Complex queries (filtering, searching)
- ✅ Large datasets (multiple records)
- ✅ Rapid read/write operations
- ✅ Data that needs to sync to Supabase

**Why MMKV for app data?**
- ✅ Much faster than AsyncStorage
- ✅ Better for complex queries
- ✅ Integrates with Legend State
- ✅ MMKV stores structured JSON
- ✅ Built-in for offline-first sync

**Lifespan:** Persists until manually cleared, syncs to Supabase via Legend State

---

## How They Work Together

### User Login Flow
```
1. User enters email/password
2. Supabase.auth.signInWithPassword()
3. Token stored in AsyncStorage
4. initializeAuth() loads profile
5. Profile stored in Legend State observable (currentProfile$)
6. Communities loaded and stored in Legend State (assignedCommunityIds$)
```

### Offline Data Entry Flow
```
1. User creates household (offline)
2. households$ observable writes to MMKV (instant)
3. User sees data immediately (cached locally)
4. Legend State queues sync message
5. When network returns:
   - Legend State syncs to Supabase
   - Household gets server-generated fields
   - Local copy updated with server data
6. Data persists across app restarts
```

### App Startup Flow
```
1. App loads
2. AsyncStorage restores session token
3. _layout.tsx calls initializeAuth()
4. If token valid: load profile from Supabase
5. Legend State loads households$ from MMKV
6. User sees last-viewed data instantly
7. Legend State auto-syncs any pending changes
```

---

## Storage Breakdown by Feature

| Data | Storage | Why |
|------|---------|-----|
| Auth tokens | AsyncStorage | Simple, Supabase-standard |
| Current user profile | Legend State + MMKV | Queries needed, offline fallback |
| Assigned communities | Legend State + MMKV | Used to filter all data |
| Households | MMKV + Legend State | Offline writes, complex queries |
| Persons | MMKV + Legend State | Offline writes, complex queries |
| Care episodes | MMKV + Legend State | Offline writes, complex queries |
| Visits | MMKV + Legend State | Offline writes, complex queries |
| Assessments | MMKV + Legend State | Offline writes, complex queries |
| AI recommendations | TanStack Query | Read-only, server-generated |
| Dashboards | TanStack Query | Read-only, aggregate views |

---

## Key Points

### AsyncStorage
- ✅ Simple key-value store
- ✅ Persists strings only (JSON-serialized)
- ✅ ~5-10MB size limit
- ✅ Works offline
- ✅ No setup required (already integrated with Supabase)

### MMKV
- ✅ Fast key-value store (C++)
- ✅ Works with complex objects
- ✅ No size limit (device storage)
- ✅ Instant queries
- ✅ Integrates with Legend State for sync

### Legend State
- ✅ Watches MMKV data
- ✅ Detects changes
- ✅ Queues offline changes
- ✅ Auto-syncs to Supabase when online
- ✅ Merges server updates with local changes

### Supabase
- ✅ Source of truth
- ✅ Syncs data from Legend State
- ✅ Applies RLS (only user's data syncs down)
- ✅ Provides realtime updates

---

## Testing

### Verify AsyncStorage Auth
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check what's stored
const keys = await AsyncStorage.getAllKeys();
console.log("AsyncStorage keys:", keys);
// Should include: @supabase_auth_token, auth.*, etc.
```

### Verify MMKV Data
```typescript
import { mmkvStorage } from "@/state/setup";

// Check MMKV has household data
console.log("MMKV keys:", mmkvStorage.getAllKeys());
// Should include: households data after syncing
```

### Test Offline Cycle
```bash
# 1. Login
# 2. Create household
# 3. Toggle airplane mode
# 4. Kill app
# 5. Restart app
# ✅ Household still visible (from MMKV)
# 6. Toggle airplane mode off
# ✅ Data syncs to Supabase
```

---

## Advantages of This Approach

✅ **Simple:** No custom auth adapter needed
✅ **Proven:** AsyncStorage + Supabase is standard pattern
✅ **Fast:** MMKV handles all the performance-critical data
✅ **Offline:** Both layers work offline
✅ **Synced:** Legend State handles all Supabase sync logic
✅ **Secure:** No secrets in MMKV, auth tokens in AsyncStorage
✅ **Persistent:** Both survive app restart

---

## Clearing Storage (Nuclear Option)

If you need to reset everything:

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mmkvStorage } from "@/state/setup";

// Clear auth
await AsyncStorage.clear();

// Clear app data
mmkvStorage.clearAll();

// Then restart app
```

---

## Next Steps

✅ Phase 1-2 complete with AsyncStorage + MMKV
⏭️ **Phase 3:** Create first offline table (households)

This storage architecture is ready for all offline functionality! 🚀
