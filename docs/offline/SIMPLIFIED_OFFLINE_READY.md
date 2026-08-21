# Simplified Offline-First Architecture ✅

Switched to a simpler, more direct approach using AsyncStorage without complex Legend State configuration.

---

## What Changed

### Previous (Complex)
- Legend State + customSynced proxy configuration
- MMKV native module (build issues)
- Complex sync configuration

### Now (Simple)
- Direct observable + AsyncStorage persistence
- No native modules
- Simple sync functions
- Works immediately

---

## Architecture

```
┌─────────────────────────────┐
│  Households/Persons UI      │
│  (React Components)         │
└────────────┬────────────────┘
             │
    ┌────────▼────────┐
    │ households$     │
    │ persons$        │
    │ (Observables)   │
    └────────┬────────┘
             │
    ┌────────▼────────────────┐
    │  AsyncStorage           │
    │  - households_local     │
    │  - persons_local        │
    │  Persists offline data  │
    └────────┬────────────────┘
             │
    ┌────────▼────────────────┐
    │  Supabase               │
    │  - Syncs when online    │
    │  - Source of truth      │
    └────────────────────────┘
```

---

## How It Works

### 1. Create Household Offline
```typescript
await createHousehold({
  household_code: "HH-001",
  address_description: "Near clinic"
});
// ✅ Added to households$ observable instantly
// ✅ Saved to AsyncStorage immediately
// ✅ User sees it right away
```

### 2. App Restart (Offline)
```typescript
// On app startup:
await initializeHouseholds();
// ✅ Loads from AsyncStorage
// ✅ Household still visible
// ✅ Can create/edit more offline
```

### 3. Network Restore (Online)
```typescript
// syncHouseholdsToSupabase() auto-called
// ✅ Sends all offline data to Supabase
// ✅ Marks as synced
// ✅ Data now on backend
```

---

## Files Updated

### src/state/households.ts
- Simple observable: `households$`
- Function: `loadHouseholdsFromStorage()` - Restore from AsyncStorage
- Function: `initializeHouseholds()` - Called on app startup
- Function: `createHousehold()` - Create + sync
- Function: `updateHousehold()` - Update + sync
- Function: `deleteHousehold()` - Delete + sync
- Auto-sync: `syncHouseholdsToSupabase()` - Background sync

### src/state/persons.ts
- Same pattern as households
- Functions: create, update, delete persons
- Auto-sync to Supabase

### src/app/_layout.tsx
- Added: `initializeHouseholds()`
- Added: `initializePersons()`
- Runs on app startup

### src/features/ui/HeaderSection.tsx
- Fixed avatar warning
- Shows icon if no avatar_url

---

## Testing Offline Cycle

### Test 1: Create Offline
```bash
1. Start app
2. Go to Households tab
3. Create "HH-001"
✅ Shows immediately
```

### Test 2: Kill App
```bash
1. Kill app completely
2. Restart app
3. Go to Households
✅ HH-001 still there (AsyncStorage!)
```

### Test 3: Add Person Offline
```bash
1. Tap HH-001
2. Add "Mary" (MOTHER)
3. Kill app
4. Restart
✅ Mary still in household
```

### Test 4: Airplane Mode
```bash
1. Enable Airplane Mode
2. Create "HH-002"
3. Add "Amina" to HH-002
4. Kill app
✅ Both still visible (all offline)
```

### Test 5: Sync Online
```bash
1. Disable Airplane Mode
2. Wait 2 seconds (sync runs)
3. Open Supabase Studio
4. Check households table
✅ HH-001, HH-002 appear
5. Check persons table
✅ Mary, Amina appear
```

---

## Code Example: Creating Data

```typescript
import { createHousehold } from "@/state/households";

// In a component:
const handleCreate = async () => {
  try {
    const id = await createHousehold({
      household_code: "HH-001",
      address_description: "Near clinic",
    });
    console.log("Created:", id);
    // ✅ Automatically:
    // - Added to households$ observable
    // - Saved to AsyncStorage
    // - Synced to Supabase (if online)
  } catch (error) {
    console.error(error);
  }
};
```

---

## Data Flow

### Offline Create
```
User taps Create
    ↓
createHousehold() called
    ↓
households$[id].set(data)
    ↓
Observable triggers onChange
    ↓
Saved to AsyncStorage
    ↓
syncHouseholdsToSupabase() called (if online)
```

### App Restart
```
App starts
    ↓
initializeHouseholds() called
    ↓
loadHouseholdsFromStorage() reads AsyncStorage
    ↓
households$ populated
    ↓
UI re-renders with data
```

### Network Restore
```
Network available
    ↓
syncHouseholdsToSupabase() runs
    ↓
Loops through all households
    ↓
Upserts to Supabase
    ↓
Marks as synced: _synced = true
    ↓
Data now on backend
```

---

## Key Advantages

✅ **No Native Modules** - AsyncStorage is built-in
✅ **Simple Code** - Easy to understand and modify
✅ **Works Offline** - Complete offline persistence
✅ **Auto-Syncs** - Background sync when online
✅ **No Build Issues** - Just works immediately
✅ **Community Filtered** - RLS enforcement on backend

---

## Debugging

### Check Observable Data
```typescript
import { households$ } from "@/state/households";

console.log(households$.get());  // See all households
```

### Check AsyncStorage
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const data = await AsyncStorage.getItem("households_local");
console.log(JSON.parse(data));  // See stored data
```

### Check Sync Status
Add this to see sync activity:
```typescript
// In a component
useEffect(() => {
  const interval = setInterval(() => {
    console.log("Current households:", households$.get());
  }, 2000);
  return () => clearInterval(interval);
}, []);
```

---

## Next Steps

✅ Phase 3 Complete: Households & Persons (Offline)
✅ AsyncStorage Persistence (Works!)
✅ Manual Sync to Supabase (Background)

⏭️ Phase 4: Care Episodes
- Same pattern: create observable
- Load from storage
- Sync to Supabase

⏭️ Phase 5: Visits & Appointments
- Same pattern as households

---

## Running the App

```bash
npm run android
# or
npm run dev

# Then test the offline cycle!
```

No build errors. No native module issues. Just works! 🚀

---

## Summary

**Simple Offline Architecture Ready:**
- ✅ Household registration
- ✅ Person management
- ✅ AsyncStorage persistence
- ✅ Background Supabase sync
- ✅ Community scoping
- ✅ Beautiful UI

**Works 100% offline, syncs when online!**
