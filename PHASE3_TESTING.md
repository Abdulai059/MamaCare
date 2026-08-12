# Phase 3 Testing - Household & Person Offline Registration

## What Was Implemented

✅ **src/state/households.ts** - Legend State observable for households
- Filtered by user's assigned communities
- Full CRUD operations (create, read, update, delete)
- MMKV persistence
- Offline queue sync

✅ **src/state/persons.ts** - Legend State observable for persons
- Linked to households
- Supports MOTHER, CHILD, CAREGIVER, CHPS_WORKER roles
- Soft delete support (deleted_at field)
- MMKV persistence

✅ **src/app/(tabs)/households.tsx** - Household Registration Screen
- List households in user's community
- Create new households with code and address
- View household details
- Add persons to household
- Delete households
- Offline-first (works without network)

---

## Full Offline Cycle Test

### Test 1: Basic Create & Persist

**Before you start:**
- App is running
- You're logged in
- Network is ON

**Steps:**
```
1. Open Households tab
2. Tap + button
3. Enter household code: "HH-001"
4. Enter address: "Near clinic"
5. Tap Create
✅ Household appears in list
```

**Expected:** Household visible in app and stored in MMKV

---

### Test 2: Add Person to Household

**Steps:**
```
1. Tap on HH-001 household
2. Tap + button next to "Members"
3. Enter first name: "Mary"
4. Enter last name: "Smith"
5. Select role: "MOTHER"
6. Tap Add Person
✅ Mary appears in household
```

**Expected:** Person visible under household

---

### Test 3: Kill App with Data

**Steps:**
```
1. Kill the app completely (background + foreground)
2. Wait 5 seconds
3. Reopen app
4. Go to Households tab
✅ HH-001 still there
✅ Mary still listed as member
```

**Expected:** Data persisted from MMKV despite app restart

---

### Test 4: Airplane Mode - Create More Data

**Steps:**
```
1. Enable Airplane Mode on device
2. In app, create new household:
   - Code: "HH-002"
   - Address: "Far from clinic"
3. Add person to HH-002:
   - First name: "Amina"
   - Role: "MOTHER"
4. Create another household:
   - Code: "HH-003"
   - Address: "Downtown"
✅ All appear in offline list
```

**Expected:** All data created offline, stored in MMKV, NOT yet in Supabase

---

### Test 5: Airplane Mode - App Restart

**Steps:**
```
1. While still in Airplane Mode:
2. Kill app
3. Wait 3 seconds
4. Reopen app
5. Go to Households
✅ HH-001, HH-002, HH-003 all visible
✅ Mary + Amina visible
```

**Expected:** Offline data survives restart (proving MMKV persistence works)

---

### Test 6: Network Restore - Auto Sync

**Steps:**
```
1. Still in Households tab
2. Disable Airplane Mode
3. Wait 3-5 seconds (Legend State syncs)
4. Open Supabase Studio
5. Go to Tables → households
✅ HH-001, HH-002, HH-003 now appear
6. Go to persons table
✅ Mary, Amina now appear
✅ linked to correct household via household_id
```

**Expected:** All offline data synced to Supabase automatically

---

### Test 7: Verify Community Filtering

**Steps:**
```
1. Note which community your user is assigned to
2. In Supabase, go to households table
3. Create a household manually with DIFFERENT community_id
4. Back in app, go to Households
✅ Only your community's households show
✅ Other community's household NOT visible
```

**Expected:** RLS + filtering working (data isolation confirmed)

---

### Test 8: Network Down - Create More

**Steps:**
```
1. Enable Airplane Mode again
2. Create HH-004 household
3. Wait 2 seconds
4. Kill app
5. Reopen
6. Households still shows HH-001 through HH-004
7. Disable Airplane Mode
8. Wait 3-5 seconds
9. Supabase now shows HH-004 too
```

**Expected:** Multiple offline/online cycles work correctly

---

## What to Check in Console

Add this to any component to verify sync status:

```typescript
import { households$ } from "@/state/households";

useEffect(() => {
  const interval = setInterval(() => {
    console.log("Households:", households$.get());
  }, 2000);
  return () => clearInterval(interval);
}, []);
```

**You should see:**
- Objects appearing immediately on create
- Objects persisting across restarts
- Objects appearing in Supabase after network restore

---

## Debugging Offline Sync

### Check MMKV Data

```typescript
import { mmkvStorage } from "@/state/setup";

// In React Dev Tools or console:
mmkvStorage.getAllKeys()  // Should show household/person data
```

### Check Legend State Sync

Look for these in console:
- `[Legend] Syncing...` messages
- `[Legend] Synced` on success
- No error messages on offline → online transition

### Check Community Filter

If households not showing:
```typescript
import { assignedCommunityIds$ } from "@/state/auth";
console.log(assignedCommunityIds$.get());
```

Should return array of community IDs

---

## Common Issues

### ❌ "No households yet" even after creating

**Cause:** Community filter waiting to load
**Fix:** Wait for `assignedCommunityIds$` to populate (5-10 seconds after login)

### ❌ Household creates but doesn't persist

**Cause:** MMKV storage not working
**Fix:** 
- Check native modules built (run `npm run ios` or `npm run android`)
- Check MMKV is initialized in `src/state/setup.ts`

### ❌ Data created offline but not syncing online

**Cause:** Legend State sync not configured correctly
**Fix:** Check `src/state/setup.ts` has `retrySync: true`

### ❌ Seeing data from other communities

**Cause:** RLS policy not working
**Fix:** Check database RLS rules on households table

---

## Success Criteria

✅ Create household offline
✅ Persist across app restart (offline)
✅ Auto-sync when network returns
✅ No data from other communities visible
✅ Multiple create/edit/delete cycles work
✅ Add persons to households offline

---

## Next Steps After Testing

If all tests pass:
- ✅ Phase 3 complete
- ⏭️ Phase 4: Expand to care episodes, visits, appointments
- ⏭️ Phase 5: TanStack Query for dashboards

If issues found:
1. Note the exact behavior
2. Check console for errors
3. Verify MMKV/Legend State setup
4. Check Supabase RLS policies

---

## Test Report Template

When done, reply with:

```
✅ Test 1: Basic Create & Persist - [PASS/FAIL]
✅ Test 2: Add Person to Household - [PASS/FAIL]
✅ Test 3: Kill App with Data - [PASS/FAIL]
✅ Test 4: Airplane Mode - Create More - [PASS/FAIL]
✅ Test 5: Airplane Mode - App Restart - [PASS/FAIL]
✅ Test 6: Network Restore - Auto Sync - [PASS/FAIL]
✅ Test 7: Verify Community Filtering - [PASS/FAIL]
✅ Test 8: Network Down - Create More - [PASS/FAIL]

Issues found: [None / List here]
```

Good luck! 🚀
