# Phase 1 - Offline Infrastructure Setup ✅

## Completed

### 1.1 Dependencies Installed ✅
All packages installed and verified:
- `react-native-mmkv@3.1.0` - Device storage layer
- `@legendapp/state@3.0.0-beta.48` - Offline-first state management
- `@supabase/supabase-js@2.109.0` - Backend client
- `@tanstack/react-query@5.101.4` - Server-only query caching
- `react-native-get-random-values@1.11.0` - UUID generation
- `uuid` - UUID library

### 1.2 Supabase Client with MMKV Storage ✅
**File:** `src/lib/supabase.ts`

- Supabase auth now uses MMKV instead of AsyncStorage
- Created `MMKVAuthAdapter` that implements AsyncStorage-like interface
- Auth sessions persist to MMKV: `auth-storage` instance
- Maintains auto-refresh and foreground state detection

```typescript
// MMKV-backed auth storage - survives app restarts
const mmkvAuth = new MMKV({ id: "auth-storage" });

// Adapter converts MMKV to Supabase's expected interface
class MMKVAuthAdapter {
  async getItem(key: string) { ... }
  async setItem(key: string, value: string) { ... }
  async removeItem(key: string) { ... }
}
```

### 1.3 Legend State + Supabase Sync Configuration ✅
**File:** `src/state/setup.ts`

Configured offline-first sync with:
- **MMKV persistence**: `mmkv-storage` instance for app data
- **Legend State sync**: `configureSynced(syncedSupabase, ...)`
- **Client-side UUIDs**: All new records get v4 UUIDs
- **Change tracking**: Stores `created_at`, `updated_at`, `deleted_at`
- **Retry logic**: Infinite retry on failed syncs
- **Sync mode**: Last-sync incremental (only fetch changes since last success)

```typescript
export const customSynced = configureSynced(syncedSupabase, {
  supabase,
  generateId: () => uuidv4(),
  persist: { plugin: ObservablePersistMMKV, options: { mmkv: mmkvStorage } },
  retrySync: true,
  changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  fieldDeleted: "deleted_at",
  retry: { infinite: true },
});
```

### 1.4 TanStack Query Configuration ✅
**File:** `src/lib/queryClient.ts`

Already configured with sensible defaults:
- `staleTime: 30s` - Data fresh for 30 seconds
- `gcTime: 5m` - Keep unused cache for 5 minutes
- `retry: 2` for queries, `retry: 1` for mutations

---

## Phase 2 - Auth & Scope Resolution ✅

### 2.1 Auth State Observables ✅
**File:** `src/state/auth.ts`

Two Legend State observables:

1. **`currentProfile$`** - Current logged-in user
   ```typescript
   {
     id: string;
     email: string | null;
     full_name: string | null;
     role: "CHPS_WORKER" | "SUPERVISOR" | "ADMIN";
     assigned_community_id: string | null;
     assigned_district_id: string | null;
   }
   ```

2. **`assignedCommunityIds$`** - All communities this user can access
   - Includes `assigned_community_id` from profiles
   - Plus all rows from `worker_assignments` table
   - Used to filter all offline-first data by community

### 2.2 Auto-Initialization ✅
**File:** `src/app/_layout.tsx`

Added to RootLayout:
```typescript
useEffect(() => {
  import("@/state/auth").then(({ initializeAuth }) => {
    initializeAuth();
  });
}, []);
```

This runs on app startup and:
1. Checks for existing Supabase session
2. Loads profile for that user
3. Fetches community assignments
4. Listens for auth changes (login/logout)
5. Updates observables automatically

---

## Architecture Overview

```
MMKV Storage (app-local-db)
  ├── Holds: households, persons, episodes, visits, assessments, etc.
  ├── Persists across app restarts
  └── Syncs to Supabase when online

MMKV Auth Storage (auth-storage)
  ├── Holds: Supabase session JWT tokens
  └── Auto-refreshed every hour

Legend State Observables
  ├── currentProfile$ - Current user profile
  ├── assignedCommunityIds$ - User's accessible communities
  └── (Phase 3+) households$, persons$, episodes$, etc.

Supabase (Backend)
  ├── Listens for auth changes
  ├── Stores & syncs all data
  ├── Applies RLS policies
  └── Provides realtime updates
```

---

## Testing Phase 1

### Test 1: Auth Initialization
```bash
# 1. Start the app
npm run dev

# 2. Open console/logs
# Should see: "Auth initialized" or user profile loading

# 3. Try logging in
# Expected: profile$ and assignedCommunityIds$ populate
```

### Test 2: Session Persistence
```bash
# 1. Log in
# 2. Kill the app completely
# 3. Reopen the app
# Expected: Still logged in (session restored from MMKV)
```

### Test 3: Logout
```bash
# 1. From any screen, call signOut()
# 2. Expected:
#    - currentProfile$ → null
#    - assignedCommunityIds$ → []
#    - Route to login screen
```

---

## What's Ready for Phase 3

✅ MMKV storage layer configured
✅ Legend State sync configured
✅ Auth observable initialized
✅ Community scope loaded

**Next:** Create first offline-first table (households) with full offline cycle test.

---

## Key Files

- `src/lib/supabase.ts` - Supabase client with MMKV auth
- `src/lib/queryClient.ts` - TanStack Query config
- `src/state/setup.ts` - Legend State + Supabase sync config
- `src/state/auth.ts` - Auth observables + initialization
- `src/app/_layout.tsx` - Init hook added

---

## Troubleshooting

### "uuid is not defined"
- ✅ Already installed and imported in state/setup.ts

### "Legend State imports failing"
- Check: `npm list @legendapp/state`
- Should be `^3.0.0-beta.48` or later

### "MMKV errors"
- Check: Pod install completed (iOS)
- Check: Rebuild native modules
  ```bash
  npm run ios  # or android
  ```

### Auth not initializing
- Check console for errors in `initializeAuth()`
- Verify Supabase URL and key in `.env.local`
- Check `src/state/auth.ts` being imported

---

## Next: Phase 3 - First Offline Table

Ready to create `src/state/households.ts` with:
- ✅ Filtered by assignedCommunityIds$
- ✅ MMKV persistence
- ✅ Offline queue sync
- ✅ Create/update/delete actions
- ✅ Full offline cycle test

Ask to proceed to Phase 3 when ready! 🚀
