# Offline-First Setup with AsyncStorage ✅

Switched from MMKV to AsyncStorage for simpler offline persistence without native module compilation.

---

## Architecture

```
┌──────────────────────────────────────┐
│   Household & Person Registration    │
│   (React Components)                 │
└──────────────────┬───────────────────┘
                   │
        ┌──────────▼──────────┐
        │                     │
    ┌───▼────────────────┐   │
    │ Legend State       │   │
    │ Observables        │   │
    │ - households$      │   │
    │ - persons$         │   │
    └───┬────────────────┘   │
        │                     │
        │  ┌──────────────────┘
        │  │
    ┌───▼──────────────────────┐
    │  AsyncStorage            │
    │  Persistence Layer       │
    │  - Stores app data       │
    │  - Works offline         │
    │  - Persists across app   │
    │    restarts              │
    └───┬──────────────────────┘
        │
    ┌───▼──────────────────────┐
    │  Supabase                │
    │  - Syncs when online     │
    │  - Source of truth       │
    │  - RLS enforcement       │
    └──────────────────────────┘
```

---

## How It Works

### Storage Layers

**AsyncStorage (Device):**
- ✅ Stores household and person data
- ✅ Works completely offline
- ✅ Persists across app restarts
- ✅ Syncs to Supabase when online
- ✅ No native module compilation needed
- ✅ Simple key-value store

**Legend State:**
- ✅ Wraps AsyncStorage with reactive observables
- ✅ Detects changes automatically
- ✅ Queues changes while offline
- ✅ Auto-syncs to Supabase when online
- ✅ Handles conflicts and deduplication

**Supabase (Backend):**
- ✅ Source of truth
- ✅ Enforces RLS policies
- ✅ Realtime updates
- ✅ Available when online

---

## Key Benefits

✅ **No Native Compilation** - AsyncStorage works out of the box
✅ **Simpler Setup** - No gradle builds or autolink issues
✅ **Proven** - Battle-tested with React Native
✅ **Works Offline** - Data persists locally without network
✅ **Auto-Syncs** - Legend State handles all sync logic
✅ **Community Filtered** - Only user's data syncs
✅ **RLS Protected** - Supabase enforces access control

---

## File Structure

```
src/
├── lib/
│   ├── supabase.ts         ← Supabase client with AsyncStorage auth
│   └── queryClient.ts      ← TanStack Query config
├── state/
│   ├── setup.ts            ← Legend State + AsyncStorage config (NEW)
│   ├── auth.ts             ← Auth observables
│   ├── households.ts       ← Household state
│   └── persons.ts          ← Person state
└── app/(tabs)/
    └── households.tsx      ← Registration UI
```

---

## Configuration

### src/state/setup.ts

```typescript
import { configureSynced } from "@legendapp/state/sync";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

export const customSynced = configureSynced(syncedSupabase, {
  supabase,
  generateId: () => uuidv4(),
  persist: {
    plugin: ObservablePersistAsyncStorage,  // ← AsyncStorage persistence
    options: {
      asyncStorage: AsyncStorage,
    },
  },
});
```

---

## Offline Cycle Flow

### 1. Create Household Offline
```
User: "Create HH-001"
  ↓
households$ generates UUID
  ↓
Saves to AsyncStorage immediately
  ↓
User sees it instantly (local)
  ↓
Legend State queues sync
```

### 2. App Goes Online
```
Network detected
  ↓
Legend State notices connection
  ↓
Sends queued changes to Supabase
  ↓
Supabase returns verified data
  ↓
AsyncStorage updated with server timestamps
  ↓
Data now synced across devices
```

### 3. App Restart (Offline)
```
App starts
  ↓
Legend State loads from AsyncStorage
  ↓
Households appear in UI
  ↓
User can view/edit offline
  ↓
Changes queue for later sync
```

---

## Testing Offline

### Test 1: Create & Persist
```bash
1. Open Households tab
2. Create "HH-001"
3. Kill app
4. Restart
✅ HH-001 still visible (AsyncStorage works!)
```

### Test 2: Add Person & Persist
```bash
1. Tap HH-001
2. Add "Mary" (MOTHER)
3. Kill app
4. Restart
✅ Mary still in household
```

### Test 3: Airplane Mode Test
```bash
1. Enable Airplane Mode
2. Create "HH-002"
3. Add "Amina" to HH-002
4. Kill app
✅ Still visible (all offline)
5. Disable Airplane Mode
6. Wait 5 seconds
✅ Synced to Supabase
```

### Test 4: Verify Data in Supabase
```bash
1. Open Supabase Studio
2. Go to households table
✅ HH-001, HH-002 appear
3. Go to persons table
✅ Mary, Amina linked correctly
```

---

## Debugging

### Check AsyncStorage Data
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const keys = await AsyncStorage.getAllKeys();
console.log("All keys:", keys);

const data = await AsyncStorage.getItem("households");
console.log("Household data:", data);
```

### Check Legend State
```typescript
import { households$ } from "@/state/households";

console.log(households$.get());  // See all households
```

### Check Community Filter
```typescript
import { assignedCommunityIds$ } from "@/state/auth";

console.log(assignedCommunityIds$.get());  // Should have community IDs
```

---

## Advantages vs MMKV

| Feature | AsyncStorage | MMKV |
|---------|--------------|------|
| Setup | ✅ No build needed | ❌ Gradle compilation required |
| Offline | ✅ Full support | ✅ Full support |
| Sync | ✅ Legend State handles | ✅ Legend State handles |
| Complexity | ✅ Simple | ❌ Complex native setup |
| Performance | ✅ Good for MVP | ✅ Faster for large data |
| Persistence | ✅ Reliable | ✅ More reliable |

**For MVP:** AsyncStorage is perfect. If you need extreme performance with GB of data, MMKV is better.

---

## Starting Fresh

If you want to completely clear local data:

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Clear all AsyncStorage data
await AsyncStorage.clear();

// Then restart app
```

---

## Next Steps

✅ Phase 3: Household & Person Registration (Complete)
✅ Offline persistence with AsyncStorage (Ready)

⏭️ Phase 4: Care Episodes & Visits
- Create care_episodes$ observable
- Create visits$ observable
- Create appointment management

⏭️ Phase 5: Clinical Assessments
- Create assessments$ observable
- Create assessment forms

---

## Summary

**AsyncStorage Setup = ✅ Complete**

You now have:
- ✅ Offline household registration
- ✅ Person management
- ✅ Full sync architecture
- ✅ AsyncStorage persistence
- ✅ Community scoping
- ✅ Beautiful UI

**No native module issues. Just works.**

Start the app and test! 🚀
