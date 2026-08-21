# Sync Order & Foreign Key Constraints

## The Problem You Hit

When syncing offline data to Supabase:
```
Error: Foreign key constraint violation
Details: "Key is not present in table 'households'"
```

**Why?** Persons were syncing before their parent households had synced.

---

## How Sync Works Now

### 1. **Sync Households First**
```
User creates HH-001 (offline)
    ↓
Sync households$ to Supabase
    ↓
✅ HH-001 now in database
```

### 2. **Then Sync Persons**
```
User adds Mary to HH-001 (offline)
    ↓
Sync persons$ to Supabase
    ↓
Mary's household_id references HH-001
    ↓
✅ Foreign key constraint satisfied
```

---

## What Changed in Code

### Detection Logic
```typescript
// When syncing person, check for FK errors
if (error?.code === "23503") {
  // Foreign key constraint
  console.log("[Persons] ⏭️ Skipping (household not synced yet)");
  skippedCount++;  // Don't count as failed
}
```

### Retry Strategy
```
Sync persons → Some skipped (FK issue)
    ↓
Wait 2 seconds (time for households to sync)
    ↓
Retry persons → Households now exist
    ↓
✅ Persons now sync successfully
```

---

## Sync Flow Diagram

```
App comes online
    ↓
syncHouseholdsToSupabase() starts
    ↓
All households sync first
    ↓
syncPersonsToSupabase() starts
    ↓
Person 1: household exists? ✅ Sync
Person 2: household exists? ✅ Sync
Person 3: household exists? ⏭️ Skip (not synced yet)
    ↓
2 second delay
    ↓
Retry persons that were skipped
    ↓
Person 3: household now exists? ✅ Sync
    ↓
✅ All data synced
```

---

## Console Output

You'll now see:
```
[Persons] Syncing: person-id-1
[Persons] ✅ Synced: person-id-1

[Persons] Syncing: person-id-2
[Persons] ⏭️ Skipping (household not synced yet): person-id-2

[Persons] Sync complete: 1 synced, 1 skipped, 0 failed

[Persons] Retrying skipped syncs (households may now be synced)...
[Persons] Syncing: person-id-2
[Persons] ✅ Synced: person-id-2

[Persons] Sync complete: 1 synced, 0 skipped, 0 failed
```

---

## Key Points

✅ **Automatic Retry** - Skipped persons automatically retry after 2 seconds
✅ **No Manual Fix** - You don't need to do anything, it handles itself
✅ **Graceful Degradation** - FK errors don't block other syncs
✅ **Separate Counters** - Skipped ≠ Failed, so retries work correctly
✅ **Logs Show Status** - See exactly what's syncing and why

---

## Test It

```
1. Disable internet/airplane mode
2. Create household "HH-001"
3. Add person "Mary" to HH-001
4. Kill app
5. Restart app
6. Enable internet
7. Wait 3-5 seconds
✅ Check logs:
   - Households sync first
   - Persons may be skipped initially
   - Persons retry after households are synced
   - All data now in Supabase!
```

---

## How to Handle Other Foreign Keys

Same pattern works for any parent-child relationship:

**Care Episodes** → **Visits**
```typescript
if (error?.code === "23503") {
  console.log("[Visits] ⏭️ Skipping (episode not synced yet)");
  skippedCount++;
}
```

**Visits** → **Assessments**
```typescript
if (error?.code === "23503") {
  console.log("[Assessments] ⏭️ Skipping (visit not synced yet)");
  skippedCount++;
}
```

---

## Summary

**Problem:** Persons syncing before households → FK constraint violation
**Solution:** Catch FK errors (code 23503) and retry after 2 seconds
**Result:** Automatic sync order enforcement without manual coordination

The system now handles complex data dependencies automatically! 🚀
